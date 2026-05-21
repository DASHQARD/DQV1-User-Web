import { axiosClient } from '@/libs'
import type { UserProfileResponse, PaymentInfoData, PaymentResponse, GetUserPaymentsParams } from '@/types'
import { getList } from './requests'

const getPresignedURL = async (file: string) => {
  return await axiosClient.post(`/file/generate/signed-url`, { file })
}

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

const getUserProfile = async () => {
  return await getList<UserProfileResponse>(`/users/info`)
}

const paymentInfo = async (data: PaymentInfoData) => {
  const response = await axiosClient.post(`/auth/payment-details`, data)
  return response.data
}

const getPaymentInfo = async () => {
  const response = await axiosClient.get<PaymentResponse>(`/payments`)
  return response
}

const getPaymentById = async (params?: GetUserPaymentsParams) => {
  const response = await axiosClient.get<PaymentResponse>(`/payments/users`, { params })
  return response
}

const updateUserAvatar = async (data: { file_url: string }) => {
  const response = await axiosClient.patch(`/users/avatar`, data)
  return response.data
}

const createTicket = async (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  const response = await axiosClient.post(`/tickets`, data)
  return response.data
}

export {
  uploadFiles,
  getPresignedURL,
  getUserProfile,
  paymentInfo,
  getPaymentInfo,
  getPaymentById,
  updateUserAvatar,
  createTicket,
}
