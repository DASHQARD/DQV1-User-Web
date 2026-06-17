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
import type { UpdateBranchDetailsPayload, UpdateBranchPaymentDetailsPayload } from '@/types'

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

function mapRequestListParams(params?: Record<string, unknown>): Record<string, unknown> {
  if (!params) return {}
  const { status, ...rest } = params
  const apiParams: Record<string, unknown> = { ...rest }
  const normalizedStatus = String(status ?? '')
    .toLowerCase()
    .trim()
  if (normalizedStatus === 'pending') apiParams.pending = true
  else if (normalizedStatus === 'approved') apiParams.approved = true
  else if (normalizedStatus === 'rejected') apiParams.rejected = true
  return apiParams
}

export const getRequestsCorporate = async (params?: Record<string, any>): Promise<any> => {
  const apiParams = mapRequestListParams(params)
  const queryString = getQueryString(apiParams)
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

export const updateRequestStatus = async (data: {
  id: string | number
  status: string
  rejection_reason?: string
  comments?: string
}): Promise<any> => {
  return await patchMethod(`/requests/corporate/update-status`, {
    ...data,
    id: String(data.id),
  })
}

/** PATCH /requests/corporate-super-admin/vendor/:vendor_id/update-status */
export const updateCorporateSuperAdminVendorRequestStatus = async (
  vendorId: string | number,
  data: {
    id: string | number
    status: string
    rejection_reason?: string
    comments?: string
  },
): Promise<any> => {
  return await patchMethod(`/requests/corporate-super-admin/vendor/${vendorId}/update-status`, {
    ...data,
    id: String(data.id),
  })
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
  const response = await axiosClient.get(`/payments/users`, { params })
  return response
}

export const getPaymentById = async (_id: string | number): Promise<any> => {
  void _id
  // return await getList(`/payments/users/${id}`)
  return await getList(`/payments/users`)
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

/** DELETE /carts/bulk-recipients — delete all recipients that have been uploaded but not yet assigned to any cart items (clears unassigned bulk-uploaded recipients for the authenticated user) */
export const deleteUnassignedBulkRecipients = async (): Promise<any> => {
  return await deleteMethod(`/carts/bulk-recipients`)
}

export const assignRecipientToCart = async (data: AssignRecipientPayload): Promise<any> => {
  return await postMethod(`/carts/assign-recipient`, data)
}

export const assignCardToRecipients = async (data: {
  card_id: number | string
  recipient_ids: number[]
}): Promise<any> => {
  return await postMethod(`/carts/assign/card/recipients`, data)
}

export const createDashGoAndAssign = async (data: {
  recipient_ids: number[]
  vendor_id: string | number
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

export const getPaymentDetailsByBranchId = async (branchId: string | number): Promise<any> => {
  return await getList(`/payment-details/branch/${branchId}`)
}

export const getAdminPaymentDetailsByBranchId = async (branchId: string | number): Promise<any> => {
  return await getList(`/payment-details/admin/branch/${branchId}`)
}

export const checkout = async (data: {
  cart_id: number
  full_name: string
  email: string
  phone_number: string
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

/** POST /payment-details/request-update — corporate admin/super admin payment detail change requests */
export const requestPaymentDetailsUpdate = async (data: {
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
  return await postMethod(`/payment-details/request-update`, data)
}

export const updateBranchPaymentDetails = async (
  data: UpdateBranchPaymentDetailsPayload,
): Promise<any> => {
  return await putMethod(`/payment-details/update-branch`, data)
}

export const updateCorporateSuperAdminPaymentDetails = async (data: {
  target_type: 'branch' | 'vendor'
  target_id: string | number
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  bank_branch?: string
  account_holder_name?: string
  account_number?: string
  swift_code?: string
  sort_code?: string
}): Promise<any> => {
  return await putMethod(`/payment-details/corporate-super-admin/update`, data)
}

export const deletePaymentDetails = async (): Promise<any> => {
  return await deleteMethod(`/payment-details`)
}

export const deleteVendorBranchPaymentDetails = async (branchId: string | number): Promise<any> => {
  return await deleteMethod(`/payment-details/vendor/delete-branch/payment-details/${branchId}`)
}

export const addBranchPaymentDetails = async (data: {
  branch_id: string | number
  mobile_money_accounts: Array<{
    momo_number: string
    provider: string
  }>
  bank_accounts: Array<{
    account_number: string
    account_holder_name: string
    bank_name: string
    bank_branch: string
    swift_code: string
    sort_code: string
  }>
}): Promise<any> => {
  return await postMethod(`/vendors/add/branch-payment-details`, data)
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

/** POST /cards/corporate-super-admin/create-for-vendor */
export const createCorporateSuperAdminCardForVendor = async (
  data: Record<string, unknown> & { vendor_user_id: string | number },
): Promise<any> => {
  return await postMethod(`/cards/corporate-super-admin/create-for-vendor`, data)
}

/** PUT /cards/corporate-super-admin/vendor/:vendor_id/cards/:card_id */
export const updateCorporateSuperAdminVendorCard = async (
  vendorId: string | number,
  cardId: string | number,
  data: Record<string, unknown>,
): Promise<any> => {
  return await putMethod(
    `/cards/corporate-super-admin/vendor/${vendorId}/cards/${cardId}`,
    data,
  )
}

/** DELETE /cards/corporate-super-admin/vendor/:vendor_id/cards/:card_id */
export const deleteCorporateSuperAdminVendorCard = async (
  vendorId: string | number,
  cardId: string | number,
): Promise<any> => {
  return await deleteMethod(
    `/cards/corporate-super-admin/vendor/${vendorId}/cards/${cardId}`,
  )
}

export const requestBusinessUpdate = async (data: {
  fields_to_update: Record<string, boolean>
  proposed_values: Record<string, string>
  reason_for_change?: string
}): Promise<any> => {
  return await postMethod(`/business-details/request-update`, data)
}

/** POST /corporates/request-account-update — corporate admin/super admin account field change requests */
export const requestCorporateAccountUpdate = async (data: {
  fields_to_update: Record<string, boolean>
  proposed_values: Record<string, string>
  reason_for_change?: string
}): Promise<any> => {
  return await postMethod(`/corporates/request-account-update`, data)
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

/** GET /branches/corporate/{id}/managers — branch manager details for a specific branch (used when corporate has switched to a vendor account) */
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

export const updateCorporateBranchDetails = async (
  branchId: number | string,
  data: UpdateBranchDetailsPayload,
): Promise<any> => {
  return await patchMethod(`/branches/corporate/${branchId}/details`, data)
}

export const getCorporatePayments = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString ? `/payments/corporate?${queryString}` : `/payments/corporate`
  const response = await axiosClient.get(fullUrl)
  console.log('response', response)
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

/** GET /vendors/corporate-super-admin/:vendor_id/branch-managers — branch managers for a vendor when corporate super admin has switched to that vendor (vendor_id in path only; do not send in query) */
export const getCorporateSuperAdminBranchManagers = async (
  vendorId: number | string,
  params?: Record<string, any>,
): Promise<any> => {
  const rest = Object.fromEntries(
    Object.entries(params ?? {}).filter(([key]) => key !== 'vendor_id'),
  )
  const queryString = getQueryString(Object.keys(rest).length ? rest : undefined)
  const base = `/vendors/corporate-super-admin/${vendorId}/branch-managers`
  const fullUrl = queryString ? `${base}?${queryString}` : base
  const response = await axiosClient.get(fullUrl)
  return response
}

/** GET /branches/corporate/branch-manager-invitations — paginated list of branch manager invitations (used when corporate super admin has not switched to a vendor; pass vendor_id in params to scope) */
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
  branch_id: string | number
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

export * from './bulkGiftCards'
export * from './experienceApproval'
export * from './notifications'
export {
  getVendorInvitations,
  cancelVendorInvitation,
  getAllVendorsManagement,
  getVendorByIdManagement,
  deleteVendorManagement,
  removeVendorAdminManagement,
  getVendorQrCodeManagement,
} from './vendorManagement'
