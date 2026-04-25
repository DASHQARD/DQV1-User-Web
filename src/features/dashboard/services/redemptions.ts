import { axiosClient } from '@/libs'
import { getList, postMethod } from '@/services/requests'
import type {
  RedemptionsListResponse,
  ValidateVendorMobileMoneyPayload,
  SearchVendorsParams,
  SearchVendorsResponse,
  CardBalanceParams,
  CardBalanceResponse,
  DashProRedemptionPayload,
  DashProRedemptionForUserPayload,
  InitiateRedemptionPayload,
  CardsRedemptionPayload,
  RedemptionResponse,
  UpdateRedemptionStatusPayload,
  GetRedemptionsParams,
  GetUserRedemptionsParams,
  GetVendorRedemptionsParams,
  GetRedemptionsSummaryParams,
  RedemptionsSummaryResponse,
  VendorRedemptionsResponse,
  GetVendorRedemptionsListParams,
  GetRedemptionsAmountDashGoParams,
  GetRedemptionsAmountDashXParams,
  GetRedemptionsAmountDashPassParams,
} from '@/types'
import { getQueryString } from '@/utils/helpers'

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

const commonUrl = '/redemptions'

export const validateVendorMobileMoney = async (
  data: ValidateVendorMobileMoneyPayload,
): Promise<any> => {
  return await postMethod('/payments/mobile-money/account-details', data)
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

// Process DashPro redemption for logged-in users (no OTP required)
export const processDashProRedemptionForUser = async (
  data: DashProRedemptionForUserPayload,
): Promise<RedemptionResponse> => {
  const response = await axiosClient.post(`${commonUrl}/users/dash-pro`, data)
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
export const getVendorRedemptions = async (params?: GetVendorRedemptionsParams): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `${commonUrl}/vendors?${queryString}` : `${commonUrl}/vendors`
  const response = await axiosClient.get(fullUrl)
  return response
}

// Get redemptions summary
export const getRedemptionsSummary = async (
  params?: GetRedemptionsSummaryParams,
): Promise<RedemptionsSummaryResponse> => {
  const response = await axiosClient.get(`${commonUrl}/summary`, { params })
  return response as unknown as RedemptionsSummaryResponse
}

// Get vendor redemptions list (new endpoint /redemptions)
export const getVendorRedemptionsList = async (
  params?: GetVendorRedemptionsListParams,
): Promise<VendorRedemptionsResponse> => {
  const response = await axiosClient.get(`${commonUrl}`, { params })
  return response as unknown as VendorRedemptionsResponse
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

export const getRedemptionsAmountDashGo = async (
  params: GetRedemptionsAmountDashGoParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-go`, params)
}

export const getRedemptionsAmountDashPro = async (): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-pro`)
}

export const getRedemptionsAmountDashX = async (
  params?: GetRedemptionsAmountDashXParams,
): Promise<any> => {
  return await getList(`${commonUrl}/recipient-amounts/dash-x`, params)
}

export const getRedemptionsAmountDashPass = async (
  params?: GetRedemptionsAmountDashPassParams,
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

// Re-export types from @/types for consumers that import from this module
export type {
  ValidateVendorMobileMoneyPayload,
  ValidateVendorMobileMoneyResponse,
  SearchVendorsParams,
  VendorSearchResult,
  SearchVendorsResponse,
  CardBalanceParams,
  CardBalanceResponse,
  DashProRedemptionPayload,
  DashProRedemptionForUserPayload,
  InitiateRedemptionPayload,
  CardsRedemptionPayload,
  RedemptionResponse,
  UpdateRedemptionStatusPayload,
  GetRedemptionsParams,
  GetUserRedemptionsParams,
  GetVendorRedemptionsParams,
  GetBranchRedemptionsParams,
  GetRedemptionsSummaryParams,
  RedemptionsSummaryResponse,
  RedemptionItem,
  VendorRedemptionsResponse,
  GetVendorRedemptionsListParams,
  GetRedemptionsAmountDashGoParams,
  GetRedemptionsAmountDashXParams,
  GetRedemptionsAmountDashPassParams,
} from '@/types'
