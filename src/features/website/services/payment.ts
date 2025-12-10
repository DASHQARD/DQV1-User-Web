import { axiosClient } from '@/libs'
import type { CheckoutPayload, CheckoutResponse } from '@/types'

export const checkout = async (data: CheckoutPayload): Promise<CheckoutResponse> => {
  const response = await axiosClient.post<CheckoutResponse>('/payments/checkout', data)
  return response.data
}
