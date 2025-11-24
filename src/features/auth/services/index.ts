import { axiosClient } from '@/libs'
import type { CreateAccountData, LoginData, OnboardingData, UploadUserIDData } from '@/types'

const login = async (data: LoginData) => {
  const response = await axiosClient.post(`/auth/login`, data)
  return response.data
}

const createAccount = async (data: CreateAccountData) => {
  const response = await axiosClient.post(`/auth/sign-up`, data)
  return response.data
}

const verifyEmail = async (token: string) => {
  const response = await axiosClient.post(`/auth/verify-email`, { token })
  return response.data
}

const onboarding = async (data: OnboardingData) => {
  const response = await axiosClient.post(`/auth/personal-details`, data)
  return response.data
}

const uploadUserID = async (data: UploadUserIDData) => {
  const response = await axiosClient.post(`/auth/identifcation-photos`, data)
  return response.data
}

const verifyLoginOTP = async (token: string) => {
  const response = await axiosClient.post(`/auth/verify-login`, { token })
  return response.data
}

const forgotPassword = async (email: string) => {
  const response = await axiosClient.post(`/auth/forgot-password`, { email })
  return response.data
}

const resetPassword = async (data: { password: string; token: string }) => {
  const response = await axiosClient.post(`/auth/reset-password`, data)
  return response.data
}

export {
  login,
  createAccount,
  verifyEmail,
  onboarding,
  uploadUserID,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
}
