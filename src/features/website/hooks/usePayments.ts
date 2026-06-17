import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import type { CheckoutPayload, GuestCheckoutPayload } from '@/types'
import { isNetworkError, resolveRequestErrorMessage } from '@/utils/networkError'
import {
  checkout,
  guestCheckout,
  getPaymentProviderConfig,
  getServiceFees,
  updateServiceFees,
  type UpdateServiceFeesPayload,
} from '../services/payment'
import { processCheckoutResponse } from '../utils/checkoutRedirect'

type CheckoutError = { status?: number; message?: string; requires_account?: boolean }

function handleCheckoutMutationError(
  error: CheckoutError,
  toast: ReturnType<typeof useToast>,
  options?: {
    isGuest?: boolean
    onCartRefetch?: () => void
    onNetworkError?: () => void
  },
) {
  if (isNetworkError(error)) {
    options?.onNetworkError?.()
    toast.error(resolveRequestErrorMessage(error, 'Checkout failed'))
    return
  }

  const message = resolveRequestErrorMessage(error, 'Checkout failed')

  if (error?.status === 429) {
    toast.error('Too many checkout attempts. Please wait a minute and try again.')
    return
  }

  if (options?.isGuest && error?.status === 400) {
    if (error.requires_account) {
      return
    }
    const lower = message.toLowerCase()
    if (
      lower.includes('cart not found') ||
      lower.includes('guest cart not found') ||
      lower.includes('not pending') ||
      lower.includes('cart is not available for checkout') ||
      lower.includes('cart total is invalid')
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

  function useCheckoutService(options?: { onNetworkError?: () => void }) {
    return useMutation({
      mutationFn: (data: CheckoutPayload) =>
        runCheckoutMutation(checkout, data, queryClient, false),
      onError: (error: CheckoutError) => {
        handleCheckoutMutationError(error, toast, { onNetworkError: options?.onNetworkError })
      },
    })
  }

  function useGuestCheckoutService(options?: {
    onCartRefetch?: () => void
    onRequiresAccount?: (message: string) => void
    onNetworkError?: () => void
  }) {
    return useMutation({
      mutationFn: (data: GuestCheckoutPayload) =>
        runCheckoutMutation(guestCheckout, data, queryClient, true),
      onError: (error: CheckoutError) => {
        if (error?.status === 400 && error.requires_account) {
          options?.onRequiresAccount?.(
            error.message ||
              'This purchase exceeds the guest limit. Please create an account to continue.',
          )
          return
        }
        handleCheckoutMutationError(error, toast, {
          isGuest: true,
          onCartRefetch: options?.onCartRefetch,
          onNetworkError: options?.onNetworkError,
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

  function useUpdateServiceFeesConfig() {
    return useMutation({
      mutationFn: (data: UpdateServiceFeesPayload) => updateServiceFees(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-fees'] })
        toast.success('Fee configuration updated')
      },
      onError: (error: CheckoutError) => {
        toast.error(error?.message ?? 'Failed to update fee configuration')
      },
    })
  }

  return {
    useCheckoutService,
    useGuestCheckoutService,
    usePaymentProviderConfig,
    useServiceFeesConfig,
    useUpdateServiceFeesConfig,
  }
}
