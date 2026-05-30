import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { useCartStore } from '@/stores/cart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import type { CartListResponse } from '@/types/responses'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'

export function useCartModal() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const localLines = useGuestLocalCartStore((s) => s.lines)
  const removeLocalLine = useGuestLocalCartStore((s) => s.removeLine)
  const updateLocalLineQuantity = useGuestLocalCartStore((s) => s.updateLineQuantity)
  const getLocalSubtotal = useGuestLocalCartStore((s) => s.getSubtotal)
  const getLocalTotalItems = useGuestLocalCartStore((s) => s.getTotalItems)
  const isLocalGuestCart = !isAuthenticated && !isGuestAuth
  const { closeCart } = useCartStore()
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoading = isLocalGuestCart ? false : isGuestAuth ? guestCart.isLoading : userCart.isLoading
  const deleteCartItemAsync = isGuestAuth
    ? guestCart.deleteCartItemAsync
    : userCart.deleteCartItemAsync
  const updateCartItem = isGuestAuth ? guestCart.updateCartItem : userCart.updateCartItem
  const isUpdating = isLocalGuestCart ? false : isGuestAuth ? guestCart.isUpdating : userCart.isUpdating

  const [deletingItemId, setDeletingItemId] = useState<string | number | null>(null)

  const localCartAsApiShape = useMemo((): CartListResponse[] => {
    if (!isLocalGuestCart || localLines.length === 0) return []
    const subtotal = getLocalSubtotal()
    return [
      {
        cart_id: 'local',
        cart_status: 'active',
        total_amount: String(subtotal),
        items: localLines.map((line) => ({
          cart_item_id: line.lineId as unknown as number,
          card_id: line.card_id as unknown as number,
          product: line.product,
          type: line.type || 'dashx',
          total_quantity: line.quantity,
          total_amount: String(line.price * line.quantity),
          images: [],
        })),
      } as unknown as CartListResponse,
    ]
  }, [isLocalGuestCart, localLines, getLocalSubtotal])

  const activeCartItems = useMemo(() => {
    if (isLocalGuestCart) return localCartAsApiShape
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems, isLocalGuestCart, localCartAsApiShape])

  const subtotal = useMemo(
    () =>
      isLocalGuestCart
        ? getLocalSubtotal()
        : activeCartItems.reduce((total: number, cart: CartListResponse) => {
            return total + parseFloat(cart.total_amount || '0')
          }, 0),
    [activeCartItems, isLocalGuestCart, getLocalSubtotal],
  )

  const totalItems = useMemo(
    () =>
      isLocalGuestCart
        ? getLocalTotalItems()
        : activeCartItems.reduce((total, cart) => {
            if (!cart.items) return total
            const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
            return total + itemsArray.reduce((sum, item) => sum + (item.total_quantity || 1), 0)
          }, 0),
    [activeCartItems, isLocalGuestCart, getLocalTotalItems],
  )

  const handleCheckout = useCallback(() => {
    closeCart()
    navigate('/checkout')
  }, [closeCart, navigate])

  const handleRemoveItem = useCallback(
    async (cartItemId: string | number) => {
      setDeletingItemId(cartItemId)
      try {
        if (isLocalGuestCart) {
          removeLocalLine(String(cartItemId))
        } else {
          await deleteCartItemAsync(cartItemId)
        }
      } catch (error) {
        console.error('Failed to delete item', error)
        setDeletingItemId(null)
      } finally {
        setTimeout(() => setDeletingItemId(null), 200)
      }
    },
    [deleteCartItemAsync, isLocalGuestCart, removeLocalLine],
  )

  const handleUpdateQuantity = useCallback(
    (params: { cart_item_id: string | number; quantity: number }) => {
      if (isLocalGuestCart) {
        updateLocalLineQuantity(String(params.cart_item_id), params.quantity)
        return
      }
      updateCartItem(params)
    },
    [isLocalGuestCart, updateCartItem, updateLocalLineQuantity],
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
  }
}
