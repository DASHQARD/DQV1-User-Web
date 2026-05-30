/** Backend default when no fee configuration row exists. */
export const DEFAULT_SERVICE_FEE_RATE = 0.05

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function resolveServiceFeeRate(configRate: number | null | undefined): number {
  if (configRate != null && Number.isFinite(configRate)) return configRate
  return DEFAULT_SERVICE_FEE_RATE
}

export function computeServiceFee(cartTotal: number, serviceFeeRate: number): number {
  return roundMoney(cartTotal * serviceFeeRate)
}

export function computeAmountCharged(cartTotal: number, serviceFeeRate: number): number {
  return roundMoney(cartTotal + computeServiceFee(cartTotal, serviceFeeRate))
}

function parseMoney(value: unknown): number {
  if (value == null || value === '') return 0
  const num = typeof value === 'number' ? value : Number(String(value))
  return Number.isFinite(num) ? num : 0
}

export type PaymentReceiptBreakdown = {
  amountCharged: number
  serviceFeeAmount: number
  markupAmount: number
  itemsTotal: number
  vendorTotal: number
  hasBreakdown: boolean
}

/** Reconstruct receipt lines from a payment record (see pricing-mechanism-frontend.md). */
export function getPaymentReceiptBreakdown(payment: {
  amount?: unknown
  service_fee_amount?: unknown
  markup_amount?: unknown
}): PaymentReceiptBreakdown {
  const amountCharged = roundMoney(parseMoney(payment.amount))
  const serviceFeeAmount = roundMoney(parseMoney(payment.service_fee_amount))
  const markupAmount = roundMoney(parseMoney(payment.markup_amount))
  const hasBreakdown = serviceFeeAmount > 0 || markupAmount > 0
  const itemsTotal = roundMoney(amountCharged - serviceFeeAmount)
  const vendorTotal = roundMoney(itemsTotal - markupAmount)
  return {
    amountCharged,
    serviceFeeAmount,
    markupAmount,
    itemsTotal,
    vendorTotal,
    hasBreakdown,
  }
}
