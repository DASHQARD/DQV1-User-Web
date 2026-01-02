import { getList, patchMethod, postMethod } from '@/services/requests'
import type {
  VendorsListResponse,
  UpdateVendorStatusPayload,
  VendorManagerDetailsResponse,
} from '@/types'

const commonUrl = '/vendors'

export const getAllVendors = async (): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/all`)
}

export const getSingleVendorInfo = async (id: string): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/info/${id}`)
}

export const updateVendorStatus = async (payload: UpdateVendorStatusPayload): Promise<any> => {
  return await patchMethod(`${commonUrl}/status`, payload)
}

export const getVendorManagerDetails = async (
  id: string,
): Promise<VendorManagerDetailsResponse> => {
  return await getList<VendorManagerDetailsResponse>(`${commonUrl}/manager-details/${id}`)
}

export const getVendorsDetails = async (): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/details`)
}

export const getAllVendorsDetails = async (): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/all/details`)
}

export const getAuditLogsVendor = async (): Promise<any> => {
  return await getList<any>(`/audit-logs/vendors`)
}

export const getRequestsVendor = async (): Promise<any> => {
  return await getList<any>(`/requests/vendors`)
}

export const updateRequestStatus = async (data: { id: number; status: string }): Promise<any> => {
  return await patchMethod(`/requests/vendors/update-status`, data)
}

export const updateBusinessDetails = async (data: {
  id: number
  name: string
  type: string
  phone: string
  email: string
  street_address: string
  digital_address: string
  registration_number: string
}): Promise<any> => {
  return await patchMethod(`/business-details`, data)
}

export const updateBusinessLogo = async (data: { file_url: string }): Promise<any> => {
  return await patchMethod(`/business-details/logo`, data)
}

export const addPaymentDetails = async (data: {
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  branch?: string
  account_name?: string
  account_number?: string
  swift_code?: string
  sort_code?: string
}): Promise<any> => {
  return await postMethod(`/payment-details`, data)
}
