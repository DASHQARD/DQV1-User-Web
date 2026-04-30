/**
 * Redemption-related payloads, params, and response types.
 * Used by dashboard/services/redemptions and redemption UI.
 */

export interface ValidateVendorMobileMoneyPayload {
  phone_number: string
  provider: 'mtn' | 'vodafone' | 'airteltigo'
}

export interface ValidateVendorMobileMoneyResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    vendor_name?: string
    account_name?: string
    phone_number?: string
    provider?: string
  }
}

export interface SearchVendorsParams {
  search?: string
  limit?: number
  after?: string
  location?: string
  branch?: string
}

export interface VendorSearchResult {
  vendor_id: string
  vendor_name: string
  gvid: string
  phone_number: string
  business_name?: string
}

export interface SearchVendorsResponse {
  status: string
  statusCode: number
  message: string
  data: VendorSearchResult[]
  pagination?: {
    hasNextPage: boolean
    limit: number
    next?: string
  }
}

export interface CardBalanceParams {
  card_type?: 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'
}

export interface CardBalanceResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    balance: number
    card_type?: string
    phone_number?: string
  }
}

export interface DashProRedemptionPayload {
  vendor_phone_number: string
  amount: number
  user_phone_number: string
  token: string
}

export interface DashProRedemptionForUserPayload {
  vendor_phone_number: string
  amount: number
  user_phone_number: string
}

export interface InitiateRedemptionPayload {
  phone_number: string
}

export interface CardsRedemptionPayload {
  branch_id: string
  card_type: 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'
  amount: number
  card_id: string
  phone_number: string
  /** OTP token for guest redemptions; required when using /redemptions/cards after /redemptions/initiate */
  token?: string
}

export interface GuestCardsRedemptionPayload {
  guest_phone: string
  branch_id: string
  card_type: 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'
  amount: number
  card_id: string
}

export interface RedemptionResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    reference_id?: string
    transaction_id?: string
    amount?: number
    status?: string
    token?: string
  }
}

export interface UpdateRedemptionStatusPayload {
  reference_id: string
  status: 'success' | 'failed' | 'pending'
}

export interface GetRedemptionsParams {
  limit?: number
  after?: string
  phone_number?: string
  card_type?: 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'
  vendor_id?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  location?: string
  branch?: string
}

export interface GetUserRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetVendorRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  phone_number?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetBranchRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  phone_number?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetRedemptionsSummaryParams {
  dateFrom?: string
  dateTo?: string
}

export interface RedemptionsSummaryResponse {
  status: string
  statusCode: number
  message: string
  data: {
    total_redemptions: number
    total_dashx_redeemed: number
    total_dashpass_redeemed: number
    pending_payout: number
    currency: string
  }
}

export interface RedemptionItem {
  redemption_id: string
  phone_number: string
  vendor_name: string
  vendor_id: string
  branch_name: string
  branch_location: string
  card_type: string
  amount: number
  redemption_date: string
  status: string
  transfer_reference: string
  transaction_reference: string
}

export interface VendorRedemptionsResponse {
  status: string
  statusCode: number
  message: string
  data: RedemptionItem[]
  pagination: {
    hasMore: boolean
    after: string
  }
}

export interface GetVendorRedemptionsListParams {
  limit?: number
  after?: string
  branch_id?: string
  branch_name?: string
}

export interface GetRedemptionsAmountDashGoParams {
  phone_number?: string
  branch_id?: string
  vendor_id?: string
}

export interface GetRedemptionsAmountDashXParams {
  phone_number?: string
}

export interface GetRedemptionsAmountDashXParams {
  phone_number?: string
  branch_id?: string
  vendor_id?: string
}

export interface GetRedemptionsAmountDashPassParams {
  phone_number?: string
  branch_id?: string
  vendor_id?: string
}

export interface RecipientAmountResponse {
  status: string
  statusCode: number
  message: string
  data: {
    balance: number
    card_id?: string
    currency?: string
  }
}

export interface UserRedemptionCardsPayload {
  vendor_id?: string
  branch_id?: string
  card_type: 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'
  amount: number
  card_id?: string
}
