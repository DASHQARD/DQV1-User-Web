import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { paymentInfo, getPaymentInfo, getPaymentById } from '@/services'
import { useAuthStore } from '@/stores'

export function usePaymentInfoService() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  function useGetPaymentInfoService() {
    return useQuery({
      queryKey: ['get-payment-info'],
      queryFn: getPaymentInfo,
    })
  }

  function useGetPaymentByIdService() {
    return useQuery({
      queryKey: ['get-payment-by-id', user?.user_id],
      queryFn: () => getPaymentById(user?.user_id as string),
      enabled: !!user?.user_id && user?.user_type === 'user',
    })
  }

  function useUpdatePaymentInfoService() {
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

  return {
    useGetPaymentInfoService,
    useUpdatePaymentInfoService,
    useGetPaymentByIdService,
  }
}
