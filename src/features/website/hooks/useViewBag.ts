import { useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { useViewBagMutations } from './useViewBagMutations'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'
import { usePayments } from './usePayments'
import { usePersistedModalState, useToast } from '@/hooks'
import { useMemberMustCompleteOnboardingForCustomCards } from './useMemberMustCompleteOnboardingForCustomCards'
import { useGuestRecipientsByCartItems } from './useGuestQueries'
import { MODAL_NAMES } from '@/utils/constants'
import { getCardBackground, getCardTypeName, resolveMediaUrl } from '@/utils/cardDisplay'
import { filterShoppingCarts } from '@/features/website/utils/cartFilters'
import type { FlattenedCartItem } from '@/types'
import { flattenServerCartItems } from '@/features/website/utils/guestLocalCartDisplay'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import { getRecipientsForCartUnit, type CartRecipient } from '@/features/website/utils/cartRecipientUnits'
import {
  canRemoveCartItem,
  canUpdateCartItemQuantity,
  normalizeCartStatus,
} from '@/features/website/utils/cartLifecycle'
import {
  computeAmountCharged,
  computeServiceFee,
  resolveServiceFeeRate,
} from '@/utils/pricingFees'

function resolveRecipientDeleteId(recipient: unknown): string | null {
  if (!recipient || typeof recipient !== 'object') return null
  const r = recipient as Record<string, unknown>
  const keys = [
    'recipient_id',
    'recipientId',
    'id',
    'cart_recipient_id',
    'cartRecipientId',
    'draftId',
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
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { recipientActionsBlocked } = useMemberMustCompleteOnboardingForCustomCards()

  const userCart = useCart()
  const guestCart = useGuestCart()
  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoadingCart = isGuestAuth ? guestCart.isLoading : userCart.isLoading
  const updateCartItemAsync = isGuestAuth
    ? guestCart.updateCartItemAsync
    : userCart.updateCartItemAsync
  const isUpdating = isGuestAuth ? guestCart.isUpdating : userCart.isUpdating
  const deleteCartItemAsync = isGuestAuth
    ? guestCart.deleteCartItemAsync
    : userCart.deleteCartItemAsync

  const toast = useToast()
  const { deleteRecipientMutation } = useViewBagMutations()
  const { useGetCartAllRecipientsService } = usePublicCatalogQueries()
  const { useServiceFeesConfig } = usePayments()
  const { data: serviceFeesConfig } = useServiceFeesConfig()
  useGetCartAllRecipientsService(!isGuestAuth)

  const modal = usePersistedModalState<{
    cart_item_id: string | number
    cardType?: string
    cardProduct?: string
    cardCurrency?: string
    amount?: number
    recipient_id?: string | number
    recipient_name?: string
    recipient_phone?: string
    recipient_email?: string
    message?: string
    assign_to_self?: boolean
    quantity_index?: number
    local_draft_id?: string
  }>({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recipientToDelete, setRecipientToDelete] = useState<{
    lineId?: string
    draftId?: string
    name?: string
    recipient_name?: string
    email?: string
    recipient_email?: string
    phone?: string
    recipient_phone?: string
    amount?: string | number
    recipient_amount?: string | number
  } | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | number | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | number | null>(null)

  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return filterShoppingCarts(cartItems)
  }, [cartItems])

  const apiDisplayCartItems = useMemo(
    () => flattenServerCartItems(activeCartItems),
    [activeCartItems],
  )

  const displayCartItems = apiDisplayCartItems

  const checkoutCartStatus = activeCartItems[0]?.cart_status ?? 'active'

  const hasFailedCheckoutCart = normalizeCartStatus(checkoutCartStatus) === 'failed'

  const guestCartItemIds = useMemo(
    () =>
      isGuestAuth
        ? displayCartItems
            .map((item) => item.cart_item_id)
            .filter((id): id is string | number => id != null && id !== '')
        : [],
    [displayCartItems, isGuestAuth],
  )

  const { recipientsByCartItem: guestRecipientsByCartItem } = useGuestRecipientsByCartItems(
    guestCartItemIds,
    isGuestAuth,
  )

  const recipientsByCartItem = useMemo(() => {
    const map: Record<string, any[]> = {}
    if (isGuestAuth) {
      displayCartItems.forEach((item) => {
        const cid = item.cart_item_id
        if (cid == null || cid === '') return
        const key = `${cid}-${item.quantity_index ?? 0}`
        const all = (guestRecipientsByCartItem[String(cid)] ?? []) as CartRecipient[]
        const unitAmount = parseFloat(item.amount || '0')
        map[key] = getRecipientsForCartUnit(all, item.quantity_index ?? 0, unitAmount)
      })
      return map
    }
    displayCartItems.forEach((item) => {
      const cid = item.cart_item_id
      if (cid == null || cid === '') return
      const recipients = (item.recipients ?? []) as CartRecipient[]
      const qty = item.total_quantity || 1
      const lineTotal = parseFloat(item.amount || '0')
      const unitAmount = qty > 0 ? lineTotal / qty : lineTotal
      for (let i = 0; i < qty; i++) {
        const key = `${cid}-${i}`
        map[key] = getRecipientsForCartUnit(recipients, i, unitAmount)
      }
    })
    return map
  }, [displayCartItems, isGuestAuth, guestRecipientsByCartItem])

  const subtotalFromApi = useMemo(
    () => activeCartItems.reduce((sum, cart) => sum + parseFloat(cart.total_amount || '0'), 0),
    [activeCartItems],
  )
  const totalItemsFromApi = useMemo(
    () =>
      activeCartItems.reduce((total, cart) => {
        if (!cart.items) return total
        const arr = Array.isArray(cart.items) ? cart.items : [cart.items]
        return (
          total +
          arr.reduce((sum, item) => sum + (item.total_quantity || 1), 0)
        )
      }, 0),
    [activeCartItems],
  )

  const subtotal = subtotalFromApi
  const totalItems = totalItemsFromApi
  const serviceFeeRate = resolveServiceFeeRate(serviceFeesConfig?.serviceFeeRate)
  const serviceFee = computeServiceFee(subtotal, serviceFeeRate)
  const total = computeAmountCharged(subtotal, serviceFeeRate)

  const handleRemoveItem = useCallback(
    async (cartItemId: string | number, cartStatus?: string) => {
      if (isLocalGuestCartLineId(cartItemId)) return
      if (!canRemoveCartItem(cartStatus)) {
        toast.error('This cart can no longer be modified.')
        return
      }
      setDeletingItemId(cartItemId)
      try {
        await deleteCartItemAsync(cartItemId)
      } catch (error) {
        console.error('Failed to remove cart item', error)
      } finally {
        setDeletingItemId(null)
      }
    },
    [deleteCartItemAsync, toast],
  )

  const handleQuantityChange = useCallback(
    async (cartItemId: string | number, quantity: number, cartStatus?: string) => {
      if (isLocalGuestCartLineId(cartItemId)) return
      if (quantity < 1) {
        await handleRemoveItem(cartItemId, cartStatus)
        return
      }
      if (!canUpdateCartItemQuantity(cartStatus)) {
        toast.error('This cart can no longer be changed. Remove the item or start a new order.')
        return
      }
      setUpdatingItemId(cartItemId)
      try {
        await updateCartItemAsync({ cart_item_id: cartItemId, quantity })
      } catch (error) {
        console.error('Failed to update cart item quantity', error)
      } finally {
        setUpdatingItemId(null)
      }
    },
    [updateCartItemAsync, handleRemoveItem, toast],
  )

  const handleAddRecipient = useCallback(
    (item: FlattenedCartItem) => {
      if (recipientActionsBlocked) return
      const amount = parseFloat(item.amount || '0')
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id!,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount,
        quantity_index: item.quantity_index ?? 0,
      })
    },
    [modal, recipientActionsBlocked],
  )

  const handleEditRecipient = useCallback(
    (item: FlattenedCartItem, recipient: Record<string, unknown>) => {
      if (recipientActionsBlocked) return
      const amount = parseFloat(
        String(recipient.amount ?? recipient.recipient_amount ?? item.amount ?? '0'),
      )
      const recipientId = resolveRecipientDeleteId(recipient)
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id!,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount,
        quantity_index: item.quantity_index ?? 0,
        recipient_id: isLocalGuestCartLineId(item.cart_item_id) ? undefined : recipientId ?? undefined,
        local_draft_id: isLocalGuestCartLineId(item.cart_item_id) ? recipientId ?? undefined : undefined,
        recipient_name: String(recipient.name ?? recipient.recipient_name ?? ''),
        recipient_phone: String(recipient.phone ?? recipient.recipient_phone ?? ''),
        recipient_email: String(recipient.email ?? recipient.recipient_email ?? ''),
        message: String(recipient.message ?? ''),
        assign_to_self: Boolean(recipient.assign_to_self),
      })
    },
    [modal, recipientActionsBlocked],
  )

  const handleDeleteRecipient = useCallback((recipient: any, lineId?: string) => {
    setRecipientToDelete({
      lineId,
      draftId: recipient.draftId ?? resolveRecipientDeleteId(recipient) ?? undefined,
      name: recipient.name ?? recipient.recipient_name,
      recipient_name: recipient.recipient_name,
      email: recipient.email ?? recipient.recipient_email,
      recipient_email: recipient.recipient_email,
      phone: recipient.phone ?? recipient.recipient_phone,
      recipient_phone: recipient.recipient_phone,
      amount: recipient.amount ?? recipient.recipient_amount,
      recipient_amount: recipient.recipient_amount,
    })
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
    isGuestCart: isGuestAuth,
    isLoading: isLoadingCart,
    localLines: [] as const,
    removeGuestItem: async () => {},
    updateGuestQuantity: () => {},
    displayCartItems,
    recipientsByCartItem,
    handleRemoveItem,
    handleQuantityChange,
    isUpdating,
    updatingItemId,
    deletingItemId,
    handleAddRecipient,
    handleEditRecipient,
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
    getCardTypeName,
    getImageUrl: resolveMediaUrl,
    deleteRecipientMutation,
    recipientActionsBlocked,
    canUpdateCartItemQuantity,
    canRemoveCartItem,
    hasFailedCheckoutCart,
    checkoutCtaLabel: hasFailedCheckoutCart ? 'Retry payment' : 'Checkout',
  }
}
