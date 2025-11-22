import axios, { AxiosError } from 'axios'

import { useAuthStore } from '@/stores'

import { ENV_VARS, ROUTES } from '../utils/constants'

const instance = axios.create({
  baseURL: `${ENV_VARS.API_BASE_URL}/api/v1`,
})

const CANCELLED_STATUS_CODE = 499
function errorHandler(error: AxiosError) {
  let { status } = error.response || {}
  status = error.code === 'ERR_CANCELED' ? CANCELLED_STATUS_CODE : status

  if (status === 401 && !window.location.pathname.includes('auth')) {
    const reset = useAuthStore.getState().reset
    reset()
    window.location.pathname = ROUTES.IN_APP.AUTH.LOGIN
  }

  const errorData = error?.response?.data
  const errorMessage =
    typeof errorData === 'string'
      ? errorData
      : (errorData as any)?.message || error.message || 'Sorry, an unexpected error occurred.'
  throw {
    status,
    message: errorMessage,
  }
}

instance.interceptors.request.use((request: any) => {
  const headers = request.headers
  const token = useAuthStore.getState().getToken()
  return {
    ...request,
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

instance.interceptors.response.use(
  (response) => {
    const setToken = useAuthStore.getState().setToken
    const { data } = response
    if (data?.token) setToken(data.token)
    return data
  },
  (error) => errorHandler(error),
)

export { instance as axiosClient }
