import { describe, expect, it } from 'vitest'
import { buildUpdateBranchPaymentDetailsPayload } from '../buildUpdateBranchPaymentDetailsPayload'

describe('buildUpdateBranchPaymentDetailsPayload', () => {
  it('builds mobile money payload', () => {
    expect(
      buildUpdateBranchPaymentDetailsPayload('019e40d5-4b7f-79f6-9c8e-fbea7036b19c', {
        payment_method: 'mobile_money',
        mobile_money_provider: 'mtn',
        mobile_money_number: '+233-241234567',
      }),
    ).toEqual({
      branch_id: '019e40d5-4b7f-79f6-9c8e-fbea7036b19c',
      payment_method: 'mobile_money',
      mobile_money_provider: 'mtn',
      mobile_money_number: '+233-241234567',
    })
  })

  it('builds bank payload', () => {
    expect(
      buildUpdateBranchPaymentDetailsPayload('019e40d5-4b7f-79f6-9c8e-fbea7036b19c', {
        payment_method: 'bank',
        bank_name: 'GCB Bank',
        bank_branch: 'Accra Main',
        account_holder_name: 'Branch Manager',
        account_number: '1234567890',
        sort_code: '040100',
        swift_code: 'GCBBGHAC',
      }),
    ).toEqual({
      branch_id: '019e40d5-4b7f-79f6-9c8e-fbea7036b19c',
      payment_method: 'bank',
      bank_name: 'GCB Bank',
      bank_branch: 'Accra Main',
      account_holder_name: 'Branch Manager',
      account_number: '1234567890',
      sort_code: '040100',
      swift_code: 'GCBBGHAC',
    })
  })
})
