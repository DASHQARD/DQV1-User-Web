import { axiosClient } from '@/libs'
import { getList } from '@/services/requests'

export interface VendorRedemption {
  id: string
  amount: number
  giftCardType: string
  updated_at: string
  transactionId?: string
  status?: string
}

export interface RedemptionsListResponse {
  status: string
  statusCode: number
  message: string
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    next: string | null
    previous: string | null
  }
  data: VendorRedemption[]
}

export interface ValidateVendorMobileMoneyPayload {
  phone_number: string
}

export interface ValidateVendorMobileMoneyResponse {
  status: string
  statusCode: number
  message: string
  data?: {
    vendor_name?: string
    gvid?: string
    phone_number?: string
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
  vendor_id: number
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
  phone_number: string
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
}

export interface CardsRedemptionPayload {
  card_type: 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'
  phone_number: string
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
  }
}

export interface UpdateRedemptionStatusPayload {
  reference_id: string
  status: 'success' | 'failed' | 'pending'
}

export interface GetRedemptionsParams {
  limit?: number
  after?: string
  status?: string
}

const commonUrl = '/redemptions'

export const validateVendorMobileMoney = async (
  data: ValidateVendorMobileMoneyPayload,
): Promise<ValidateVendorMobileMoneyResponse> => {
  const response = await axiosClient.post(`${commonUrl}/validate/vendor-mobile-money`, data)
  return response as unknown as ValidateVendorMobileMoneyResponse
}

// Search vendors
export const searchVendors = async (
  params?: SearchVendorsParams,
): Promise<SearchVendorsResponse> => {
  const response = await axiosClient.get(`${commonUrl}/search/vendors`, { params })
  return response as unknown as SearchVendorsResponse
}

// Get card balance
export const getCardBalance = async (params: CardBalanceParams): Promise<CardBalanceResponse> => {
  const response = await axiosClient.get(`${commonUrl}/card-balance`, { params })
  return response as unknown as CardBalanceResponse
}

// Process DashPro redemption
export const processDashProRedemption = async (
  data: DashProRedemptionPayload,
): Promise<RedemptionResponse> => {
  const response = await axiosClient.post(`${commonUrl}/dash-pro`, data)
  return response as unknown as RedemptionResponse
}

// Process cards redemption (DashGo, DashX, DashPass)
export const processCardsRedemption = async (
  data: CardsRedemptionPayload,
): Promise<RedemptionResponse> => {
  const response = await axiosClient.post(`${commonUrl}/cards`, data)
  return response as unknown as RedemptionResponse
}

// Get redemptions list
export const getRedemptions = async (
  params?: GetRedemptionsParams,
): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get(`${commonUrl}`, { params })
  return response as unknown as RedemptionsListResponse
}

// Update redemption status
export const updateRedemptionStatus = async (
  data: UpdateRedemptionStatusPayload,
): Promise<RedemptionResponse> => {
  const response = await axiosClient.post(`${commonUrl}/update-status`, data)
  return response as unknown as RedemptionResponse
}

// Legacy endpoint - keep for backward compatibility
export const getRedemptionsLegacy = async (): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get(`${commonUrl}/vendors/redemptions`)
  return response as unknown as RedemptionsListResponse
}

export interface GetRedemptionsAmountDashGoParams {
  phone_number: string
  branch_id?: number
  vendor_id?: number
}

export interface GetRedemptionsAmountDashProParams {
  phone_number: string
}

export const getRedemptionsAmountDashGo = async (
  params: GetRedemptionsAmountDashGoParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-go`, params)
}

export const getRedemptionsAmountDashPro = async (
  params: GetRedemptionsAmountDashProParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-pro`, params)
}
