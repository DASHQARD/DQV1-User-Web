import { axiosClient } from '@/libs'
import { deleteMethod, getList, patchMethod, postMethod, putMethod } from '@/services/requests'
import { getQueryString } from '@/utils/helpers'
import type {
  InviteAdminPayload,
  AcceptCorporateAdminInvitationPayload,
  CreateVendorPayload,
} from '@/types/forms'
import type {
  CreateRecipientPayload,
  AssignRecipientPayload,
  AddToCartPayload,
} from '@/types/responses'

const CORPORATE_API_URL = '/corporate-admin'

export const getCorporate = async (): Promise<any> => {
  return await getList<any>(CORPORATE_API_URL)
}

export const getCorporateById = async (id: string): Promise<any> => {
  return await getList<any>(`${CORPORATE_API_URL}/admin/${id}`)
}

export const getAuditLogsCorporate = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/audit-logs/corporates?${queryString}` : `/audit-logs/corporates`
  const response = await axiosClient.get(fullUrl)
  // Axios interceptor already returns response.data, so response here is the API response body
  // which has { data: [...], pagination: {...}, status: ..., etc }
  return response
}

export const getRequestsCorporate = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/requests/corporate?${queryString}` : `/requests/corporate`
  const response = await axiosClient.get(fullUrl)
  return response
}

/** GET /requests/corporate-super-admin/vendor/:vendor_id/requests — requests for a vendor when corporate super admin has switched to that vendor */
export const getRequestsCorporateSuperAdminByVendor = async (
  vendorId: string | number,
): Promise<any> => {
  const response = await axiosClient.get(
    `/requests/corporate-super-admin/vendor/${vendorId}/requests`,
  )
  return response
}

/** GET /requests/corporate-super-admin/vendor/:vendor_id/info/:id */
export const getCorporateSuperAdminVendorRequestInfo = async (
  vendorId: string | number,
  id: number | string,
): Promise<any> => {
  return await getList(`/requests/corporate-super-admin/vendor/${vendorId}/info/${id}`)
}

export const updateRequestStatus = async (data: { id: number; status: string }): Promise<any> => {
  return await patchMethod(`/requests/corporate/update-status`, data)
}

/** PATCH /requests/corporate-super-admin/vendor/:vendor_id/update-status */
export const updateCorporateSuperAdminVendorRequestStatus = async (
  vendorId: string | number,
  data: { id: number; status: string },
): Promise<any> => {
  return await patchMethod(`/requests/corporate-super-admin/vendor/${vendorId}/update-status`, data)
}

export const getCorporateRequestById = async (id: number | string): Promise<any> => {
  return await getList(`/requests/corporate/info/${id}`)
}

export const deleteCorporateRequest = async (id: number | string): Promise<any> => {
  return await deleteMethod(`/requests/corporate/delete/${id}`)
}

/** DELETE /requests/corporate-super-admin/vendor/:vendor_id/delete/:id */
export const deleteCorporateSuperAdminVendorRequest = async (
  vendorId: string | number,
  id: number | string,
): Promise<any> => {
  return await deleteMethod(`/requests/corporate-super-admin/vendor/${vendorId}/delete/${id}`)
}

export const getCorporateAdmins = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString
    ? `${CORPORATE_API_URL}/admins?${queryString}`
    : `${CORPORATE_API_URL}/admins`
  const response = await axiosClient.get(fullUrl)
  // Axios interceptor already returns response.data, so response here is the API response body
  // which has { data: [...], pagination: {...}, status: ..., etc }
  return response
}

export const inviteAdmin = async (data: InviteAdminPayload): Promise<any> => {
  return await postMethod(`${CORPORATE_API_URL}/invite`, data)
}

/** POST /vendors/:vendor_id/admin/invite — when corporate super admin has switched to a vendor account */
export const inviteVendorAdmin = async (
  vendorId: number | string,
  data: InviteAdminPayload,
): Promise<any> => {
  return await postMethod(`/vendors/${vendorId}/admin/invite`, data)
}

export const getInvitedCorporateAdmins = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString
    ? `${CORPORATE_API_URL}/invitations?${queryString}`
    : `${CORPORATE_API_URL}/invitations`
  const response = await axiosClient.get(fullUrl)
  return response
}
export const acceptCorporateAdminInvitation = async (
  data: AcceptCorporateAdminInvitationPayload,
): Promise<any> => {
  return await postMethod(`${CORPORATE_API_URL}/accept-invitation`, data)
}

export const deleteCorporateAdminInvitation = async (id: string | number): Promise<any> => {
  return await deleteMethod(`${CORPORATE_API_URL}/invitation/${id}`)
}

export const removeCorporateAdmin = async (adminId: string | number): Promise<any> => {
  return await patchMethod(`${CORPORATE_API_URL}/remove-admin`, { admin_id: adminId })
}

export const updateCorporateAdminInvitation = async (data: {
  invitation_id: string | number
  email: string
  first_name: string
  last_name: string
  phone_number: string
}): Promise<any> => {
  return await patchMethod(`${CORPORATE_API_URL}/update-invitation`, data)
}

export const cancelCorporateAdminInvitation = async (
  invitationId: string | number,
): Promise<any> => {
  return await patchMethod(`${CORPORATE_API_URL}/cancel-invitation`, {
    invitation_id: invitationId,
  })
}

export const createVendor = async (data: CreateVendorPayload): Promise<any> => {
  return await postMethod('/vendor-management/create-vendor', data)
}

export const getCorporatePaymentDetails = async () => {
  return await getList(`/payment-details`)
}

export const getAllCorporatePayments = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/payments/users?${queryString}` : `/payments/users`
  const response = await axiosClient.get(fullUrl)
  // Axios interceptor already returns response.data, so response here is the API response body
  // which has { data: [...], pagination: {...}, status: ..., etc }
  return response
}

export const getPaymentById = async (id: string | number): Promise<any> => {
  return await getList(`/payments/users/${id}`)
}

export const addRecipient = async (data: CreateRecipientPayload): Promise<any> => {
  return await postMethod(`/carts/add/recipients`, data)
}

export const getAllRecipients = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/carts/users/recipients?${queryString}` : `/carts/users/recipients`
  const response = await axiosClient.get(fullUrl)
  // Axios interceptor already returns response.data, so response here is the API response body
  // which has { data: [...], pagination: {...}, status: ..., etc }
  return response
}

export const deleteRecipient = async (id: string | number): Promise<any> => {
  return await deleteMethod(`/carts/recipients/${id}`)
}

export const uploadBulkRecipients = async (file: File): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)
  return await postMethod(`/carts/upload-bulk-recipients`, formData)
}

export const assignRecipientToCart = async (data: AssignRecipientPayload): Promise<any> => {
  return await postMethod(`/carts/assign-recipient`, data)
}

export const assignCardToRecipients = async (data: {
  card_id: number
  recipient_ids: number[]
}): Promise<any> => {
  return await postMethod(`/carts/assign/card/recipients`, data)
}

export const createDashGoAndAssign = async (data: {
  recipient_ids: number[]
  vendor_id: number
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
  redemption_branches: Array<{ branch_id: number }>
}): Promise<any> => {
  return await postMethod(`/carts/create-dashgo-and-assign`, data)
}

export const createDashProAndAssign = async (data: {
  recipient_ids: number[]
  product: string
  description: string
  price: number
  currency: string
  images?: Array<{ file_url: string; file_name: string }>
  terms_and_conditions?: Array<{ file_url: string; file_name: string }>
  issue_date: string
}): Promise<any> => {
  return await postMethod(`/carts/create-dashpro-and-assign`, data)
}

export const addToCart = async (data: AddToCartPayload & { cart_id?: number }): Promise<any> => {
  return await postMethod(`/carts`, data)
}

export const getCarts = async (): Promise<any> => {
  return await getList(`/carts`)
}

export const getPaymentDetails = async (): Promise<any> => {
  return await getList(`/payment-details`)
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

export const getPaymentDetailsByUserId = async (userId: string | number): Promise<any> => {
  return await getList(`/payment-details/info/${userId}`)
}

export const checkout = async (data: {
  cart_id: number
  full_name: string
  email: string
  phone_number: string
  amount_due: number
  user_id: number
}): Promise<any> => {
  return await postMethod(`/payments/checkout`, data)
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
  return await putMethod(`/business-details`, data)
}

export const updateBusinessLogo = async (data: { file_url: string }): Promise<any> => {
  return await patchMethod(`/business-details/logo`, data)
}

export const updatePaymentDetails = async (data: {
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
  return await putMethod(`/payment-details`, data)
}

export const deletePaymentDetails = async (): Promise<any> => {
  return await deleteMethod(`/payment-details`)
}

export const getCorporateCards = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/cards/corporate-super-admin?${queryString}` : `/cards/corporate`
  const response = await axiosClient.get(fullUrl)
  return response
}

export const getCorporateSuperAdminCards = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString
    ? `/cards/corporate-super-admin?${queryString}`
    : `/cards/corporate-super-admin`
  const response = await axiosClient.get(fullUrl)
  return response
}

export const getCorporateSuperAdminCardById = async (id: number | string): Promise<any> => {
  return await getList(`/cards/corporate-super-admin/${id}`)
}

export const getCorporateSuperAdminVendorCardsSummary = async (
  vendorId: number | string,
): Promise<any> => {
  return await getList(`/cards/corporate-super-admin/vendor/${vendorId}/cards/summary`)
}

/** Fetch cards for a vendor when corporate super admin has switched to that vendor (GET /cards/corporate-super-admin/vendor/:vendor_id/cards) */
export const getCardsByVendorIdForCorporate = async (
  vendorId: number | string,
  params?: Record<string, any>,
): Promise<any> => {
  const queryString = getQueryString(params)
  const base = `/cards/corporate-super-admin/vendor/${vendorId}/cards`
  const fullUrl = queryString ? `${base}?${queryString}` : base
  const response = await axiosClient.get(fullUrl)
  return response
}

export const deleteCorporateSuperAdminCard = async (id: number | string): Promise<any> => {
  return await deleteMethod(`/cards/corporate-super-admin/${id}`)
}

export const updateCorporateSuperAdminCard = async (
  id: number | string,
  data: Record<string, any>,
): Promise<any> => {
  return await putMethod(`/cards/corporate-super-admin/${id}`, data)
}

export const requestBusinessUpdate = async (data: {
  fields_to_update: Record<string, boolean>
  proposed_values: Record<string, string>
  reason_for_change?: string
}): Promise<any> => {
  return await postMethod(`/business-details/request-update`, data)
}

export const getCorporateBranches = async (corporateUserId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${corporateUserId}`)
}

/** GET /branches/corporate?vendor_id=:vendor_id — branches for a vendor when corporate super admin has switched to that vendor */
export const getCorporateBranchesByVendorId = async (vendorId: number | string): Promise<any> => {
  return await getList(`/branches/corporate`, { vendor_id: vendorId })
}

export const getCorporateBranchesList = async (): Promise<any> => {
  return await getList(`/branches/corporate`)
}

export const getCorporateBranchById = async (branchId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${branchId}`)
}

export const getCorporateBranchManagers = async (branchId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${branchId}/managers`)
}

export const getCorporateBranchRedemptions = async (branchId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${branchId}/redemptions`)
}

export const getCorporateBranchCards = async (branchId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${branchId}/cards`)
}

export const getCorporateBranchSummary = async (branchId: number | string): Promise<any> => {
  return await getList(`/branches/corporate/${branchId}/summary`)
}

export const addCorporateBranch = async (data: any): Promise<any> => {
  return await postMethod(`/branches/corporate`, data)
}

export const deleteCorporateBranch = async (branchId: number | string): Promise<any> => {
  return await deleteMethod(`/branches/corporate/${branchId}`)
}

export const getCorporatePayments = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/payments/corporate?${queryString}` : `/payments/corporate`
  const response = await axiosClient.get(fullUrl)
  return response
}

export const getCorporatePaymentById = async (id: number | string): Promise<any> => {
  return await getList(`/payments/corporate/${id}`)
}

export const getCorporateRedemptions = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/redemptions/corporate?${queryString}` : `/redemptions/corporate`
  const response = await axiosClient.get(fullUrl)
  return response
}

/** GET /redemptions/corporate/vendors/:vendor_id — redemptions for a vendor when corporate super admin has switched to that vendor */
export const getCorporateRedemptionsByVendorId = async (
  vendorId: number | string,
  params?: Record<string, any>,
): Promise<any> => {
  const queryString = getQueryString(params)
  const base = `/redemptions/corporate/vendors/${vendorId}`
  const fullUrl = queryString ? `${base}?${queryString}` : base
  const response = await axiosClient.get(fullUrl)
  return response
}

export const getCorporateBranchManagerInvitations = async (
  params?: Record<string, any>,
): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString
    ? `/branches/corporate/branch-manager-invitations?${queryString}`
    : `/branches/corporate/branch-manager-invitations`
  const response = await axiosClient.get(fullUrl)
  return response
}

/** POST /branches/corporate/branch-manager-invitations */
export const createCorporateBranchManagerInvitation = async (data: {
  branch_id: number
  branch_manager_name: string
  branch_manager_email: string
  branch_manager_phone: string
}): Promise<any> => {
  return await postMethod(`/branches/corporate/branch-manager-invitations`, data)
}

export const getCorporateBranchManagerInvitationById = async (
  id: number | string,
): Promise<any> => {
  return await getList(`/branches/corporate/branch-manager-invitations/${id}`)
}

export const deleteCorporateBranchManagerInvitation = async (id: number | string): Promise<any> => {
  return await deleteMethod(`/branches/corporate/branch-manager-invitations/${id}`)
}

/** DELETE /branches/corporate/vendor-invitations/:id — when corporate super admin has switched to a vendor */
export const deleteCorporateVendorBranchManagerInvitation = async (
  id: number | string,
): Promise<any> => {
  return await deleteMethod(`/branches/corporate/vendor-invitations/${id}`)
}

/** PUT /branches/corporate/vendor-invitations/:id/cancel — update when corporate super admin has switched to a vendor */
export const updateCorporateVendorBranchManagerInvitation = async (
  id: number | string,
  data: {
    branch_manager_name: string
    branch_manager_email: string
    branch_manager_phone: string
  },
): Promise<any> => {
  return await putMethod(`/branches/corporate/vendor-invitations/${id}/cancel`, data)
}

export const updateCorporateBranchManagerInvitation = async (
  id: number | string,
  data: {
    branch_manager_name: string
    branch_manager_email: string
    branch_manager_phone: string
  },
): Promise<any> => {
  return await putMethod(`/branches/corporate/branch-manager-invitations/${id}`, data)
}
