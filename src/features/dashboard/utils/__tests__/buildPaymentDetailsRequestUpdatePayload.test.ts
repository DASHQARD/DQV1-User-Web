import { describe, expect, it } from 'vitest'
import { buildPaymentDetailsRequestUpdatePayload } from '../buildPaymentDetailsRequestUpdatePayload'

describe('buildPaymentDetailsRequestUpdatePayload', () => {
  it('builds mobile money payload', () => {
    expect(
      buildPaymentDetailsRequestUpdatePayload({
        payment_method: 'mobile_money',
        mobile_money_provider: 'MTN',
        mobile_money_number: '+233-241234567',
      }),
    ).toEqual({
      payment_method: 'mobile_money',
      mobile_money_provider: 'MTN',
      mobile_money_number: '+233-241234567',
    })
  })

  it('builds bank payload', () => {
    expect(
      buildPaymentDetailsRequestUpdatePayload({
        payment_method: 'bank',
        bank_name: 'Ecobank Ghana',
        account_number: '1234567890',
        account_name: 'Acme Ltd',
        branch: 'Accra Main',
        sort_code: 'ECO001',
        swift_code: 'ECOCGHAC',
      }),
    ).toEqual({
      payment_method: 'bank',
      bank_name: 'Ecobank Ghana',
      account_number: '1234567890',
      account_name: 'Acme Ltd',
      branch: 'Accra Main',
      sort_code: 'ECO001',
      swift_code: 'ECOCGHAC',
    })
  })
})
