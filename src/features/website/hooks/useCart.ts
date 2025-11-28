import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToCart, deleteCartItem, getCartItems } from '../services/cart'
import type { AddToCartPayload } from '@/types/cart'

export function useCart() {
  const queryClient = useQueryClient()

  const cartItemsQuery = useQuery({
    queryKey: ['cart-items'],
    queryFn: () => getCartItems(20),
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
