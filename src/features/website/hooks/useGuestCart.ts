import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
  getGuestCart,
  getGuestCartItems,
  resolveGuestCartNumericId,
  resolveGuestCartUuid,
  updateGuestCartItem,
  deleteGuestCartItem,
  getGuestCardSingle,
} from '../services/cards'
import { useToast } from '@/hooks'
import { useGuestQueries } from './useGuestQueries'
export function useGuestCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const guestCartQueryEnabled = isGuestAuth && isSessionReady
  const getGuestCartId = useAuthStore((state) => state.getGuestCartId)
  const setGuestCartId = useAuthStore((state) => state.setGuestCartId)
  const setGuestCartUuid = useAuthStore((state) => state.setGuestCartUuid)
  const { success, error: toastError } = useToast()
  const { useGetGuestCardsService } = useGuestQueries()
  const { data: guestCreatedCards = [] } = useGetGuestCardsService()

  const guestCartHeaderQuery = useQuery({
    queryKey: ['guest-cart', query],
    queryFn: () => getGuestCart(query),
    enabled: guestCartQueryEnabled,
  })

  const guestCartQuery = useQuery({
    queryKey: ['cart-items', 'guest', query],
    queryFn: () => getGuestCartItems(query),
    enabled: guestCartQueryEnabled,
  })

  const cartItems = useMemo(
    () => (Array.isArray(guestCartQuery.data) ? guestCartQuery.data : []),
    [guestCartQuery.data],
  )

  useEffect(() => {
    if (!guestCartQueryEnabled) return
    const header = guestCartHeaderQuery.data
    if (header) {
      const numericId = resolveGuestCartNumericId(header)
      if (typeof numericId === 'number' && getGuestCartId() == null) {
        setGuestCartId(numericId)
      }
      const uuid = resolveGuestCartUuid(header)
      if (uuid?.trim()) {
        setGuestCartUuid(uuid.trim())
      }
    }
    if (!isGuestAuth || cartItems.length === 0) return
    const firstCart = cartItems[0]
    if (typeof firstCart?.cart_id === 'number' && getGuestCartId() == null) {
      setGuestCartId(firstCart.cart_id)
    }
    const lineUuid = firstCart?.guest_cart_uuid
    if (lineUuid?.trim()) {
      setGuestCartUuid(lineUuid.trim())
    }
  }, [
    guestCartQueryEnabled,
    guestCartHeaderQuery.data,
    isGuestAuth,
    cartItems,
    getGuestCartId,
    setGuestCartId,
    setGuestCartUuid,
  ])

  const deleteCartItemMutation = useMutation({
    mutationFn: (cart_item_id: string | number) => deleteGuestCartItem({ cart_item_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
      queryClient.invalidateQueries({ queryKey: ['guest-cart'] })
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
      queryClient.invalidateQueries({ queryKey: ['guest-cart'] })
      success('Cart updated')
    },
    onError: (error: { status?: number; message?: string }) => {
      toastError(error.message ?? 'Failed to update cart item')
    },
  })

  return {
    cartItems,
    guestCreatedCards,
    getGuestCardSingle,
    isLoading: guestCartQuery.isLoading,
    isFetching: guestCartQuery.isFetching,
    deleteCartItem: deleteCartItemMutation.mutate,
    deleteCartItemAsync: deleteCartItemMutation.mutateAsync,
    isDeleting: deleteCartItemMutation.isPending,
    updateCartItem: updateCartItemMutation.mutate,
    updateCartItemAsync: updateCartItemMutation.mutateAsync,
    isUpdating: updateCartItemMutation.isPending,
    refetch: async () => {
      await guestCartHeaderQuery.refetch()
      return guestCartQuery.refetch()
    },
  }
}
