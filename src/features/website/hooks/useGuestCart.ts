import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { getGuestCartItems, updateGuestCartItem, deleteGuestCartItem } from '../services/cards'
import { useToast } from '@/hooks'

export function useGuestCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const getGuestCartId = useAuthStore((state) => state.getGuestCartId)
  const setGuestCartId = useAuthStore((state) => state.setGuestCartId)
  const setGuestCartUuid = useAuthStore((state) => state.setGuestCartUuid)
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
    const firstCart = cartItems[0]
    if (typeof firstCart?.cart_id === 'number' && getGuestCartId() == null) {
      setGuestCartId(firstCart.cart_id)
    }
    const uuid = firstCart?.guest_cart_uuid
    if (uuid?.trim()) {
      setGuestCartUuid(uuid.trim())
    }
  }, [isGuestAuth, cartItems, getGuestCartId, setGuestCartId, setGuestCartUuid])

  const deleteCartItemMutation = useMutation({
    mutationFn: (cart_item_id: string | number) => deleteGuestCartItem({ cart_item_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
    },
    onError: (error: { status?: number; message?: string }) => {
      toastError(error.message ?? 'Failed to remove item')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: { cart_item_id: string | number; quantity: number }) =>
      updateGuestCartItem({ cart_item_id: data.cart_item_id, quantity: data.quantity }),
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
