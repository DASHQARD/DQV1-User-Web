import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateVendorStatus } from '../services'
import type { UpdateVendorStatusPayload } from '@/types/vendor'

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateVendorStatusPayload) => updateVendorStatus(data),
    onSuccess: () => {
      // Invalidate vendors list to refetch
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-details'] })
    },
  })
}
