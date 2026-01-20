import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { deleteCartItem } from '../services/cart'
import { deleteRecipient } from '@/features/dashboard/services'

export function useViewBagMutations() {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Delete cart item mutation
  const deleteCartItemMutation = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      toast.success('Item removed from cart')
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove item')
    },
  })

  // Delete recipient mutation
  const deleteRecipientMutation = useMutation({
    mutationFn: deleteRecipient,
    onSuccess: () => {
      toast.success('Recipient removed successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove recipient')
    },
  })

  return {
    deleteCartItemMutation,
    deleteRecipientMutation,
  }
}
