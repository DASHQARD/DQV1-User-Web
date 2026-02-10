import { useMemo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { usePayments } from './usePayments'
import { usePersistedModalState } from '@/hooks'
import { useUserProfile } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients } from '@/features/dashboard/services'
import { UserInfoSchema, type UserInfoFormData } from '@/utils/schemas/checkout'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'

const SERVICE_FEE_MIN = 5.78
const SERVICE_FEE_RATE = 0.05

/** Checkout-specific flattened cart item (one row per quantity unit, with quantity_index) */
export type CheckoutFlattenedCartItem = FlattenedCartItem & {
  quantity_index?: number
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoadingCart = isGuestAuth ? guestCart.isLoading : userCart.isLoading

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useCheckoutService } = usePayments()
  const { mutateAsync: checkoutMutation, isPending: isCheckingOut } = useCheckoutService()

  const userInfoForm = useForm<UserInfoFormData>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      full_name: (userProfileData as any)?.fullname ?? '',
      email: (userProfileData as any)?.email ?? '',
      phone_number: (userProfileData as any)?.phonenumber ?? '',
    },
  })

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isMissingRecipientsModalOpen, setIsMissingRecipientsModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)

  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })

  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems])

  const pendingCartItems = activeCartItems

  const displayCartItems = useMemo(() => {
    const flattened: CheckoutFlattenedCartItem[] = []
    activeCartItems.forEach((cart: CartListResponse) => {
      if (!cart.items) return
      const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
      itemsArray.forEach((item: any) => {
        const qty = item.total_quantity || 1
        for (let i = 0; i < qty; i++) {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined,
            type: item.type || 'dashx',
            currency: 'GHS',
            price: item.total_amount?.toString() || '0',
            amount: item.total_amount?.toString() || '0',
            images: item.images || [],
            cart_item_id: item.cart_item_id,
            total_quantity: qty,
            recipients: item.recipients || [],
            quantity_index: i,
          })
        }
      })
    })
    return flattened
  }, [activeCartItems])

  const recipientsByCartItem = useMemo(() => {
    const map: Record<string, any[]> = {}
    activeCartItems.forEach((cart: CartListResponse) => {
      if (!cart.items) return
      const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
      itemsArray.forEach((item: any) => {
        const recipients = item.recipients ?? []
        const qty = item.total_quantity || 1
        for (let i = 0; i < qty; i++) {
          const key = `${item.cart_item_id}-${i}`
          map[key] = recipients[i] != null ? [recipients[i]] : []
        }
      })
    })
    return map
  }, [activeCartItems])

  const totalAmount = useMemo(
    () => activeCartItems.reduce((sum, cart) => sum + parseFloat(cart.total_amount || '0'), 0),
    [activeCartItems],
  )
  const serviceFee = Math.max(SERVICE_FEE_MIN, totalAmount * SERVICE_FEE_RATE)
  const amountDue = totalAmount + serviceFee

  const isUserInfoIncomplete = !userInfoForm.watch('full_name') || !userInfoForm.watch('email')

  const itemsMissingRecipients = useMemo(() => {
    return displayCartItems.filter((item) => {
      const key =
        item.cart_item_id != null ? `${item.cart_item_id}-${item.quantity_index ?? 0}` : ''
      const count = key ? (recipientsByCartItem[key]?.length ?? 0) : 0
      return count < 1
    })
  }, [displayCartItems, recipientsByCartItem])

  const handleCheckout = useCallback(() => {
    const firstCart = activeCartItems[0]
    if (!firstCart) return
    const values = userInfoForm.getValues()
    checkoutMutation({
      cart_id: firstCart.cart_id,
      full_name: values.full_name,
      email: values.email,
      phone_number: values.phone_number,
      amount_due: amountDue,
      user_id: 0,
    } as any)
  }, [activeCartItems, amountDue, userInfoForm, checkoutMutation])

  const bulkAssignMutation = useMutation({
    mutationFn: (file: File) => bulkAssignRecipients(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['cart-all-recipients'] })
      setBulkFile(null)
      setIsBulkModalOpen(false)
    },
  })

  const handleBulkUpload = useCallback(() => {
    if (!bulkFile) return
    bulkAssignMutation.mutate(bulkFile)
  }, [bulkFile, bulkAssignMutation])

  const openAssignModal = useCallback(
    (item: CheckoutFlattenedCartItem) => {
      if (!item.cart_item_id) return
      const amount = parseFloat(item.amount || '0')
      const totalQuantity = item.total_quantity || 1
      const perRecipientAmount = totalQuantity > 0 ? amount / totalQuantity : amount
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount: perRecipientAmount,
      })
    },
    [modal],
  )

  const openAssignModalFromMissing = useCallback(
    (item: CheckoutFlattenedCartItem) => {
      setIsMissingRecipientsModalOpen(false)
      openAssignModal(item)
    },
    [openAssignModal],
  )

  return {
    isLoadingCart,
    pendingCartItems,
    displayCartItems,
    totalAmount,
    serviceFee,
    amountDue,
    userInfoForm,
    userInfo: userInfoForm.watch(),
    isUserInfoIncomplete,
    recipientsByCartItem,
    itemsMissingRecipients,
    allRecipientsAssigned: itemsMissingRecipients.length === 0,
    handleCheckout,
    bulkAssignMutation,
    handleBulkUpload,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
    openAssignModal,
    openAssignModalFromMissing,
    isCheckingOut,
    isBulkModalOpen,
    setIsBulkModalOpen,
    isMissingRecipientsModalOpen,
    setIsMissingRecipientsModalOpen,
    bulkFile,
    setBulkFile,
  }
}
