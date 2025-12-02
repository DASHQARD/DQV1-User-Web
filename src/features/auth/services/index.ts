import { axiosClient } from '@/libs'
import type {
  AddMainBranchData,
  BranchData,
  BusinessDetailsData,
  CreateAccountData,
  LoginData,
  OnboardingData,
  UploadBusinessIDData,
  UploadUserIDData,
} from '@/types'

const login = async (data: LoginData) => {
  const response = await axiosClient.post(`/auth/login`, data)
  return response.data
}

const refreshToken = async (token: string) => {
  const response = await axiosClient.post(`/auth/refresh-token`, {
    refresh_token: token,
  })
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

const businessDetails = async (data: BusinessDetailsData) => {
  const response = await axiosClient.post(`/auth/business-details`, data)
  return response.data
}

const businessUploadID = async (data: UploadBusinessIDData) => {
  const response = await axiosClient.post(`/auth/business-documents`, data)
  return response.data
}

const addBranch = async (data: BranchData) => {
  const response = await axiosClient.post(`/auth/add-branch`, data)
  return response.data
}

const getCountries = async () => {
  const response = await axiosClient.get<
    {
      id: number
      code: string
      iso_code: string
      name: string
      currency: string
      status: string
      created_at: string
      updated_at: string
    }[]
  >(`/countries`)
  return response.data
}

const uploadBranches = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosClient.post(`/auth/upload-branches`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const addMainBranch = async (data: AddMainBranchData) => {
  const response = await axiosClient.post(`/auth/add-main-branch`, data)
  return response.data
}

export {
  refreshToken,
  businessUploadID,
  login,
  createAccount,
  verifyEmail,
  onboarding,
  uploadUserID,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  businessDetails,
  addBranch,
  getCountries,
  uploadBranches,
  addMainBranch,
}
