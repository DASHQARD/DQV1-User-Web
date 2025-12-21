import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { addBranch, deleteBranch, getBranches } from '../../services/vendor'

export function useBranches() {
  const queryClient = useQueryClient()
  const toast = useToast()

  function useBranchesService() {
    return useQuery({
      queryKey: ['branches'],
      queryFn: getBranches,
      enabled: false,
    })
  }

  function useAddBranchService() {
    return useMutation({
      mutationFn: addBranch,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        toast.success(response.data?.message || 'Branch deleted successfully')
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to delete branch. Please try again.')
      },
    })
  }

  function useDeleteBranchService() {
    return useMutation({
      mutationFn: (id: string) => deleteBranch(id),
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['branches'] })
        toast.success(response.data?.message || 'Branch deleted successfully')
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to delete branch. Please try again.')
      },
    })
  }

  return {
    useBranchesService,
    useAddBranchService,
    useDeleteBranchService,
  }
}
