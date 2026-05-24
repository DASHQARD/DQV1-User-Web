import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  updateBranchExperience,
  deleteBranchExperience,
  createBranchExperience,
  requestBranchDetailsUpdate,
  requestBranchPaymentDetailsUpdate,
} from '../services'

export function useBranchMutations() {
  const { success, error } = useToast()
  function useUpdateBranchExperienceService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updateBranchExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience updated successfully')
        queryClient.invalidateQueries({ queryKey: ['branch-experiences'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update experience. Please try again.')
      },
    })
  }

  function useDeleteBranchExperienceService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: deleteBranchExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['branch-experiences'] })
      },
    })
  }

  function useCreateBranchExperienceService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: createBranchExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience created successfully')
        queryClient.invalidateQueries()
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create experience. Please try again.')
      },
    })
  }
  function useRequestBranchDetailsUpdateService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: requestBranchDetailsUpdate,
      onSuccess: (response: any) => {
        success(
          response?.message ||
            'Branch details update request submitted. Your vendor and platform admin will review it.',
        )
        queryClient.invalidateQueries({ queryKey: ['branch-info'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to submit branch details update request. Please try again.')
      },
    })
  }

  function useRequestBranchPaymentDetailsUpdateService() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: requestBranchPaymentDetailsUpdate,
      onSuccess: (response: any) => {
        success(
          response?.message ||
            'Payment details update request submitted. Your vendor and platform admin will review it.',
        )
        queryClient.invalidateQueries({ queryKey: ['branch-info'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to submit payment details update request. Please try again.')
      },
    })
  }

  return {
    useUpdateBranchExperienceService,
    useDeleteBranchExperienceService,
    useCreateBranchExperienceService,
    useRequestBranchDetailsUpdateService,
    useRequestBranchPaymentDetailsUpdateService,
  }
}
