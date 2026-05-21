import { useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useCartStore } from '@/stores/cart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { useViewBagMutations } from './useViewBagMutations'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'
import { usePayments } from './usePayments'
import { usePersistedModalState, useToast } from '@/hooks'
import { useMemberMustCompleteOnboardingForCustomCards } from './useMemberMustCompleteOnboardingForCustomCards'
import { MODAL_NAMES } from '@/utils/constants'
import { getCardBackground, getImageUrl } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'

/**
 * Id for DELETE /carts/recipients/:id. Supports UUID strings (e.g. v7) and legacy numeric ids.
 * Never coerce with Number() — UUID strings become NaN and delete would be skipped.
 */
function resolveRecipientDeleteId(recipient: unknown): string | null {
  if (!recipient || typeof recipient !== 'object') return null
  const r = recipient as Record<string, unknown>
  const keys = [
    'recipient_id',
    'recipientId',
    'id',
    'cart_recipient_id',
    'cartRecipientId',
  ] as const
  for (const key of keys) {
    const raw = r[key]
    if (raw == null || raw === '') continue
    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim()
    if (s.length > 0) return s
  }
  return null
}

export function useViewBag() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { recipientActionsBlocked } = useMemberMustCompleteOnboardingForCustomCards()
  /** Legacy local-store bag (unauthenticated). OTP guests use API guest cart via isGuestAuth. */
  const isGuestCart = !isAuthenticated && !isGuestAuth

  const {
    items: guestItems,
    removeItem: removeGuestItem,
    updateQuantity: updateGuestQuantity,
    getTotalPrice: getGuestTotalPrice,
    getTotalItems: getGuestTotalItems,
  } = useCartStore()

  const userCart = useCart()
  const guestCart = useGuestCart()
  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoadingCart = isGuestAuth ? guestCart.isLoading : userCart.isLoading
  const updateCartItem = isGuestAuth ? guestCart.updateCartItem : userCart.updateCartItem
  const isUpdating = isGuestAuth ? guestCart.isUpdating : userCart.isUpdating
  const deleteCartItemAsync = isGuestAuth
    ? guestCart.deleteCartItemAsync
    : userCart.deleteCartItemAsync

  const toast = useToast()
  const { deleteRecipientMutation } = useViewBagMutations()
  const { useGetCartAllRecipientsService } = usePublicCatalogQueries()
  const { useServiceFeesConfig } = usePayments()
  const { data: serviceFeesConfig } = useServiceFeesConfig()
  /** Members only — guests load recipients from GET /guest-carts/items on each cart line */
  useGetCartAllRecipientsService(!isGuestAuth)

  const modal = usePersistedModalState<{
    cart_item_id: string | number
    cardType?: string
    cardProduct?: string
    cardCurrency?: string
    amount?: number
  }>({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recipientToDelete, setRecipientToDelete] = useState<any | null>(null)

  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems])

  const displayCartItems = useMemo(() => {
    if (!Array.isArray(activeCartItems)) return []
    const flattened: FlattenedCartItem[] = []
    activeCartItems.forEach((cart: CartListResponse) => {
      if (cart.items) {
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
        itemsArray.forEach((item: any) => {
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
            total_quantity: item.total_quantity || 1,
            recipients: item.recipients || [],
          })
        })
      }
    })
    return flattened
  }, [activeCartItems])

  const recipientsByCartItem = useMemo(() => {
    const map: Record<string, any[]> = {}
    displayCartItems.forEach((item) => {
      const cid = item.cart_item_id
      if (cid != null && cid !== '') {
        map[String(cid)] = item.recipients ?? []
      }
    })
    return map
  }, [displayCartItems])

  const subtotalFromApi = useMemo(
    () => activeCartItems.reduce((sum, cart) => sum + parseFloat(cart.total_amount || '0'), 0),
    [activeCartItems],
  )
  const totalItemsFromApi = useMemo(
    () =>
      activeCartItems.reduce((total, cart) => {
        if (!cart.items) return total
        const arr = Array.isArray(cart.items) ? cart.items : [cart.items]
        return total + arr.length
      }, 0),
    [activeCartItems],
  )

  const subtotal = isGuestCart ? getGuestTotalPrice() : subtotalFromApi
  const totalItems = isGuestCart ? getGuestTotalItems() : totalItemsFromApi
  const serviceFeeRate = Number(serviceFeesConfig?.serviceFeeRate ?? 0)
  const serviceFee = subtotal * serviceFeeRate
  const total = subtotal + serviceFee

  const handleRemoveItem = useCallback(
    async (cartItemId: string | number) => {
      await deleteCartItemAsync(cartItemId)
    },
    [deleteCartItemAsync],
  )

  const handleQuantityChange = useCallback(
    (cartItemId: string | number, quantity: number) => {
      if (quantity < 1) {
        handleRemoveItem(cartItemId)
        return
      }
      updateCartItem({ cart_item_id: cartItemId, quantity })
    },
    [updateCartItem, handleRemoveItem],
  )

  const handleAddRecipient = useCallback(
    (item: FlattenedCartItem) => {
      if (recipientActionsBlocked) return
      const amount = parseFloat(item.amount || '0')
      const totalQuantity = item.total_quantity || 1
      const perRecipientAmount = totalQuantity > 0 ? amount / totalQuantity : amount
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id!,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount: perRecipientAmount,
      })
    },
    [modal, recipientActionsBlocked],
  )

  const handleDeleteRecipient = useCallback((recipient: any) => {
    setRecipientToDelete(recipient)
    setIsDeleteModalOpen(true)
  }, [])

  const confirmDeleteRecipient = useCallback(() => {
    const recipientId = resolveRecipientDeleteId(recipientToDelete)
    if (recipientId) {
      deleteRecipientMutation.mutate(recipientId, {
        onSettled: () => {
          setIsDeleteModalOpen(false)
          setRecipientToDelete(null)
        },
      })
    } else {
      toast.error(
        'Could not remove this recipient (missing id). Refresh the page or contact support if this keeps happening.',
      )
      setIsDeleteModalOpen(false)
      setRecipientToDelete(null)
    }
  }, [recipientToDelete, deleteRecipientMutation, toast])

  return {
    isGuestCart,
    isLoading: isLoadingCart,
    guestItems,
    removeGuestItem,
    updateGuestQuantity,
    displayCartItems,
    recipientsByCartItem,
    handleRemoveItem,
    handleQuantityChange,
    isUpdating,
    handleAddRecipient,
    handleDeleteRecipient,
    confirmDeleteRecipient,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    recipientToDelete,
    setRecipientToDelete,
    subtotal,
    totalItems,
    serviceFee,
    total,
    getCardBackground,
    getImageUrl,
    deleteRecipientMutation,
    recipientActionsBlocked,
  }
}
