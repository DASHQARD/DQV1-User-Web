import { axiosClient } from '@/libs'
import { getList, postMethod } from '@/services/requests'
import type {
  BusinessDetailsData,
  ChangePasswordData,
  CreateAccountData,
  LoginData,
  OnboardingData,
  UploadBusinessIDData,
  UploadUserIDData,
  PersonalDetailsWithIDData,
  UploadIdentificationPhotosData,
  PaymentMethodData,
  BusinessDetailsWithDocumentsData,
  UploadBusinessDocumentsData,
} from '@/types'

const commonUrl = '/auth'

const signUp = async (data: CreateAccountData) => {
  return await postMethod(`${commonUrl}/sign-up`, data)
}

const verifyEmail = async (token: string) => {
  return await postMethod(`${commonUrl}/verify-email`, { token })
}

const login = async (data: LoginData) => {
  return await postMethod(`${commonUrl}/login`, data)
}

const forgotPassword = async (email: string) => {
  return await postMethod(`${commonUrl}/forgot-password`, { email })
}

const resetPassword = async (data: { password: string; token: string }) => {
  return await postMethod(`${commonUrl}/reset-password`, data)
}

const changePassword = async (data: ChangePasswordData) => {
  return await postMethod(`${commonUrl}/change-password`, data)
}

const logout = async () => {
  return await postMethod(`${commonUrl}/logout`)
}

const refreshToken = async (refreshToken: string) => {
  return await postMethod(`${commonUrl}/refresh-token`, { refresh_token: refreshToken })
}

const personalDetails = async (data: OnboardingData) => {
  return await postMethod(`${commonUrl}/personal-details`, data)
}

const personalDetailsWithID = async (data: PersonalDetailsWithIDData) => {
  return await postMethod(`${commonUrl}/personal-details-with-identification`, data)
}

const uploadUserID = async (data: UploadUserIDData) => {
  const response = await axiosClient.post(`${commonUrl}/identifcation-photos`, data)
  return response.data
}

const uploadIdentificationPhotos = async (data: UploadIdentificationPhotosData) => {
  return await postMethod(`${commonUrl}/identifcation-photos`, data)
}

const paymentMethod = async (data: PaymentMethodData) => {
  return await postMethod(`${commonUrl}/payment-details`, data)
}

const verifyLoginOTP = async (token: string) => {
  const response = await axiosClient.post(`${commonUrl}/verify-login`, { token })
  return response.data
}

const businessDetails = async (data: BusinessDetailsData) => {
  return await postMethod(`${commonUrl}/business-details`, data)
}

const businessDocuments = async (data: UploadBusinessDocumentsData) => {
  return await postMethod(`${commonUrl}/business-documents`, data)
}

const businessUploadID = async (data: UploadBusinessIDData) => {
  return await postMethod(`${commonUrl}/business-documents`, data)
}

const resendRefreshToken = async (email: string) => {
  return await postMethod(`${commonUrl}/resend-login-token`, { email })
}

const getCountries = async () => {
  return await getList(`/countries`)
}

const getCountriesCode = async (country_code: string) => {
  return await getList(`/countries/code/${country_code}`)
}

const businessDetailsWithDocuments = async (data: BusinessDetailsWithDocumentsData) => {
  return await postMethod(`${commonUrl}/business-details-with-documents`, data)
}

export {
  refreshToken,
  businessUploadID,
  login,
  signUp,
  verifyEmail,
  personalDetails,
  personalDetailsWithID,
  uploadUserID,
  verifyLoginOTP,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  businessDetails,
  getCountries,
  uploadIdentificationPhotos,
  paymentMethod,
  businessDocuments,
  resendRefreshToken,
  businessDetailsWithDocuments,
  getCountriesCode,
}
