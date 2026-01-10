export type UpdateBranchStatusPayload = {
  branch_id: number
  status: string
}

export interface BranchPaymentDetailsResponse {
  // getList returns res.data where res is already response.data from interceptor
  // So this represents the nested "data" property from the API response
  default_payment_option?: string | null
  mobile_money_accounts?: Array<{
    id: number
    user_id?: number
    momo_number: string
    provider: string
    created_at?: string
    updated_at?: string
  }>
  bank_accounts?: Array<{
    id: number
    account_number: string
    account_holder_name: string
    bank_name: string
    bank_branch: string
    swift_code: string
    sort_code: string
    user_id?: number
    created_at?: string
    updated_at?: string
  }>
}

export interface UpdateBranchPaymentDetailsPayload {
  branch_id: number
  mobile_money_accounts?: Array<{
    id: number
    momo_number: string
    provider: string
  }>
  bank_accounts?: Array<{
    id: number
    account_number: string
    account_holder_name: string
    bank_name: string
    bank_branch: string
    swift_code: string
    sort_code: string
  }>
}

export interface AddBranchPaymentDetailsPayload {
  branch_id: number
  mobile_money_accounts?: Array<{
    momo_number: string
    provider: string
  }>
  bank_accounts?: Array<{
    account_number: string
    account_holder_name: string
    bank_name: string
    bank_branch: string
    swift_code: string
    sort_code: string
  }>
}
