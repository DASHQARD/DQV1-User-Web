import { axiosClient } from '@/libs'
import { getList, postMethod } from '@/services/requests'

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

/**
 * Helper function to detect mobile money provider from phone number in Ghana
 * @param phoneNumber - Phone number in any format (+233XXXXXXXXX, 233XXXXXXXXX, 0XXXXXXXXX)
 * @returns Provider name ('mtn', 'vodafone', 'airteltigo') or null if unable to detect
 */
export const detectMobileMoneyProvider = (
  phoneNumber: string,
): 'mtn' | 'vodafone' | 'airteltigo' | null => {
  if (!phoneNumber) return null

  // Extract only digits
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '')
  if (digitsOnly.length < 9) return null

  // Remove country code (233) if present and convert to local format (0XXXXXXXXX)
  let localNumber = digitsOnly
  if (digitsOnly.startsWith('233')) {
    localNumber = '0' + digitsOnly.slice(3)
  } else if (!digitsOnly.startsWith('0')) {
    // If it doesn't start with 0 or 233, add 0 prefix
    localNumber = '0' + digitsOnly
  } else {
    localNumber = digitsOnly
  }

  // Get first 3 digits for provider detection
  const prefix = localNumber.slice(0, 3)

  // MTN prefixes: 024, 054, 055, 059, 056
  if (
    prefix === '024' ||
    prefix === '054' ||
    prefix === '055' ||
    prefix === '059' ||
    prefix === '056'
  ) {
    return 'mtn'
  }

  // Vodafone prefixes: 020, 050
  if (prefix === '020' || prefix === '050') {
    return 'vodafone'
  }

  // AirtelTigo prefixes: 027, 057, 026, 028, 029
  if (
    prefix === '027' ||
    prefix === '057' ||
    prefix === '026' ||
    prefix === '028' ||
    prefix === '029'
  ) {
    return 'airteltigo'
  }

  return null
}

/**
 * Helper function to convert phone number to local format (0XXXXXXXXX)
 * @param phoneNumber - Phone number in any format
 * @returns Phone number in local format starting with 0
 */
export const convertToLocalPhoneFormat = (phoneNumber: string): string => {
  if (!phoneNumber) return ''

  // Extract only digits
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '')

  // Remove country code (233) if present and add 0 prefix
  if (digitsOnly.startsWith('233')) {
    return '0' + digitsOnly.slice(3)
  }

  // If it doesn't start with 0, add 0 prefix
  if (!digitsOnly.startsWith('0')) {
    return '0' + digitsOnly
  }

  return digitsOnly
}

/**
 * Helper function to convert phone number to international format (233XXXXXXXXX)
 * @param phoneNumber - Phone number in any format
 * @returns Phone number in international format with country code 233, without + prefix
 */
export const convertToInternationalFormat = (phoneNumber: string): string => {
  if (!phoneNumber) return ''

  // Extract only digits
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '')

  // If it already starts with 233, return as is
  if (digitsOnly.startsWith('233')) {
    return digitsOnly
  }

  // If it starts with 0, replace with 233
  if (digitsOnly.startsWith('0')) {
    return '233' + digitsOnly.slice(1)
  }

  // If it doesn't start with 0 or 233, assume it's missing country code and add 233
  return '233' + digitsOnly
}

export interface ValidateVendorMobileMoneyPayload {
  phone_number: string // International format: 233XXXXXXXXX (without + prefix)
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

export interface InitiateRedemptionPayload {
  phone_number: string
}

export interface CardsRedemptionPayload {
  branch_id: number
  card_type: 'DashGo' | 'DashPro' | 'DashX' | 'DashPass'
  amount: number
  card_id: number
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
  phone_number?: string
  card_type?: 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'
  vendor_id?: number
  dateFrom?: string // ISO date format
  dateTo?: string // ISO date format
  status?: string
  location?: string
  branch?: string
}

export interface GetUserRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  dateFrom?: string // ISO date format
  dateTo?: string // ISO date format
}

export interface GetVendorRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  phone_number?: string
  dateFrom?: string // ISO date format
  dateTo?: string // ISO date format
}

export interface GetBranchRedemptionsParams {
  limit?: number
  after?: string
  card_type?: string
  status?: string
  phone_number?: string
  dateFrom?: string // ISO date format
  dateTo?: string // ISO date format
}

const commonUrl = '/redemptions'

export const validateVendorMobileMoney = async (
  data: ValidateVendorMobileMoneyPayload,
): Promise<ValidateVendorMobileMoneyResponse> => {
  const response = await axiosClient.post('/payments/mobile-money/account-details', data)
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

// Get authenticated user's redeemed cards
export const getUserRedemptions = async (
  params?: GetUserRedemptionsParams,
): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get(`${commonUrl}/users`, { params })
  return response as unknown as RedemptionsListResponse
}

// Get authenticated vendor's redeemed cards
export const getVendorRedemptions = async (
  params?: GetVendorRedemptionsParams,
): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get(`${commonUrl}/vendors`, { params })
  return response as unknown as RedemptionsListResponse
}

// Get authenticated branch's redeemed cards
export const getBranchRedemptions = async (
  params?: GetBranchRedemptionsParams,
): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get(`${commonUrl}/branches`, { params })
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

export interface GetRedemptionsAmountDashXParams {
  phone_number: string
  branch_id?: number
  vendor_id?: number
}

export interface GetRedemptionsAmountDashPassParams {
  phone_number: string
  branch_id?: number
  vendor_id?: number
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

export const getRedemptionsAmountDashX = async (
  params: GetRedemptionsAmountDashXParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-x`, params)
}

export const getRedemptionsAmountDashPass = async (
  params: GetRedemptionsAmountDashPassParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-pass`, params)
}

export const processRedemptionCards = async (data: CardsRedemptionPayload): Promise<any> => {
  return await postMethod(`${commonUrl}/users/cards`, data)
}

// Initiate redemption
export const initiateRedemption = async (
  data: InitiateRedemptionPayload,
): Promise<RedemptionResponse> => {
  const response = await axiosClient.post(`${commonUrl}/initiate`, data)
  return response as unknown as RedemptionResponse
}
