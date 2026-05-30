import { roundMoney } from '@/utils/pricingFees'
import { CHECKOUT_GATEWAY } from './paymentConstants'

export function roundCheckoutAmount(amount: number): number {
  return roundMoney(amount)
}

type GatewayPaymentValues = {
  payment_method_type?: string
  paypartner_code?: string
  kowri_provider?: string
  card_number?: string
  expiry_month?: unknown
  expiry_year?: unknown
  cvv?: string
}

export function appendGatewayFields<T extends Record<string, unknown>>(
  base: T,
  gateway: string,
  paymentMethod: string,
  phone: string,
  paymentValues: GatewayPaymentValues,
): T | (T & Record<string, unknown>) {
  if (gateway === CHECKOUT_GATEWAY.EGNANOW) {
    if (paymentMethod === 'mobile_money') {
      return {
        ...base,
        payment_method_type: 'mobile_money',
        msisdn: phone,
        paypartner_code: paymentValues.paypartner_code,
      }
    }
    if (paymentMethod === 'card') {
      return {
        ...base,
        payment_method_type: 'card',
        card_number: paymentValues.card_number,
        expiry_month: Number(paymentValues.expiry_month),
        expiry_year: Number(paymentValues.expiry_year),
        cvv: paymentValues.cvv,
      }
    }
  }

  if (gateway === CHECKOUT_GATEWAY.KOWRI) {
    if (paymentMethod === 'mobile_money') {
      return {
        ...base,
        payment_method_type: 'mobile_money',
        msisdn: phone,
        kowri_provider: paymentValues.kowri_provider,
      }
    }
    if (paymentMethod === 'card') {
      return {
        ...base,
        payment_method_type: 'card',
      }
    }
  }

  return base
}

export function isHostedRedirectGateway(gateway: string): boolean {
  return (
    gateway === CHECKOUT_GATEWAY.PAYSTACK ||
    gateway === CHECKOUT_GATEWAY.EXPRESSPAY ||
    !gateway
  )
}

