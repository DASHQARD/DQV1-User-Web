import { axiosClient } from '@/libs'

const uploadFiles = async (data: File[]) => {
  const formData = new FormData()
  data.forEach((file) => {
    formData.append('file', file)
  })
  const response = await axiosClient.post(`/file/upload/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const getPresignedURL = async (file: string) => {
  const response = await axiosClient.post(`/file/upload/presigned-url`, { file })
  return response.data
}

export { uploadFiles, getPresignedURL }
