import type { UpdateBranchPaymentDetailsPayload } from '@/types'
import type { BranchPaymentDetailsFormData } from '@/utils/schemas/vendor/branches'

/** Build PUT /payment-details/update-branch body from form values. */
export function buildUpdateBranchPaymentDetailsPayload(
  branchId: string | number,
  data: BranchPaymentDetailsFormData,
): UpdateBranchPaymentDetailsPayload {
  if (data.payment_method === 'mobile_money') {
    return {
      branch_id: branchId,
      payment_method: 'mobile_money',
      mobile_money_provider: data.mobile_money_provider,
      mobile_money_number: data.mobile_money_number,
    }
  }

  return {
    branch_id: branchId,
    payment_method: 'bank',
    bank_name: data.bank_name,
    bank_branch: data.bank_branch,
    account_holder_name: data.account_holder_name,
    account_number: data.account_number,
    sort_code: data.sort_code,
    swift_code: data.swift_code,
  }
}
