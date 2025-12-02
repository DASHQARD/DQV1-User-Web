export type InviteAdminPayload = {
  email: string
  first_name: string
  last_name: string
  role_id: string
  type: string
}

export type InviteAdminResponse = {
  status: string
  statusCode: number
  message: string
  data?: any
}

export type AdminRefreshTokenPayload = {
  refresh_token: string
}

export type AdminRefreshTokenResponse = {
  status: string
  statusCode: number
  message: string
  data?: {
    accessToken: string
    refreshToken: string
  }
  accessToken?: string
  refreshToken?: string
}

export interface Admin {
  id: number
  email: string
  status: string
  type: string
  role_id: number | null
  first_name: string
  last_name: string
  phone_number: string | null
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface AdminsQueryParams {
  limit?: number
  after?: string
  search?: string
  status?: string
}

export interface AdminsPaginationMeta {
  limit: number
  hasNextPage: boolean
  next: string | null
}

export interface AdminsListResponse {
  status: string
  statusCode: number
  message: string
  data: Admin[]
  pagination: AdminsPaginationMeta
}
