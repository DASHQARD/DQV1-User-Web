import React, { useMemo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { usePayments } from './usePayments'
import { usePersistedModalState, useToast } from '@/hooks'
import { useUserProfile } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients } from '@/features/dashboard/services'
import {
  UserInfoSchema,
  PaymentMethodSchema,
  type UserInfoFormData,
  type PaymentMethodFormData,
} from '@/utils/schemas/checkout'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'
import type { CheckoutPayloadBase, GuestCheckoutPayloadBase } from '@/types/responses'
import type { CheckoutPayload, GuestCheckoutPayload } from '@/types'
import { CHECKOUT_GATEWAY } from '@/features/website/utils/paymentConstants'
import {
  appendGatewayFields,
  isHostedRedirectGateway,
  roundCheckoutAmount,
} from '@/features/website/utils/checkoutPayload'
import type { CheckoutFollowUp } from '@/features/website/utils/checkoutRedirect'
import { getGuestCart, resolveGuestCartUuid } from '@/features/website/services/cards'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import {
  getGuestEmailFromAuth,
  getGuestNameFromAuth,
  getGuestPhoneFromAuth,
} from '@/features/website/utils/guestAuth'
import { useMemberMustCompleteOnboardingForCustomCards } from './useMemberMustCompleteOnboardingForCustomCards'

/** Checkout-specific flattened cart item (one row per quantity unit, with quantity_index) */
export type CheckoutFlattenedCartItem = FlattenedCartItem & {
  quantity_index?: number
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { recipientActionsBlocked } = useMemberMustCompleteOnboardingForCustomCards()
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoadingCart = isGuestAuth ? guestCart.isLoading : userCart.isLoading

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const guestCartRefetch = guestCart.refetch
  const { useCheckoutService, useGuestCheckoutService, usePaymentProviderConfig, useServiceFeesConfig } =
    usePayments()
  const { mutateAsync: checkoutMutation, isPending: isMemberCheckingOut } = useCheckoutService()
  const { mutateAsync: guestCheckoutMutation, isPending: isGuestCheckingOut } = useGuestCheckoutService(
    {
      onCartRefetch: () => {
        void guestCartRefetch()
      },
    },
  )
  const isCheckingOut = isGuestAuth ? isGuestCheckingOut : isMemberCheckingOut
  const setGuestCartUuid = useAuthStore((s) => s.setGuestCartUuid)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const { data: paymentProviderConfig } = usePaymentProviderConfig()
  const { data: serviceFeesConfig } = useServiceFeesConfig()

  const checkoutGateway = (paymentProviderConfig?.checkout_gateway ?? '').toLowerCase()

  const isPersonalDetailsCompleted =
    (userProfileData as any)?.onboarding_progress?.personal_details_completed === true

  const userInfoForm = useForm<UserInfoFormData>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      full_name: (userProfileData as any)?.fullname ?? '',
      email: (userProfileData as any)?.email ?? '',
      phone_number: (userProfileData as any)?.phonenumber ?? '',
    },
  })

  const user = useAuthStore((state) => state.user)

  React.useEffect(() => {
    if (isGuestAuth) {
      userInfoForm.reset({
        full_name: getGuestNameFromAuth(user) || getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY),
        email: getGuestEmailFromAuth(user) || getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY),
        phone_number: getGuestPhoneFromAuth(user),
      })
    } else if (userProfileData) {
      userInfoForm.reset({
        full_name: userProfileData?.fullname ?? '',
        email: userProfileData?.email ?? '',
        phone_number: userProfileData?.phonenumber ?? '',
      })
    }
  }, [isGuestAuth, user, userProfileData, userInfoForm])

  type PaymentMethodFormValues = Omit<PaymentMethodFormData, 'expiry_month' | 'expiry_year'> & {
    expiry_month?: unknown
    expiry_year?: unknown
  }

  const paymentForm = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: {
      payment_method_type: 'mobile_money',
    },
  })

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isMissingRecipientsModalOpen, setIsMissingRecipientsModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [paymentPromptData, setPaymentPromptData] = useState<Record<string, unknown> | null>(null)
  const [isPaymentPromptModalOpen, setIsPaymentPromptModalOpen] = useState(false)

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
        const totalItemAmount = parseFloat(item.total_amount || '0')
        const unitAmount = qty > 0 ? totalItemAmount / qty : totalItemAmount
        for (let i = 0; i < qty; i++) {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined,
            type: item.type || 'dashx',
            currency: 'GHS',
            price: unitAmount.toString(),
            amount: unitAmount.toString(),
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
  const serviceFeeRate = Number(serviceFeesConfig?.serviceFeeRate ?? 0)
  const serviceFee = totalAmount * serviceFeeRate
  const amountDue = totalAmount + serviceFee
  const checkoutAmountDue = totalAmount

  const isUserInfoIncomplete = !userInfoForm.watch('full_name') || !userInfoForm.watch('email')

  const itemsMissingRecipients = useMemo(() => {
    return displayCartItems.filter((item) => {
      const key =
        item.cart_item_id != null ? `${item.cart_item_id}-${item.quantity_index ?? 0}` : ''
      const count = key ? (recipientsByCartItem[key]?.length ?? 0) : 0
      return count < 1
    })
  }, [displayCartItems, recipientsByCartItem])

  const applyCheckoutFollowUp = useCallback((followUp: CheckoutFollowUp) => {
    if (followUp.type === 'momo_prompt') {
      setPaymentPromptData(followUp.data)
      setIsPaymentPromptModalOpen(true)
    }
  }, [])

  const resolveGuestCartUuidForCheckout = useCallback(async (): Promise<string | null> => {
    const fromCart = activeCartItems[0]?.guest_cart_uuid
    if (fromCart?.trim()) {
      setGuestCartUuid(fromCart.trim())
      return fromCart.trim()
    }
    const stored = getGuestCartUuid()
    if (stored?.trim()) return stored.trim()
    const cartResponse = await getGuestCart()
    const uuid = resolveGuestCartUuid(cartResponse)
    if (uuid) {
      setGuestCartUuid(uuid)
      return uuid
    }
    return null
  }, [activeCartItems, getGuestCartUuid, setGuestCartUuid])

  const handleCheckout = useCallback(async () => {
    if (recipientActionsBlocked) {
      toast.error('Complete onboarding in your dashboard before checkout.')
      return
    }
    if (itemsMissingRecipients.length > 0) {
      setIsMissingRecipientsModalOpen(true)
      return
    }
    const contactValid = await userInfoForm.trigger()
    if (!contactValid) return

    const firstCart = activeCartItems[0]
    if (!firstCart) return

    const userValues = userInfoForm.getValues()
    const gateway = checkoutGateway
    const paymentValues = paymentForm.getValues()
    const paymentMethod = paymentValues.payment_method_type ?? 'mobile_money'
    const phone = userValues.phone_number ?? ''
    const amountDue = roundCheckoutAmount(checkoutAmountDue)

    const runMutation = async (payload: CheckoutPayload | GuestCheckoutPayload) => {
      const result = isGuestAuth
        ? await guestCheckoutMutation(payload as GuestCheckoutPayload)
        : await checkoutMutation(payload as CheckoutPayload)
      applyCheckoutFollowUp(result.followUp)
      return result
    }

    if (isGuestAuth) {
      const guestCartUuid = await resolveGuestCartUuidForCheckout()
      if (!guestCartUuid) {
        toast.error('Could not load your cart. Please refresh the page and try again.')
        void guestCartRefetch()
        return
      }

      const guestBase: GuestCheckoutPayloadBase = {
        guest_cart_id: guestCartUuid,
        full_name: userValues.full_name,
        email: userValues.email,
        phone_number: userValues.phone_number,
        amount_due: amountDue,
      }

      if (isHostedRedirectGateway(gateway)) {
        await runMutation(guestBase)
        return
      }

      if (gateway === CHECKOUT_GATEWAY.EGNANOW) {
        if (paymentMethod === 'mobile_money') {
          const valid = await paymentForm.trigger('paypartner_code')
          if (!valid) return
          if (!paymentValues.paypartner_code) return
        } else if (paymentMethod === 'card') {
          const valid = await paymentForm.trigger([
            'card_number',
            'expiry_month',
            'expiry_year',
            'cvv',
          ])
          if (!valid) return
          const { card_number, expiry_month, expiry_year, cvv } = paymentForm.getValues()
          if (!card_number || expiry_month == null || expiry_year == null || !cvv) return
        }
        await runMutation(
          appendGatewayFields(guestBase, gateway, paymentMethod, phone, paymentValues) as GuestCheckoutPayload,
        )
        return
      }

      if (gateway === CHECKOUT_GATEWAY.KOWRI) {
        if (paymentMethod === 'mobile_money') {
          const valid = await paymentForm.trigger('kowri_provider')
          if (!valid) return
          if (!paymentValues.kowri_provider) return
        }
        await runMutation(
          appendGatewayFields(guestBase, gateway, paymentMethod, phone, paymentValues) as GuestCheckoutPayload,
        )
        return
      }

      await runMutation(guestBase)
      return
    }

    const memberBase: CheckoutPayloadBase = {
      cart_id: firstCart.cart_id,
      full_name: userValues.full_name,
      email: userValues.email,
      phone_number: userValues.phone_number,
      amount_due: amountDue,
    }

    if (isHostedRedirectGateway(gateway)) {
      await runMutation(memberBase)
      return
    }

    if (gateway === CHECKOUT_GATEWAY.EGNANOW) {
      if (paymentMethod === 'mobile_money') {
        const valid = await paymentForm.trigger('paypartner_code')
        if (!valid) return
        if (!paymentValues.paypartner_code) return
      } else if (paymentMethod === 'card') {
        const valid = await paymentForm.trigger([
          'card_number',
          'expiry_month',
          'expiry_year',
          'cvv',
        ])
        if (!valid) return
        const { card_number, expiry_month, expiry_year, cvv } = paymentForm.getValues()
        if (!card_number || expiry_month == null || expiry_year == null || !cvv) return
      }
      await runMutation(
        appendGatewayFields(memberBase, gateway, paymentMethod, phone, paymentValues) as CheckoutPayload,
      )
      return
    }

    if (gateway === CHECKOUT_GATEWAY.KOWRI) {
      if (paymentMethod === 'mobile_money') {
        const valid = await paymentForm.trigger('kowri_provider')
        if (!valid) return
        if (!paymentValues.kowri_provider) return
      }
      await runMutation(
        appendGatewayFields(memberBase, gateway, paymentMethod, phone, paymentValues) as CheckoutPayload,
      )
      return
    }

    await runMutation(memberBase)
  }, [
    isGuestAuth,
    activeCartItems,
    checkoutAmountDue,
    userInfoForm,
    paymentForm,
    checkoutGateway,
    checkoutMutation,
    guestCheckoutMutation,
    itemsMissingRecipients,
    recipientActionsBlocked,
    toast,
    applyCheckoutFollowUp,
    resolveGuestCartUuidForCheckout,
    guestCartRefetch,
  ])

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
      if (recipientActionsBlocked) return
      if (!item.cart_item_id) return
      const perRecipientAmountRaw = parseFloat(item.amount || '0')
      // DashPro amount input uses step=0.01; round to 2dp to avoid browser "nearest valid values" errors
      const perRecipientAmount = Math.round(perRecipientAmountRaw * 100) / 100
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount: perRecipientAmount,
      })
    },
    [modal, recipientActionsBlocked],
  )

  const openAssignModalFromMissing = useCallback(
    (item: CheckoutFlattenedCartItem) => {
      if (recipientActionsBlocked) return
      setIsMissingRecipientsModalOpen(false)
      openAssignModal(item)
    },
    [openAssignModal, recipientActionsBlocked],
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
    paymentForm,
    paymentMethod: paymentForm.watch(),
    checkoutGateway,
    isPersonalDetailsCompleted,
    isUserInfoIncomplete,
    recipientsByCartItem,
    itemsMissingRecipients,
    allRecipientsAssigned: itemsMissingRecipients.length === 0,
    recipientActionsBlocked,
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
    paymentPromptData,
    isPaymentPromptModalOpen,
    setIsPaymentPromptModalOpen,
    /** @deprecated use paymentPromptData */
    kowriCheckoutData: paymentPromptData,
    /** @deprecated use isPaymentPromptModalOpen */
    isKowriPromptModalOpen: isPaymentPromptModalOpen,
    /** @deprecated use setIsPaymentPromptModalOpen */
    setIsKowriPromptModalOpen: setIsPaymentPromptModalOpen,
  }
}
