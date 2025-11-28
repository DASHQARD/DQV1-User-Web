export type Role = {
  created_at: string
  created_by: string
  description: string
  id: number
  role: string
  updated_at: string
}

export type Permission = {
  category: string
  created_at: string
  description: string
  id: number
  permission: string
  updated_at: string
}

export type RolesListResponse = {
  status: string
  statusCode: number
  message: string
  data: Role[]
}

export type PermissionsListResponse = {
  status: string
  statusCode: number
  message: string
  data: Permission[]
}
