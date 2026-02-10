import { useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/stores'
import { useCartStore } from '@/stores/cart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { useViewBagMutations } from './useViewBagMutations'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'
import { usePersistedModalState } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { getCardBackground, getImageUrl } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'

const SERVICE_FEE_MIN = 5.78
const SERVICE_FEE_RATE = 0.05

export function useViewBag() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isGuestCart = !isAuthenticated

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

  const { deleteRecipientMutation } = useViewBagMutations()
  const { useGetCartAllRecipientsService } = usePublicCatalogQueries()
  useGetCartAllRecipientsService()

  const modal = usePersistedModalState<{
    cart_item_id: number
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
    const map: Record<number, any[]> = {}
    displayCartItems.forEach((item) => {
      if (item.cart_item_id) {
        map[item.cart_item_id] = item.recipients ?? []
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
  const serviceFee = Math.max(SERVICE_FEE_MIN, subtotal * SERVICE_FEE_RATE)
  const total = subtotal + serviceFee

  const handleRemoveItem = useCallback(
    async (cartItemId: number) => {
      await deleteCartItemAsync(cartItemId)
    },
    [deleteCartItemAsync],
  )

  const handleQuantityChange = useCallback(
    (cartItemId: number, quantity: number) => {
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
    [modal],
  )

  const handleDeleteRecipient = useCallback((recipient: any) => {
    setRecipientToDelete(recipient)
    setIsDeleteModalOpen(true)
  }, [])

  const confirmDeleteRecipient = useCallback(() => {
    if (recipientToDelete?.id != null) {
      deleteRecipientMutation.mutate(recipientToDelete.id, {
        onSettled: () => {
          setIsDeleteModalOpen(false)
          setRecipientToDelete(null)
        },
      })
    } else {
      setIsDeleteModalOpen(false)
      setRecipientToDelete(null)
    }
  }, [recipientToDelete, deleteRecipientMutation])

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
  }
}
