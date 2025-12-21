import { getList, patchMethod, postMethod } from '@/services/requests'
import type {
  VendorsListResponse,
  UpdateVendorStatusPayload,
  VendorManagerDetailsResponse,
  CreateVendorData,
  AcceptVendorInvitationData,
  CancelVendorInvitationPayload,
  UpdateVendorInfoPayload,
  RemoveVendorAdminPayload,
  ApproveVendorAdminPayload,
} from '@/types'

const commonUrl = '/vendors'
const commonManagerUrl = '/vendor-management'

export const getAllVendors = async (): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/all`)
}

export const getSingleVendorInfo = async (id: string): Promise<VendorsListResponse> => {
  return await getList<VendorsListResponse>(`${commonUrl}/info/${id}`)
}

export const updateVendorStatus = async (
  payload: UpdateVendorStatusPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await patchMethod(`${commonUrl}/status`, payload)
  return response as unknown as { status: string; statusCode: number; message: string }
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

// Vendor Management Services

export const createVendor = async (data: CreateVendorData) => {
  return await postMethod(`${commonManagerUrl}/create-vendor`, data)
}

export const VendorInvite = async (token: string) => {
  return await getList(`${commonManagerUrl}/invitation/${token}`)
}

export const acceptVendorInvitation = async (data: AcceptVendorInvitationData) => {
  return await postMethod(`${commonManagerUrl}/accept-invitation`, data)
}

export const getVendorInvitations = async () => {
  return await getList(`${commonManagerUrl}/invitations`)
}

export const cancelVendorInvitation = async (payload: CancelVendorInvitationPayload) => {
  return await postMethod(`${commonManagerUrl}/cancel-invitation`, payload)
}

export const getAllVendorsManagement = async () => {
  return await getList(`${commonManagerUrl}/all-vendors`)
}

export const getVendorInfoById = async (id: string) => {
  return await getList(`${commonManagerUrl}/vendor/${id}`)
}

export const updateVendorInfo = async (id: string, data: UpdateVendorInfoPayload) => {
  return await patchMethod(`${commonManagerUrl}/vendor/${id}`, data)
}

export const removeVendorAdmin = async (data: RemoveVendorAdminPayload) => {
  return await postMethod(`${commonManagerUrl}/remove-admin`, data)
}

export const getAllVendorAdmins = async () => {
  return await getList(`${commonManagerUrl}/admin/vendors`)
}

export const approveVendorAdmin = async (data: ApproveVendorAdminPayload) => {
  return await postMethod(`${commonManagerUrl}/admin/approve`, data)
}
