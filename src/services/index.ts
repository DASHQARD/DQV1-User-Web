import { axiosClient } from '@/libs'
import type { UserProfileResponse, PaymentInfoData, PaymentResponse } from '@/types'

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
  const response = await axiosClient.post(`/file/generate/signed-url`, { file })
  return response.data
}

const getUserProfile = async () => {
  const response = await axiosClient.get<UserProfileResponse>(`/users/info`)
  return response.data
}

const paymentInfo = async (data: PaymentInfoData) => {
  const response = await axiosClient.post(`/auth/payment-details`, data)
  return response.data
}

const getPaymentInfo = async () => {
  const response = await axiosClient.get<PaymentResponse>(`/payments`)
  return response
}

const getPaymentById = async (id: string) => {
  const response = await axiosClient.get<PaymentInfoData>(`/payments/user/${id}`)
  return response.data
}

export { uploadFiles, getPresignedURL, getUserProfile, paymentInfo, getPaymentInfo, getPaymentById }
