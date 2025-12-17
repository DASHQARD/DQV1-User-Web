import { axiosClient } from '@/libs'
import { getList } from '@/services/requests'

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

export const getBranches = async (): Promise<BranchesListResponse> => {
  return await getList<BranchesListResponse>('/vendors/branches')
}

export const deleteBranch = async (id: string): Promise<DeleteBranchResponse> => {
  const response = await axiosClient.delete(`/branches/${id}`)
  return response as unknown as DeleteBranchResponse
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

export const bulkUploadBranches = async (file: File): Promise<BulkBranchesUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosClient.post('/vendors/branches/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response as unknown as BulkBranchesUploadResponse
}
