import { deleteMethod, getList, patchMethod, postMethod, putMethod } from '@/services/requests'
import type {
  InviteAdminPayload,
  AcceptCorporateAdminInvitationPayload,
  CreateVendorPayload,
} from '@/types/forms'
import type {
  CreateRecipientPayload,
  RecipientsListResponse,
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

export const getAuditLogsCorporate = async (): Promise<any> => {
  return await getList<any>(`/audit-logs/corporates`)
}

export const getRequestsCorporate = async (): Promise<any> => {
  return await getList<any>(`/requests/corporate`)
}

export const getCorporateAdmins = async (): Promise<any> => {
  return await getList<any>(`${CORPORATE_API_URL}/admins`)
}

export const inviteAdmin = async (data: InviteAdminPayload): Promise<any> => {
  return await postMethod(`${CORPORATE_API_URL}/invite`, data)
}

export const getInvitedCorporateAdmins = async (): Promise<any> => {
  return await getList<any>(`${CORPORATE_API_URL}/invitations`)
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

export const getAllCorporatePayments = async () => {
  return await getList(`/payments`)
}

export const getPaymentById = async (id: string | number): Promise<any> => {
  return await getList(`/payments/${id}`)
}

export const addRecipient = async (data: CreateRecipientPayload): Promise<any> => {
  return await postMethod(`/carts/add/recipients`, data)
}

export const getAllRecipients = async (): Promise<any> => {
  return await getList<RecipientsListResponse>(`/carts/users/recipients`)
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
