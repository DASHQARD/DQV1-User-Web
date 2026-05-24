import type { BranchPaymentDetailsFormData } from '@/utils/schemas/vendor/branches'

export type BranchPaymentDetailsRequestUpdatePayload = {
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  bank_branch?: string
  account_holder_name?: string
  account_number?: string
  sort_code?: string
  swift_code?: string
}

/** Build proposed_data for POST /branches/payment-details/request-update */
export function buildBranchPaymentDetailsRequestUpdatePayload(
  data: BranchPaymentDetailsFormData,
): BranchPaymentDetailsRequestUpdatePayload {
  if (data.payment_method === 'mobile_money') {
    return {
      payment_method: 'mobile_money',
      mobile_money_provider: data.mobile_money_provider,
      mobile_money_number: data.mobile_money_number,
    }
  }

  return {
    payment_method: 'bank',
    bank_name: data.bank_name,
    bank_branch: data.bank_branch,
    account_holder_name: data.account_holder_name,
    account_number: data.account_number,
    sort_code: data.sort_code,
    swift_code: data.swift_code,
  }
}
