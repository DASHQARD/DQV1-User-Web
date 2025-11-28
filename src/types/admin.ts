export type Admin = {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  role_id: number | null
  type: string
  status: string
  created_at: string
  updated_at: string
}

export type AdminsListResponse = {
  status: string
  statusCode: number
  message: string
  data: Admin[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
  url: string
}

export type AdminsQueryParams = {
  limit?: number
  status?: string
  search?: string
  after?: string
}

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
