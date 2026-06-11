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
    bank_code?: string
  }
}

export interface SearchVendorsParams {
  search?: string
  limit?: number
  after?: string
  location?: string
  branch?: string
}

export interface VendorSearchBranch {
  id: string
  branch_name: string
  branch_location?: string
  branch_code?: string
  full_branch_id?: string
  gvid?: string
}

export interface VendorSearchResult {
  vendor_id: string
  id?: string
  vendor_name: string
  gvid: string
  phone_number?: string
  business_name?: string
  created_at?: string
  /** SQL COUNT returned as string from API */
  branch_count?: string | number
  branches?: VendorSearchBranch[]
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

export type GuestMomoProvider = 'mtn' | 'vodafone' | 'airtel-tigo'

export interface DashProRedemptionPayload {
  vendor_phone_number: string
  amount: number
  user_phone_number: string
  provider: GuestMomoProvider
}

export interface DashProRedemptionForUserPayload {
  vendor_phone_number: string
  amount: number
  user_phone_number?: string
  provider: GuestMomoProvider
}

export interface ResolveMomoNamePayload {
  phone_number: string
}

export interface ResolveMomoNameResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    account_name?: string
    provider?: 'mtn' | 'vodafone' | 'airtel-tigo' | string
    is_resolved?: boolean
    is_platform_vendor?: boolean
    vendor_id?: string | null
    vendor_name?: string | null
  }
}

export type RedemptionMethodParam = 'vendor_id' | 'vendor_mobile_money'

export interface RedeemableCardsParams {
  phone_number?: string
  method: RedemptionMethodParam
  branch_id?: string
  vendor_gvid?: string
}

export interface RedeemableCardSummary {
  card_type: 'DashPro' | 'DashGo' | 'DashX' | 'DashPass' | string
  total_balance: number
  currency: string
  available: boolean
  card_count: number
}

export interface RedeemableCardsResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    phone_number?: string
    method?: RedemptionMethodParam
    cards: RedeemableCardSummary[]
  }
}

export interface InitiateRedemptionPayload {
  phone_number: string
}

/** POST /redemptions/cards or /redemptions/users/cards — Method A */
export type CardsRedemptionPayload =
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashGo'
      card_id: string
      phone_number?: string
      amount: number
    }
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashPro'
      phone_number?: string
      amount: number
    }
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashX'
      phone_number?: string
      card_id: string
    }
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashPass'
      phone_number?: string
      card_id: string
    }

/** POST /guest-redemptions/cards — guest identity comes from Bearer token, not body */
export type GuestCardsRedemptionPayload =
  | {
      card_type: 'DashPro'
      amount: number
      vendor_phone_number: string
      provider: GuestMomoProvider
    }
  | {
      card_type: 'DashGo'
      card_id: string
      branch_id: string
      amount: number
    }
  | {
      card_type: 'DashX' | 'DashPass'
      card_id: string
      branch_id: string
    }

export interface GuestCardsRedemptionData {
  redemption_id?: string
  transaction_reference?: string
  redemption_code?: string
  amount?: number | string
  status?: string
  redemption_date?: string
  guest_phone?: string
  vendor_payment?: Record<string, unknown>
}

export interface GuestCardsRedemptionResponse {
  status: string
  statusCode: number
  message: string
  data?: GuestCardsRedemptionData
}

export interface RedemptionResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    reference_id?: string
    transaction_id?: string
    transaction_reference?: string
    redemption_code?: string
    redemption_id?: string
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

export type UserRedemptionCardsPayload = CardsRedemptionPayload
