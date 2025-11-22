import { axiosClient } from '@/libs'
import type { CreateAccountData } from '@/types'

const login = async (data: LoginData) => {
  const response = await axiosClient.post(`/auth/login`, data)
  return response.data
}

const createAccount = async (data: CreateAccountData) => {
  const response = await axiosClient.post(`/auth/sign-up`, data)
  return response
}

export { login, createAccount }
