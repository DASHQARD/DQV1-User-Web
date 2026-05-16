import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import type { CheckoutPayload } from '@/types'
import { checkout, getPaymentProviderConfig, getServiceFees } from '../services/payment'
import { redirectToCheckoutPaymentPage } from '../utils/checkoutRedirect'

async function runCheckoutWithRedirect<T extends CheckoutPayload>(
  checkoutFn: (data: T) => Promise<unknown>,
  data: T,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const response = await checkoutFn(data)
  const redirected = redirectToCheckoutPaymentPage(response)
  if (!redirected) {
    queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
  }
  return response
}

export function usePayments() {
  const toast = useToast()
  const queryClient = useQueryClient()

  function useCheckoutService() {
    return useMutation({
      mutationFn: (data: CheckoutPayload) => runCheckoutWithRedirect(checkout, data, queryClient),
      onError: (error: { status: number; message: string }) => {
        if (error?.status === 429) {
          toast.error('Too many checkout attempts. Please wait a minute and try again.')
          return
        }
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

  function useServiceFeesConfig() {
    return useQuery({
      queryKey: ['service-fees'],
      queryFn: getServiceFees,
    })
  }

  return {
    useCheckoutService,
    usePaymentProviderConfig,
    useServiceFeesConfig,
  }
}
