import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { checkout } from '../services/payment'

export function usePayments() {
  const toast = useToast()
  const queryClient = useQueryClient()
  function useCheckoutService() {
    return useMutation({
      mutationFn: checkout,
      onSuccess: (data: any) => {
        window.open(data, '_blank', 'noopener,noreferrer')
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error.message || 'Checkout failed')
      },
    })
  }

  return {
    useCheckoutService,
  }
}
