import { getList, patchMethod, postMethod } from '@/services/requests'
import type {
  CreateVendorData,
  AcceptVendorInvitationData,
  CancelVendorInvitationPayload,
  UpdateVendorInfoPayload,
  RemoveVendorAdminPayload,
  ApproveVendorAdminPayload,
} from '@/types'

const commonManagerUrl = '/vendor-management'

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
  return await getList(`${commonManagerUrl}/all-vendors`, { relationship_type: 'owner_managed' })
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
