export interface Branch {
  id: string
  user_id: number
  branch_manager_name: string
  branch_manager_email: string
  branch_name: string
  branch_location: string
  is_single_branch: boolean
  created_at: string
  updated_at: string
  vendor_id: number
  full_branch_id: string
  gvid: string
  parent_branch_id: string | null
  branch_code: string
  branch_type: string
  status: string
}

export interface OnboardBranchManagerPayload {
  branch_id: number
  password: string
  full_name: string
  email: string
  phone_number: string
  country: string
  country_code: string
}
export interface BranchesListResponse {
  status: string
  statusCode: number
  message: string
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    next: string | null
    previous: string | null
  }
  data: Branch[]
}

export interface DeleteBranchResponse {
  status: string
  statusCode: number
  message: string
}

export interface BulkBranchesUploadResponse {
  status: string
  statusCode: number
  message: string
  data: {
    successful: number
    failed: number
    total: number
  }
}

export type BranchData = {
  is_single_branch: true
  branch_name: string
  branch_location: string
  country: string
  country_code: string
  main_branch: true
  branches: {
    branch_manager_name: string
    branch_manager_email: string
    branch_name: string
    branch_location: string
  }[]
}
