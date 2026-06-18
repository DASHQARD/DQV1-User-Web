import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { useRequestInitiatorNavigation } from '@/features/dashboard/hooks/useRequestInitiatorNavigation'
import { getRequestApiErrorMessage } from '@/utils/requestApiError'
import {
  updateBranchExperience,
  deleteBranchExperience,
  createBranchExperience,
  requestBranchDetailsUpdate,
} from '../services'
import { updateBranchPaymentDetails } from '@/features/dashboard/vendor/services/vendor'

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
    const { goToSubmittedRequest } = useRequestInitiatorNavigation()
    return useMutation({
      mutationFn: createBranchExperience,
      onSuccess: (response: any) => {
        success(response?.message || 'Experience created successfully')
        queryClient.invalidateQueries()
        goToSubmittedRequest(response)
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to create experience. Please try again.')
      },
    })
  }
  function useRequestBranchDetailsUpdateService() {
    const queryClient = useQueryClient()
    const { goToSubmittedRequest } = useRequestInitiatorNavigation()
    return useMutation({
      mutationFn: requestBranchDetailsUpdate,
      onSuccess: (response: any) => {
        success(
          response?.message ||
            'Branch details update request submitted. Your vendor and platform admin will review it.',
        )
        queryClient.invalidateQueries({ queryKey: ['branch-info'] })
        goToSubmittedRequest(response)
      },
      onError: (err: unknown) => {
        error(getRequestApiErrorMessage(err, 'Failed to submit branch details update request. Please try again.'))
      },
    })
  }

  function useRequestBranchPaymentDetailsUpdateService() {
    const queryClient = useQueryClient()
    const { goToSubmittedRequest } = useRequestInitiatorNavigation()
    return useMutation({
      mutationFn: updateBranchPaymentDetails,
      onSuccess: (response: any) => {
        success(
          response?.message ||
            'Payment details update request submitted. Your vendor and platform admin will review it.',
        )
        queryClient.invalidateQueries({ queryKey: ['branch-info'] })
        goToSubmittedRequest(response)
      },
      onError: (err: unknown) => {
        error(getRequestApiErrorMessage(err, 'Failed to submit payment details update request. Please try again.'))
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
