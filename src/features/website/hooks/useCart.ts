import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
  addToCart,
  deleteCartItem,
  getCartItems,
  updateCartItem,
} from '../services/cart'
import type { AddToCartPayload } from '@/types/responses'
import { useToast } from '@/hooks'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  getCartItemRemoveErrorMessage,
  getCartItemUpdateErrorMessage,
  removeOrArchiveCart,
} from '@/features/website/utils/cartLifecycle'

/** Logged-in user cart only. For guest cart use useGuestCart(). */
export function useCart(query?: Record<string, any>) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const guestCartId = useAuthStore((state) => state.guestCartId)
  const { success, error: toastError } = useToast()

  const cartItemsQuery = useQuery({
    queryKey: ['cart-items', 'user', query],
    queryFn: () => getCartItems(query),
    // If a guest cart exists, avoid calling authenticated cart endpoints even if auth flags briefly flip.
    enabled: isAuthenticated && !isGuestAuth && guestCartId == null && isSessionReady,
  })

  const cartItems = cartItemsQuery.data ?? []

  const invalidateCartQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['cart-items'] })
  }

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartPayload) => {
      if (isGuestAuth) {
        return Promise.reject({
          message: 'Guest sessions use the guest cart, not the account cart.',
          status: 400,
        })
      }
      return addToCart(data)
    },
    onSuccess: invalidateCartQueries,
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Failed to add item to cart'))
    },
  })

  const removeOrArchiveCartMutation = useMutation({
    mutationFn: ({
      cart_id,
      cart_status,
    }: {
      cart_id: string | number
      cart_status?: string | null
    }) => removeOrArchiveCart(cart_id, cart_status),
    onSuccess: () => {
      invalidateCartQueries()
      success('Cart removed')
    },
    onError: (error: unknown) => {
      toastError(getApiErrorMessage(error, 'Failed to remove cart'))
    },
  })

  const deleteCartItemMutation = useMutation({
    mutationFn: (cart_item_id: string | number) => deleteCartItem(cart_item_id),
    onSuccess: invalidateCartQueries,
    onError: (error: unknown) => {
      toastError(getCartItemRemoveErrorMessage(error))
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: { cart_item_id: string | number; quantity: number }) => updateCartItem(data),
    onSuccess: () => {
      invalidateCartQueries()
      success('Cart updated')
    },
    onError: (error: unknown) => {
      toastError(getCartItemUpdateErrorMessage(error))
    },
  })

  return {
    cartItems,
    isLoading: cartItemsQuery.isLoading,
    isFetching: cartItemsQuery.isFetching,
    addToCart: addToCartMutation.mutate,
    addToCartAsync: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    deleteCartItem: deleteCartItemMutation.mutate,
    deleteCartItemAsync: deleteCartItemMutation.mutateAsync,
    isDeleting: deleteCartItemMutation.isPending,
    removeOrArchiveCart: removeOrArchiveCartMutation.mutate,
    removeOrArchiveCartAsync: removeOrArchiveCartMutation.mutateAsync,
    isRemovingCart: removeOrArchiveCartMutation.isPending,
    /** @deprecated Use removeOrArchiveCart — picks delete vs archive from cart status */
    deleteCart: (cart_id: string | number) =>
      removeOrArchiveCartMutation.mutate({ cart_id }),
    deleteCartAsync: (cart_id: string | number) =>
      removeOrArchiveCartMutation.mutateAsync({ cart_id }),
    isDeletingCart: removeOrArchiveCartMutation.isPending,
    archiveCart: (cart_id: string | number) =>
      removeOrArchiveCartMutation.mutate({ cart_id, cart_status: 'completed' }),
    archiveCartAsync: (cart_id: string | number) =>
      removeOrArchiveCartMutation.mutateAsync({ cart_id, cart_status: 'completed' }),
    isArchivingCart: removeOrArchiveCartMutation.isPending,
    updateCartItem: updateCartItemMutation.mutate,
    updateCartItemAsync: updateCartItemMutation.mutateAsync,
    isUpdating: updateCartItemMutation.isPending,
    refetch: cartItemsQuery.refetch,
  }
}
