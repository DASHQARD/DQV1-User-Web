import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { getApiErrorMessage } from '@/utils/apiError'
import { useAuthStore } from '@/stores'
import { deleteCartItem } from '../services/cart'
import { deleteRecipient } from '@/features/dashboard/services'
import { useRecipients } from '@/features/dashboard/hooks/useRecipients'

export function useViewBagMutations() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const { useDeleteGuestRecipientService } = useRecipients()
  const deleteGuestRecipientMutation = useDeleteGuestRecipientService()

  // Delete cart item mutation
  const deleteCartItemMutation = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      toast.success('Item removed from cart')
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove item'))
    },
  })

  const deleteMemberRecipientMutation = useMutation({
    mutationFn: deleteRecipient,
    onSuccess: () => {
      toast.success('Recipient removed successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['cart-all-recipients'] })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove recipient'))
    },
  })

  const deleteRecipientMutation = {
    mutate: (
      recipientId: string | number,
      options?: Parameters<typeof deleteMemberRecipientMutation.mutate>[1],
    ) => {
      if (isGuestAuth) {
        deleteGuestRecipientMutation.mutate(recipientId, options)
      } else {
        deleteMemberRecipientMutation.mutate(recipientId, options)
      }
    },
    isPending: isGuestAuth
      ? deleteGuestRecipientMutation.isPending
      : deleteMemberRecipientMutation.isPending,
  }

  return {
    deleteCartItemMutation,
    deleteRecipientMutation,
  }
}
