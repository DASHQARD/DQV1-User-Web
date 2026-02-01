import { axiosClient } from '@/libs'
import { deleteMethod, getList, getMethod, patchMethod } from '@/services/requests'
import { getQueryString } from '@/utils/helpers'

const VENDOR_MANAGEMENT_BASE = '/vendor-management'

/** GET /vendor-management/invitations — list vendor invitations (search, dateFrom, dateTo, status: pending | accepted | expired | cancelled) */
export const getVendorInvitations = async (params?: {
  search?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  limit?: number
  after?: string
}): Promise<any> => {
  const query: Record<string, string | number | undefined> = {}
  if (params?.search != null && params.search !== '') query.search = params.search
  if (params?.dateFrom) query.dateFrom = params.dateFrom
  if (params?.dateTo) query.dateTo = params.dateTo
  if (params?.status) query.status = params.status
  if (params?.limit) query.limit = params.limit
  if (params?.after) query.after = params.after
  const queryString = getQueryString(query)
  const fullUrl = queryString
    ? `${VENDOR_MANAGEMENT_BASE}/invitations?${queryString}`
    : `${VENDOR_MANAGEMENT_BASE}/invitations`
  const response = await axiosClient.get(fullUrl)
  return response
}

/** PATCH /vendor-management/cancel-invitation */
export const cancelVendorInvitation = async (data: { invitation_id: number }): Promise<any> => {
  return await patchMethod(`${VENDOR_MANAGEMENT_BASE}/cancel-invitation`, data)
}

/** GET /vendor-management/all-vendors — filter by status (active | inactive | suspended | pending), search, dateFrom, dateTo */
export const getAllVendorsManagement = async (params?: {
  search?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  limit?: number
  after?: string
}): Promise<any> => {
  const query: Record<string, string | number | undefined> = {}
  if (params?.search != null && params.search !== '') query.search = params.search
  if (params?.dateFrom) query.dateFrom = params.dateFrom
  if (params?.dateTo) query.dateTo = params.dateTo
  if (params?.status) query.status = params.status
  if (params?.limit) query.limit = params.limit
  if (params?.after) query.after = params.after
  const queryString = getQueryString(query)
  const fullUrl = queryString
    ? `${VENDOR_MANAGEMENT_BASE}/all-vendors?${queryString}`
    : `${VENDOR_MANAGEMENT_BASE}/all-vendors`
  const response = await axiosClient.get(fullUrl)
  return response
}

/** GET /vendor-management/vendor/{id} */
export const getVendorByIdManagement = async (id: number | string): Promise<any> => {
  return await getMethod(`${VENDOR_MANAGEMENT_BASE}/vendor`, String(id))
}

/** DELETE /vendor-management/vendor/{id} */
export const deleteVendorManagement = async (id: number | string): Promise<any> => {
  return await deleteMethod(`${VENDOR_MANAGEMENT_BASE}/vendor/${id}`)
}

/** PATCH /vendor-management/status */
export const updateVendorStatusManagement = async (data: {
  vendor_account_id: number
  status: string
}): Promise<any> => {
  return await patchMethod(`${VENDOR_MANAGEMENT_BASE}/status`, data)
}

/** PATCH /vendor-management/remove-vendor-admin */
export const removeVendorAdminManagement = async (data: {
  vendor_user_id: number
  password: string
}): Promise<any> => {
  return await patchMethod(`${VENDOR_MANAGEMENT_BASE}/remove-vendor-admin`, data)
}

/** GET /vendor-management/qr-code */
export const getVendorQrCodeManagement = async (vendorId?: string): Promise<any> => {
  const url = vendorId
    ? `${VENDOR_MANAGEMENT_BASE}/qr-code?vendor_id=${encodeURIComponent(vendorId)}`
    : `${VENDOR_MANAGEMENT_BASE}/qr-code`
  return await getList(url)
}
