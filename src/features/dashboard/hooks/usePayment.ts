import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { paymentInfo } from '@/services'

export function usePaymentInfoService() {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: paymentInfo,
    onSuccess: () => {
      toast.success('Payment info updated successfully')
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (error: { status: number; message: string }) => {
      const errorMessage = error?.message || 'Payment info update failed. Please try again.'
      toast.error(errorMessage)
    },
  })
}
