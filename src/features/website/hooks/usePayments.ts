import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import type { CheckoutPayload, GuestCheckoutPayload } from '@/types'
import {
  checkout,
  guestCheckout,
  getPaymentProviderConfig,
  getServiceFees,
} from '../services/payment'
import { processCheckoutResponse } from '../utils/checkoutRedirect'

type CheckoutError = { status?: number; message?: string }

function handleCheckoutMutationError(
  error: CheckoutError,
  toast: ReturnType<typeof useToast>,
  options?: { isGuest?: boolean; onCartRefetch?: () => void },
) {
  const message = error?.message ?? 'Checkout failed'

  if (error?.status === 429) {
    toast.error('Too many checkout attempts. Please wait a minute and try again.')
    return
  }

  if (options?.isGuest && error?.status === 400) {
    const lower = message.toLowerCase()
    if (
      lower.includes('cart not found') ||
      lower.includes('not pending') ||
      lower.includes('amount_due')
    ) {
      options.onCartRefetch?.()
    }
  }

  toast.error(message)
}

async function runCheckoutMutation<T extends CheckoutPayload | GuestCheckoutPayload>(
  checkoutFn: (data: T) => Promise<unknown>,
  data: T,
  queryClient: ReturnType<typeof useQueryClient>,
  isGuest: boolean,
) {
  const response = await checkoutFn(data)
  const followUp = processCheckoutResponse(response)
  if (followUp.type === 'redirected' || followUp.type === 'eganow_3ds') {
    return { response, followUp }
  }
  if (!isGuest) {
    queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
  } else {
    queryClient.invalidateQueries({ queryKey: ['cart-items'] })
  }
  return { response, followUp }
}

export function usePayments() {
  const toast = useToast()
  const queryClient = useQueryClient()

  function useCheckoutService() {
    return useMutation({
      mutationFn: (data: CheckoutPayload) =>
        runCheckoutMutation(checkout, data, queryClient, false),
      onError: (error: CheckoutError) => {
        handleCheckoutMutationError(error, toast)
      },
    })
  }

  function useGuestCheckoutService(options?: { onCartRefetch?: () => void }) {
    return useMutation({
      mutationFn: (data: GuestCheckoutPayload) =>
        runCheckoutMutation(guestCheckout, data, queryClient, true),
      onError: (error: CheckoutError) => {
        handleCheckoutMutationError(error, toast, {
          isGuest: true,
          onCartRefetch: options?.onCartRefetch,
        })
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
    useGuestCheckoutService,
    usePaymentProviderConfig,
    useServiceFeesConfig,
  }
}
