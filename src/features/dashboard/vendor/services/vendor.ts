import { axiosClient } from '@/libs'
import { getList, patchMethod, postMethod, putMethod, deleteMethod } from '@/services/requests'
import { getQueryString } from '@/utils/helpers'
import type {
  VendorsListResponse,
  UpdateVendorStatusPayload,
  VendorManagerDetailsResponse,
  BranchPaymentDetailsResponse,
  UpdateBranchPaymentDetailsPayload,
  AddBranchPaymentDetailsPayload,
  BranchManagerInvitationsResponse,
  GetBranchManagerInvitationsQuery,
  RemoveBranchManagerPayload,
  QueryType,
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

export const getRequestsVendor = async (params?: Record<string, any>): Promise<any> => {
  return await getList<any>(`/requests/vendors`, params)
}

export const getRequestVendorInfo = async (id: number | string): Promise<any> => {
  return await getList<any>(`/requests/vendors/info/${id}`)
}

export const updateRequestStatus = async (data: { id: number; status: string }): Promise<any> => {
  return await patchMethod(`/requests/vendors/update-status`, data)
}

export const deleteRequestVendor = async (id: number | string): Promise<any> => {
  return await deleteMethod(`/requests/vendors/delete/${id}`)
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
  branch_id?: number | string
}): Promise<any> => {
  return await postMethod(`/payment-details`, data)
}

export const updateBranchPaymentDetails = async (
  data: UpdateBranchPaymentDetailsPayload,
): Promise<any> => {
  return await putMethod(`/payment-details/update-branch`, data)
}

export const getBranchPaymentDetails = async (
  branchId: number | string,
): Promise<BranchPaymentDetailsResponse> => {
  return await getList<BranchPaymentDetailsResponse>(`/payment-details/branch/${branchId}`)
}

export const getVendorPayments = async (query?: QueryType): Promise<any> => {
  return await getList<any>(`/vendor-payments`, query)
}

export const deleteBranchPaymentDetails = async (branchId: number | string): Promise<any> => {
  return await deleteMethod(`/payment-details/vendor/delete-branch/payment-details/${branchId}`, {})
}

export const addBranchPaymentDetails = async (
  data: AddBranchPaymentDetailsPayload,
): Promise<any> => {
  return await postMethod(`/vendors/add/branch-payment-details`, data)
}

export const getBranchManagerInvitations = async (
  query?: GetBranchManagerInvitationsQuery,
): Promise<BranchManagerInvitationsResponse> => {
  const queryString = getQueryString(query)
  const fullUrl = queryString
    ? `${commonUrl}/branch-manager-invitations?${queryString}`
    : `${commonUrl}/branch-manager-invitations`
  const response = await axiosClient.get(fullUrl)
  return response
}

export const cancelBranchManagerInvitation = async (invitationId: number): Promise<any> => {
  return await postMethod(`/vendors/branch-manager-invitation/cancel/${invitationId}`)
}

export const deleteBranchManagerInvitation = async (invitationId: number): Promise<any> => {
  return await deleteMethod(`/vendors/branch-manager-invitation/${invitationId}`)
}

export const removeBranchManager = async (data: RemoveBranchManagerPayload): Promise<any> => {
  return await patchMethod(`/vendors/remove-branch-manager`, data)
}

export const acceptBranchManagerInvitation = async (data: {
  token: string
  password: string
}): Promise<any> => {
  return await postMethod(`/vendors/branch-manager-invitation/accept`, data)
}

export interface UpdateBranchManagerDetailsPayload {
  branch_manager_user_id: number
  email: string
  phone_number: string
  password: string
}

export const updateBranchManagerDetails = async (
  data: UpdateBranchManagerDetailsPayload,
): Promise<any> => {
  return await patchMethod(`/vendors/branch-manager/update-details`, data)
}

/** POST /vendors/co-admin/invite — when the user type is a vendor (invite co-admin) */
export const inviteCoAdmin = async (data: {
  email: string
  first_name: string
  last_name: string
  phone_number: string
  role: string
}): Promise<any> => {
  return await postMethod(`/vendors/co-admin/invite`, data)
}
