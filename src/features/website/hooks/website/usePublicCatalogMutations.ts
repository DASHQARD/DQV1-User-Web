import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCard } from '@/features/dashboard/services/cards'
import { useToast } from '@/hooks'
import { createDashGoAndAssign, createDashProAndAssign } from '../../services/cards'

export function usePublicCatalogMutations() {
  function useCreateCardService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['create-card'],
      mutationFn: createCard,
      onSuccess: (response) => {
        success(response.message || 'Card created successfully')
        queryClient.invalidateQueries({ queryKey: ['cards'] })
      },
      onError: (err: any) => {
        error(err.message || 'Failed to create card')
      },
    })
  }

  function useCreateDashGoAndAssignService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['create-dashgo-and-assign'],
      mutationFn: createDashGoAndAssign,
      onSuccess: (response) => {
        success(response.message || 'DashGo card created and assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      },
      onError: (err: any) => {
        error(err.message || 'Failed to create and assign DashGo card')
      },
    })
  }

  function useCreateDashProAndAssignService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationKey: ['create-dashpro-and-assign'],
      mutationFn: createDashProAndAssign,
      onSuccess: (response) => {
        success(response.message || 'DashPro card created and assigned successfully')
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      },
      onError: (err: any) => {
        error(err.message || 'Failed to create and assign DashPro card')
      },
    })
  }

  return {
    useCreateCardService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
  }
}
