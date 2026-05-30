import { describe, expect, it } from 'vitest'
import {
  computeAmountCharged,
  computeServiceFee,
  DEFAULT_SERVICE_FEE_RATE,
  getPaymentReceiptBreakdown,
  resolveServiceFeeRate,
} from '../pricingFees'

describe('pricingFees', () => {
  it('uses default service fee rate when config is missing', () => {
    expect(resolveServiceFeeRate(undefined)).toBe(DEFAULT_SERVICE_FEE_RATE)
    expect(resolveServiceFeeRate(null)).toBe(DEFAULT_SERVICE_FEE_RATE)
  })

  it('rounds service fee and charged total to two decimals', () => {
    expect(computeServiceFee(110, 0.05)).toBe(5.5)
    expect(computeAmountCharged(110, 0.05)).toBe(115.5)
  })

  it('reconstructs payment receipt breakdown', () => {
    const breakdown = getPaymentReceiptBreakdown({
      amount: 115.5,
      service_fee_amount: 5.5,
      markup_amount: 10,
    })
    expect(breakdown).toMatchObject({
      amountCharged: 115.5,
      serviceFeeAmount: 5.5,
      markupAmount: 10,
      itemsTotal: 110,
      vendorTotal: 100,
      hasBreakdown: true,
    })
  })
})
