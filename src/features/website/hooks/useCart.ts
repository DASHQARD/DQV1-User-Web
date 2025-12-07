import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { addToCart, deleteCartItem, getCartItems } from '../services/cart'
import type { AddToCartPayload } from '@/types/cart'

export function useCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const cartItemsQuery = useQuery({
    queryKey: ['cart-items', query],
    queryFn: () => getCartItems(query),
    enabled: isAuthenticated,
  })

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartPayload) => addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
  })

  const deleteCartItemMutation = useMutation({
    mutationFn: (id: number) => deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
  })

  return {
    cartItems: cartItemsQuery.data?.data || cartItemsQuery.data || [],
    isLoading: cartItemsQuery.isLoading,
    isFetching: cartItemsQuery.isFetching,
    addToCart: addToCartMutation.mutate,
    addToCartAsync: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    deleteCartItem: deleteCartItemMutation.mutate,
    deleteCartItemAsync: deleteCartItemMutation.mutateAsync,
    isDeleting: deleteCartItemMutation.isPending,
    refetch: cartItemsQuery.refetch,
  }
}
