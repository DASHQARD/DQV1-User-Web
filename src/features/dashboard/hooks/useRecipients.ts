import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userRecipient } from '../../website/services'
import { useToast } from '@/hooks'
import { assignRecipient, createRecipient } from '../services'
import {
  assignGuestRecipient,
  updateGuestRecipient,
  deleteGuestRecipient,
} from '../../website/services/cards'

export function useRecipients() {
  const toast = useToast()
  const queryClient = useQueryClient()
  function useUserRecipientService() {
    return useQuery({
      queryKey: ['user-recipients'],
      queryFn: userRecipient,
    })
  }

  function useCreateRecipientService() {
    return useMutation({
      mutationFn: createRecipient,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        toast.success(response.message || 'Recipient added successfully')
        queryClient.invalidateQueries({ queryKey: ['user-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to add recipient. Please try again.')
      },
    })
  }

  function useAssignRecipientService() {
    return useMutation({
      mutationFn: assignRecipient,
      onSuccess: (response: { status: string; message: string }) => {
        toast.success(response.message || 'Recipient assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['user-recipients'] })
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to assign recipient. Please try again.')
      },
    })
  }

  function useAssignGuestRecipientService() {
    return useMutation({
      mutationFn: assignGuestRecipient,
      onSuccess: (response: { status: string; message: string }) => {
        toast.success(response.message || 'Recipient assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
        queryClient.invalidateQueries({ queryKey: ['guest-cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to assign recipient. Please try again.')
      },
    })
  }

  function useUpdateGuestRecipientService() {
    return useMutation({
      mutationFn: updateGuestRecipient,
      onSuccess: (response: { status: string; message: string }) => {
        toast.success(response.message || 'Recipient updated successfully')
        queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
        queryClient.invalidateQueries({ queryKey: ['guest-cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to update recipient. Please try again.')
      },
    })
  }

  function useDeleteGuestRecipientService() {
    return useMutation({
      mutationFn: (recipientId: string | number) =>
        deleteGuestRecipient({ recipient_id: recipientId }),
      onSuccess: () => {
        toast.success('Recipient removed successfully')
        queryClient.invalidateQueries({ queryKey: ['cart-items', 'guest'] })
        queryClient.invalidateQueries({ queryKey: ['guest-cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to remove recipient')
      },
    })
  }

  return {
    useUserRecipientService,
    useCreateRecipientService,
    useAssignRecipientService,
    useAssignGuestRecipientService,
    useUpdateGuestRecipientService,
    useDeleteGuestRecipientService,
  }
}
