import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import { useCartStore } from '@/stores/cart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import type { CartListResponse } from '@/types/responses'
import { filterShoppingCarts } from '@/features/website/utils/cartFilters'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'
import { canRemoveCartItem, canUpdateCartItemQuantity } from '@/features/website/utils/cartLifecycle'
import { useToast } from '@/hooks'

export function useCartModal() {
  const navigate = useNavigate()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { closeCart } = useCartStore()
  const toast = useToast()
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoading = isGuestAuth ? guestCart.isLoading : userCart.isLoading
  const deleteCartItemAsync = isGuestAuth
    ? guestCart.deleteCartItemAsync
    : userCart.deleteCartItemAsync
  const updateCartItem = isGuestAuth ? guestCart.updateCartItem : userCart.updateCartItem
  const isUpdating = isGuestAuth ? guestCart.isUpdating : userCart.isUpdating

  const [deletingItemId, setDeletingItemId] = useState<string | number | null>(null)

  const serverCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return filterShoppingCarts(cartItems)
  }, [cartItems])

  const activeCartItems = serverCartItems

  const subtotal = useMemo(
    () =>
      serverCartItems.reduce(
        (total: number, cart: CartListResponse) => total + parseFloat(cart.total_amount || '0'),
        0,
      ),
    [serverCartItems],
  )

  const totalItems = useMemo(
    () =>
      serverCartItems.reduce((total, cart) => {
        if (!cart.items) return total
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
        return total + itemsArray.reduce((sum, item) => sum + (item.total_quantity || 1), 0)
      }, 0),
    [serverCartItems],
  )

  const handleCheckout = useCallback(() => {
    closeCart()
    navigate('/checkout')
  }, [closeCart, navigate])

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
        console.error('Failed to delete item', error)
        setDeletingItemId(null)
      } finally {
        setTimeout(() => setDeletingItemId(null), 200)
      }
    },
    [deleteCartItemAsync, toast],
  )

  const handleUpdateQuantity = useCallback(
    (params: { cart_item_id: string | number; quantity: number; cart_status?: string }) => {
      if (isLocalGuestCartLineId(params.cart_item_id)) return
      if (!canUpdateCartItemQuantity(params.cart_status)) {
        toast.error('This cart can no longer be changed. Remove the item or start a new order.')
        return
      }
      updateCartItem({ cart_item_id: params.cart_item_id, quantity: params.quantity })
    },
    [updateCartItem, toast],
  )

  return {
    closeCart,
    navigate,
    activeCartItems,
    isLoading,
    totalItems,
    subtotal,
    updateCartItem: handleUpdateQuantity,
    isUpdating,
    deletingItemId,
    handleCheckout,
    handleRemoveItem,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
    canUpdateCartItemQuantity,
    canRemoveCartItem,
    isLocalGuestCartLineId,
  }
}
