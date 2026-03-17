import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { checkout, getPaymentProviderConfig } from '../services/payment'

export function usePayments() {
  const toast = useToast()
  const queryClient = useQueryClient()

  function useCheckoutService() {
    return useMutation({
      mutationFn: checkout,
      onSuccess: (data: any) => {
        console.log('data', data)
        if (typeof data?.data === 'string') {
          // e.g. Paystack returns a redirect URL string
          window.open(data.data, '_blank', 'noopener,noreferrer')
        } else if (data?.data && typeof data.data === 'object') {
          const redirectUrl = (data.data as any).redirect_url
          if (typeof redirectUrl === 'string' && redirectUrl.length > 0) {
            // e.g. Kowri card payments return a redirect_url field
            window.open(redirectUrl, '_blank', 'noopener,noreferrer')
          }
        }
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error.message || 'Checkout failed')
      },
    })
  }

  function usePaymentProviderConfig() {
    return useQuery({
      queryKey: ['payment-provider-config'],
      queryFn: getPaymentProviderConfig,
    })
  }

  return {
    useCheckoutService,
    usePaymentProviderConfig,
  }
}
