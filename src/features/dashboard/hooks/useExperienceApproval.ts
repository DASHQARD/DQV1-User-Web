import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  getPendingExperienceApprovals,
  approveExperience,
  rejectExperience,
} from '../services/experienceApproval'

export function usePendingExperienceApprovals() {
  return useQuery({
    queryKey: ['pending-experience-approvals'],
    queryFn: getPendingExperienceApprovals,
  })
}

export function useApproveExperience() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: approveExperience,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pending-experience-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(response.message || 'Experience approved successfully')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to approve experience')
    },
  })
}

export function useRejectExperience() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ cardId, reason }: { cardId: number; reason?: string }) =>
      rejectExperience(cardId, reason),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pending-experience-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(response.message || 'Experience rejected')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to reject experience')
    },
  })
}
