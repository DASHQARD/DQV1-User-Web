import { axiosClient } from '@/libs'
import type {
  VendorsListResponse,
  VendorsQueryParams,
  VendorDetailsResponse,
  UpdateVendorStatusPayload,
  UpdateVendorStatusResponse,
} from '@/types/vendor'
import type {
  CustomersListResponse,
  CustomersQueryParams,
  CustomerDetailsResponse,
  UpdateCustomerStatusPayload,
  UpdateCustomerStatusResponse,
} from '@/types/customer'
import type {
  InviteAdminPayload,
  InviteAdminResponse,
  AdminRefreshTokenPayload,
  AdminRefreshTokenResponse,
} from '@/types/admin'
import type { RolesListResponse, PermissionsListResponse } from '@/types/role'

const adminLogin = async (data: { email: string; password: string }) => {
  const response = await axiosClient.post(`/admin/login`, data)
  return response.data
}

const verifyLoginToken = async (token: string) => {
  const response = await axiosClient.post(`/admin/verify-login-token`, { token })
  return response.data
}

const getVendors = async (params?: VendorsQueryParams): Promise<VendorsListResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.get('/vendors/all', { params })
  return response as unknown as VendorsListResponse
}

const getVendorInfo = async (id: number): Promise<VendorDetailsResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.get(`/vendors/info/${id}`)
  return response as unknown as VendorDetailsResponse
}

const updateVendorStatus = async (
  data: UpdateVendorStatusPayload,
): Promise<UpdateVendorStatusResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.patch('/vendors/status', data)
  return response as unknown as UpdateVendorStatusResponse
}

const getCustomers = async (params?: CustomersQueryParams): Promise<CustomersListResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.get('/users/all', { params })
  return response as unknown as CustomersListResponse
}

const getCustomerInfo = async (id: number): Promise<CustomerDetailsResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.get(`/users/info/${id}`)
  return response as unknown as CustomerDetailsResponse
}

const updateCustomerStatus = async (
  data: UpdateCustomerStatusPayload,
): Promise<UpdateCustomerStatusResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.patch('/users/manage-account-status', data)
  return response as unknown as UpdateCustomerStatusResponse
}

const inviteAdmin = async (data: InviteAdminPayload): Promise<InviteAdminResponse> => {
  const response = await axiosClient.post('/admin/invite', data)
  return response as unknown as InviteAdminResponse
}

const refreshAdminToken = async (
  data: AdminRefreshTokenPayload,
): Promise<AdminRefreshTokenResponse> => {
  const response = await axiosClient.post('/admin/refresh-token', data)
  return response as unknown as AdminRefreshTokenResponse
}

const onboardAdmin = async (data: {
  verification_code: string
  phone_number: string
  password: string
}) => {
  const response = await axiosClient.post('/admin/onboard', data)
  return response.data
}

const getRoles = async (): Promise<RolesListResponse> => {
  const response = await axiosClient.get('/roles/all')
  return response as unknown as RolesListResponse
}

const getPermissions = async (): Promise<PermissionsListResponse> => {
  const response = await axiosClient.get('/permissions/all')
  return response as unknown as PermissionsListResponse
}

export {
  adminLogin,
  verifyLoginToken,
  getVendors,
  getVendorInfo,
  updateVendorStatus,
  getCustomers,
  getCustomerInfo,
  updateCustomerStatus,
  inviteAdmin,
  refreshAdminToken,
  onboardAdmin,
  getRoles,
  getPermissions,
}
