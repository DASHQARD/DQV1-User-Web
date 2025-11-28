import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomerStatus } from '../services'
import type { UpdateCustomerStatusPayload } from '@/types/customer'

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCustomerStatusPayload) => updateCustomerStatus(data),
    onSuccess: () => {
      // Invalidate customers list to refetch
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer-details'] })
    },
  })
}
