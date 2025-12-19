import { axiosClient } from '@/libs'
import { getList } from '@/services/requests'

export const getCorporate = async (): Promise<any> => {
  return await getList<any>('/corporates')
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
