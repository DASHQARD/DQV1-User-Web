import { useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { useViewBagMutations } from './useViewBagMutations'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'
import { usePayments } from './usePayments'
import { usePersistedModalState, useToast } from '@/hooks'
import { useMemberMustCompleteOnboardingForCustomCards } from './useMemberMustCompleteOnboardingForCustomCards'
import { useGuestRecipientsByCartItems } from './useGuestQueries'
import { MODAL_NAMES } from '@/utils/constants'
import { getCardBackground, getImageUrl } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'
import {
  flattenLocalGuestCartLines,
  localRecipientToDisplayRow,
} from '@/features/website/utils/guestLocalCartDisplay'
import { getRecipientsForCartUnit, type CartRecipient } from '@/features/website/utils/cartRecipientUnits'
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { recipientActionsBlocked } = useMemberMustCompleteOnboardingForCustomCards()
  const isLocalGuestCart = !isAuthenticated && !isGuestAuth

  const localLines = useGuestLocalCartStore((s) => s.lines)
  const removeLocalLine = useGuestLocalCartStore((s) => s.removeLine)
  const updateLocalLineQuantity = useGuestLocalCartStore((s) => s.updateLineQuantity)
  const removeLocalRecipientDraft = useGuestLocalCartStore((s) => s.removeRecipientDraft)
  const getLocalSubtotal = useGuestLocalCartStore((s) => s.getSubtotal)
  const getLocalTotalItems = useGuestLocalCartStore((s) => s.getTotalItems)

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
  useGetCartAllRecipientsService(!isGuestAuth && !isLocalGuestCart)

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

  const activeCartItems = useMemo(() => {
    if (isLocalGuestCart) return []
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems, isLocalGuestCart])

  const apiDisplayCartItems = useMemo(() => {
    if (isLocalGuestCart) return []
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
  }, [activeCartItems, isLocalGuestCart])

  const localDisplayCartItems = useMemo(
    () => (isLocalGuestCart ? flattenLocalGuestCartLines(localLines) : []),
    [isLocalGuestCart, localLines],
  )

  const displayCartItems = isLocalGuestCart ? localDisplayCartItems : apiDisplayCartItems

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
    if (isLocalGuestCart) {
      displayCartItems.forEach((item) => {
        const cid = item.cart_item_id
        if (cid == null || cid === '') return
        const key = `${cid}-${item.quantity_index ?? 0}`
        const draft = localLines
          .find((l) => l.lineId === cid)
          ?.recipientDrafts.find((d) => d.quantity_index === (item.quantity_index ?? 0))
        map[key] = draft ? [localRecipientToDisplayRow(draft)] : []
      })
      return map
    }
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
      map[String(cid)] = item.recipients ?? []
    })
    return map
  }, [displayCartItems, isGuestAuth, isLocalGuestCart, localLines, guestRecipientsByCartItem])

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

  const subtotal = isLocalGuestCart ? getLocalSubtotal() : subtotalFromApi
  const totalItems = isLocalGuestCart ? getLocalTotalItems() : totalItemsFromApi
  const serviceFeeRate = resolveServiceFeeRate(serviceFeesConfig?.serviceFeeRate)
  const serviceFee = computeServiceFee(subtotal, serviceFeeRate)
  const total = computeAmountCharged(subtotal, serviceFeeRate)

  const handleRemoveItem = useCallback(
    async (cartItemId: string | number) => {
      if (isLocalGuestCart) {
        removeLocalLine(String(cartItemId))
        return
      }
      await deleteCartItemAsync(cartItemId)
    },
    [deleteCartItemAsync, isLocalGuestCart, removeLocalLine],
  )

  const handleQuantityChange = useCallback(
    (cartItemId: string | number, quantity: number) => {
      if (isLocalGuestCart) {
        updateLocalLineQuantity(String(cartItemId), quantity)
        return
      }
      if (quantity < 1) {
        handleRemoveItem(cartItemId)
        return
      }
      updateCartItem({ cart_item_id: cartItemId, quantity })
    },
    [updateCartItem, handleRemoveItem, isLocalGuestCart, updateLocalLineQuantity],
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
        recipient_id: isLocalGuestCart ? undefined : recipientId ?? undefined,
        local_draft_id: isLocalGuestCart ? recipientId ?? undefined : undefined,
        recipient_name: String(recipient.name ?? recipient.recipient_name ?? ''),
        recipient_phone: String(recipient.phone ?? recipient.recipient_phone ?? ''),
        recipient_email: String(recipient.email ?? recipient.recipient_email ?? ''),
        message: String(recipient.message ?? ''),
        assign_to_self: Boolean(recipient.assign_to_self),
      })
    },
    [modal, recipientActionsBlocked, isLocalGuestCart],
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
    if (isLocalGuestCart && recipientToDelete?.lineId && recipientToDelete.draftId) {
      removeLocalRecipientDraft(recipientToDelete.lineId, recipientToDelete.draftId)
      setIsDeleteModalOpen(false)
      setRecipientToDelete(null)
      return
    }
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
  }, [recipientToDelete, deleteRecipientMutation, toast, isLocalGuestCart, removeLocalRecipientDraft])

  return {
    isGuestCart: isLocalGuestCart,
    isLoading: isLocalGuestCart ? false : isLoadingCart,
    localLines,
    removeGuestItem: removeLocalLine,
    updateGuestQuantity: updateLocalLineQuantity,
    displayCartItems,
    recipientsByCartItem,
    handleRemoveItem,
    handleQuantityChange,
    isUpdating: isLocalGuestCart ? false : isUpdating,
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
    getImageUrl,
    deleteRecipientMutation,
    recipientActionsBlocked,
  }
}
