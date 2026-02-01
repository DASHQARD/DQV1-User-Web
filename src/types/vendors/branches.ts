export type UpdateBranchStatusPayload = {
  branch_id: number
  status: string
}

export interface RecentBranchesProps {
  branches: any[]
  isLoading: boolean
  addAccountParam: (path: string) => string
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
  payment_method: 'mobile_money' | 'bank'
  // Mobile Money fields
  mobile_money_provider?: string
  mobile_money_number?: string
  // Bank fields
  bank_name?: string
  branch?: string
  account_name?: string
  account_number?: string
  sort_code?: string
  swift_code?: string
}

export interface AddBranchPaymentDetailsPayload {
  branch_id: number
  payment_method: 'mobile_money' | 'bank'
  // Mobile Money fields
  mobile_money_provider?: string
  mobile_money_number?: string
  // Bank fields
  bank_name?: string
  branch?: string
  account_name?: string
  account_number?: string
  sort_code?: string
  swift_code?: string
}

export interface BranchManagerInvitation {
  id: number | string
  user_id?: number
  branch_manager_name: string
  branch_manager_email: string
  branch_name: string
  branch_location?: string
  is_single_branch?: boolean
  created_at: string
  updated_at?: string
  vendor_id?: number
  full_branch_id?: string
  gvid?: string
  parent_branch_id?: number | null
  branch_code?: string
  branch_type?: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'active' | 'inactive'
}

export interface BranchManagerInvitationsResponse {
  data: BranchManagerInvitation[]
  pagination?: {
    limit: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    next: string | null
    previous: string | null
  }
}

export interface GetBranchManagerInvitationsQuery {
  limit?: number
  after?: string
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface CancelBranchManagerInvitationPayload {
  invitation_id: number
}

export interface RemoveBranchManagerPayload {
  branch_id: number
  email: string // This is the branch_manager_email in the API request
  password: string
}
