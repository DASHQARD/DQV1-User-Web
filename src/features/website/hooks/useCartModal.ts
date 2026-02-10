import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { useCartStore } from '@/stores/cart'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import type { CartListResponse } from '@/types/responses'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'

export function useCartModal() {
  const navigate = useNavigate()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { closeCart } = useCartStore()
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoading = isGuestAuth ? guestCart.isLoading : userCart.isLoading
  const deleteCartItemAsync = isGuestAuth
    ? guestCart.deleteCartItemAsync
    : userCart.deleteCartItemAsync
  const updateCartItem = isGuestAuth ? guestCart.updateCartItem : userCart.updateCartItem
  const isUpdating = isGuestAuth ? guestCart.isUpdating : userCart.isUpdating

  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems])

  const subtotal = useMemo(
    () =>
      activeCartItems.reduce((total: number, cart: CartListResponse) => {
        return total + parseFloat(cart.total_amount || '0')
      }, 0),
    [activeCartItems],
  )

  const totalItems = useMemo(
    () =>
      activeCartItems.reduce((total, cart) => {
        if (!cart.items) return total
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
        return total + itemsArray.length
      }, 0),
    [activeCartItems],
  )

  const handleCheckout = useCallback(() => {
    closeCart()
    navigate('/checkout')
  }, [closeCart, navigate])

  const handleRemoveItem = useCallback(
    async (cartItemId: number) => {
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
    [deleteCartItemAsync],
  )

  return {
    closeCart,
    navigate,
    activeCartItems,
    isLoading,
    totalItems,
    subtotal,
    updateCartItem,
    isUpdating,
    deletingItemId,
    handleCheckout,
    handleRemoveItem,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
  }
}
