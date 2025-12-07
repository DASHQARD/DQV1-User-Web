import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { getBranches, deleteBranch } from '../services/branches'

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  })
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success(response.message || 'Branch deleted successfully')
    },
    onError: (error: { status?: number; message?: string }) => {
      const errorMessage = error?.message || 'Failed to delete branch. Please try again.'
      toast.error(errorMessage)
    },
  })
}
