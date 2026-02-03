import { axiosClient } from '@/libs'

export interface BulkGiftCardUploadResponse {
  status: string
  message: string
  data?: {
    total: number
    successful: number
    failed: number
    errors?: Array<{ row: number; error: string }>
  }
}

export const bulkUploadGiftCards = async (file: File): Promise<BulkGiftCardUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosClient.post('/carts/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response as unknown as BulkGiftCardUploadResponse
}
