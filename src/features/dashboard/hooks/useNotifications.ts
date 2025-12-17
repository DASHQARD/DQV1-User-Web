import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  getPaymentChangeNotifications,
  approvePaymentChange,
  rejectPaymentChange,
} from '../services/notifications'

export function usePaymentChangeNotifications() {
  return useQuery({
    queryKey: ['payment-change-notifications'],
    queryFn: getPaymentChangeNotifications,
    enabled: false,
  })
}

export function useApprovePaymentChange() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: approvePaymentChange,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-change-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success(response.message || 'Payment change approved successfully')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to approve payment change')
    },
  })
}

export function useRejectPaymentChange() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: rejectPaymentChange,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['payment-change-notifications'] })
      toast.success(response.message || 'Payment change rejected')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to reject payment change')
    },
  })
}
