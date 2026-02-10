import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { getGuestCartItems, deleteCartItemRecipient, updateCartItem } from '../services/cart'
import { useToast } from '@/hooks'

export function useGuestCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const getGuestCartId = useAuthStore((state) => state.getGuestCartId)
  const setGuestCartId = useAuthStore((state) => state.setGuestCartId)
  const { success, error: toastError } = useToast()

  const guestCartQuery = useQuery({
    queryKey: ['cart-items', 'guest', query],
    queryFn: () => getGuestCartItems(query),
    enabled: isGuestAuth,
  })

  const cartItems = useMemo(
    () => (Array.isArray(guestCartQuery.data) ? guestCartQuery.data : []),
    [guestCartQuery.data],
  )

  useEffect(() => {
    if (!isGuestAuth || cartItems.length === 0) return
    const firstCartId = cartItems[0]?.cart_id
    if (typeof firstCartId === 'number' && getGuestCartId() == null) {
      setGuestCartId(firstCartId)
    }
  }, [isGuestAuth, cartItems, getGuestCartId, setGuestCartId])

  const deleteCartItemMutation = useMutation({
    mutationFn: (cart_item_id: number) => deleteCartItemRecipient(cart_item_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
    },
    onError: (error: { status?: number; message?: string }) => {
      toastError(error.message ?? 'Failed to remove item')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: { cart_item_id: number; quantity: number }) => updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
      success('Cart updated')
    },
    onError: (error: { status?: number; message?: string }) => {
      toastError(error.message ?? 'Failed to update cart item')
    },
  })

  return {
    cartItems,
    isLoading: guestCartQuery.isLoading,
    isFetching: guestCartQuery.isFetching,
    deleteCartItem: deleteCartItemMutation.mutate,
    deleteCartItemAsync: deleteCartItemMutation.mutateAsync,
    isDeleting: deleteCartItemMutation.isPending,
    updateCartItem: updateCartItemMutation.mutate,
    updateCartItemAsync: updateCartItemMutation.mutateAsync,
    isUpdating: updateCartItemMutation.isPending,
    refetch: guestCartQuery.refetch,
  }
}
