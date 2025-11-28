export * from './cards'

import { axiosClient } from '@/libs'
import type { PaymentInfoData } from '@/types'

const paymentInfo = async (data: PaymentInfoData) => {
  const response = await axiosClient.post(`/users/payment-info`, data)
  return response.data
}

export { paymentInfo }
