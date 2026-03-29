import { getMethod, postMethod } from '@/services/requests'
import type { CheckoutPayload, GuestCheckoutPayload } from '@/types'

export interface PaymentProviderConfig {
  id: number
  checkout_gateway: string
  payout_service: string
  updated_by: number
  created_at: string
  updated_at: string
}

type PaymentProviderConfigResponse = {
  data: PaymentProviderConfig
}

export interface ServiceFeeConfig {
  id: number
  serviceFeeRate: number
  vendorMarkupRate: number
  updatedBy: number
  createdAt: string
  updatedAt: string
}

type ServiceFeeConfigResponse = {
  data: ServiceFeeConfig
}

export const getPaymentProviderConfig = async (): Promise<PaymentProviderConfig> => {
  const res = await getMethod<PaymentProviderConfigResponse>('/payment-provider-config')
  return res?.data ?? (res as unknown as PaymentProviderConfig)
}

export const getServiceFees = async (): Promise<ServiceFeeConfig> => {
  const res = await getMethod<ServiceFeeConfigResponse>('/service-fees')
  return res?.data ?? (res as unknown as ServiceFeeConfig)
}

export const checkout = async (data: CheckoutPayload): Promise<any> => {
  return await postMethod('/payments/checkout', data)
}

export const guestCheckout = async (data: GuestCheckoutPayload): Promise<any> => {
  return await postMethod('/payments/guest/checkout', data)
}
