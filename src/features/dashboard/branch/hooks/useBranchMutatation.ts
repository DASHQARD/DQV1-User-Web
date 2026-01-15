import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { updateBranchExperience, deleteBranchExperience, createBranchExperience } from '../services'

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
  return {
    useUpdateBranchExperienceService,
    useDeleteBranchExperienceService,
    useCreateBranchExperienceService,
  }
}
