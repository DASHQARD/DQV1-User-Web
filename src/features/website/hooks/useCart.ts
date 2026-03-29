import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
  addToCart,
  deleteCartItem,
  deleteCartItemRecipient,
  getCartItems,
  updateCartItem,
} from '../services/cart'
import type { AddToCartPayload } from '@/types/responses'
import { useToast } from '@/hooks'

/** Logged-in user cart only. For guest cart use useGuestCart(). */
export function useCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const guestCartId = useAuthStore((state) => state.guestCartId)
  const { success, error: toastError } = useToast()

  const cartItemsQuery = useQuery({
    queryKey: ['cart-items', 'user', query],
    queryFn: () => getCartItems(query),
    // If a guest cart exists, avoid calling authenticated cart endpoints even if auth flags briefly flip.
    enabled: isAuthenticated && !isGuestAuth && guestCartId == null,
  })

  const cartItems = cartItemsQuery.data ?? []

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartPayload) => addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: { status: number; message: string }) => {
      console.log(error)
      toastError(error.message || 'Failed to add item to cart')
    },
  })

  // Delete entire cart
  const deleteCartMutation = useMutation({
    mutationFn: (id: number) => deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      success('Cart removed')
    },
    onError: (error: { status: number; message: string }) => {
      toastError(error.message || 'Failed to remove cart')
    },
  })

  // Delete item from cart (cart_item_id)
  const deleteCartItemMutation = useMutation({
    mutationFn: (cart_item_id: number) => deleteCartItemRecipient(cart_item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: { status: number; message: string }) => {
      toastError(error.message || 'Failed to remove item')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: { cart_item_id: number; quantity: number }) => updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      success('Cart updated')
    },
    onError: (error: { status: number; message: string }) => {
      toastError(error.message || 'Failed to update cart item')
    },
  })

  return {
    cartItems,
    isLoading: cartItemsQuery.isLoading,
    isFetching: cartItemsQuery.isFetching,
    addToCart: addToCartMutation.mutate,
    addToCartAsync: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    deleteCartItem: deleteCartItemMutation.mutate, // Deletes item from cart (cart_item_id)
    deleteCartItemAsync: deleteCartItemMutation.mutateAsync,
    isDeleting: deleteCartItemMutation.isPending,
    deleteCart: deleteCartMutation.mutate, // Deletes entire cart (cart_id)
    deleteCartAsync: deleteCartMutation.mutateAsync,
    isDeletingCart: deleteCartMutation.isPending,
    updateCartItem: updateCartItemMutation.mutate,
    updateCartItemAsync: updateCartItemMutation.mutateAsync,
    isUpdating: updateCartItemMutation.isPending,
    refetch: cartItemsQuery.refetch,
  }
}
