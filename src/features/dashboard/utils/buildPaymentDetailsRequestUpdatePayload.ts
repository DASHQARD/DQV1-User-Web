export type PaymentDetailsRequestUpdatePayload = {
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  account_number?: string
  account_name?: string
  branch?: string
  sort_code?: string
  swift_code?: string
}

type PaymentDetailsFormLike = {
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  branch?: string
  account_name?: string
  account_number?: string
  swift_code?: string
  sort_code?: string
}

/** Build POST /payment-details/request-update body from form values. */
export function buildPaymentDetailsRequestUpdatePayload(
  data: PaymentDetailsFormLike,
): PaymentDetailsRequestUpdatePayload {
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
    account_number: data.account_number,
    account_name: data.account_name,
    branch: data.branch,
    sort_code: data.sort_code,
    swift_code: data.swift_code,
  }
}
