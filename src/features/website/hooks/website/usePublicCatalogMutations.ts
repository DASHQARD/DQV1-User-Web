import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCard } from '@/features/dashboard/services/cards'
import { useToast } from '@/hooks'

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

  return {
    useCreateCardService,
  }
}
