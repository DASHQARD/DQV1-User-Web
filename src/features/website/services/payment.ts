import { postMethod } from '@/services/requests'
import type { CheckoutPayload } from '@/types'

export const checkout = async (data: CheckoutPayload): Promise<any> => {
  return await postMethod('/payments/checkout', data)
}
