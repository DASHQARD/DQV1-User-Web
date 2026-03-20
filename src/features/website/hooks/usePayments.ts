import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { checkout, guestCheckout, getPaymentProviderConfig } from '../services/payment'

function handleCheckoutSuccess(data: any, queryClient: ReturnType<typeof useQueryClient>) {
  if (typeof data?.data === 'string') {
    window.open(data.data, '_blank', 'noopener,noreferrer')
  } else if (data?.data && typeof data.data === 'object') {
    const redirectUrl = (data.data as any).redirect_url
    if (typeof redirectUrl === 'string' && redirectUrl.length > 0) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer')
    }
  }
  queryClient.invalidateQueries({ queryKey: ['cart-items'] })
  queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
}

export function usePayments() {
  const toast = useToast()
  const queryClient = useQueryClient()

  function useCheckoutService() {
    return useMutation({
      mutationFn: checkout,
      onSuccess: (data: any) => {
        handleCheckoutSuccess(data, queryClient)
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error.message || 'Checkout failed')
      },
    })
  }

  function useGuestCheckoutService() {
    return useMutation({
      mutationFn: guestCheckout,
      onSuccess: (data: any) => {
        handleCheckoutSuccess(data, queryClient)
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
    useGuestCheckoutService,
    usePaymentProviderConfig,
  }
}
