import { axiosClient } from '@/libs'

export interface PaymentChangeNotification {
  id: number
  branch_id: number
  branch_name: string
  branch_manager_name: string
  branch_manager_email: string
  payment_method: 'mobile_money' | 'bank'
  old_payment_details: {
    payment_method: string
    mobile_money_provider?: string
    mobile_money_number?: string
    bank_name?: string
    account_number?: string
    account_name?: string
  }
  new_payment_details: {
    payment_method: string
    mobile_money_provider?: string
    mobile_money_number?: string
    bank_name?: string
    account_number?: string
    account_name?: string
  }
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface NotificationsResponse {
  status: string
  statusCode: number
  message: string
  data: PaymentChangeNotification[]
}

export const getPaymentChangeNotifications = async (): Promise<NotificationsResponse> => {
  const response = await axiosClient.get('/notifications/payment-changes')
  return response as unknown as NotificationsResponse
}

export const approvePaymentChange = async (
  notificationId: number,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post(
    `/notifications/payment-changes/${notificationId}/approve`,
  )
  return response as unknown as { status: string; message: string }
}

export const rejectPaymentChange = async (
  notificationId: number,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post(`/notifications/payment-changes/${notificationId}/reject`)
  return response as unknown as { status: string; message: string }
}
