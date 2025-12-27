import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores'

import { ENV_VARS, ROUTES } from '../utils/constants'

const instance = axios.create({
  baseURL: `${ENV_VARS.API_BASE_URL}/api/v1`,
})

const CANCELLED_STATUS_CODE = 499

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
// Queue to store failed requests while token is being refreshed
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

// Process queued requests after token refresh
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Check if token is valid (not expired)
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() < exp
  } catch {
    return false
  }
}

// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshTokenValue = useAuthStore.getState().getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }

  try {
    // Use axios directly to avoid interceptor loop
    const response = await axios.post(`${ENV_VARS.API_BASE_URL}/api/v1/auth/refresh-token`, {
      refresh_token: refreshTokenValue,
    })

    // Handle different response structures
    const responseData = response?.data?.data || response?.data || response
    const accessToken =
      responseData?.accessToken ||
      responseData?.tokens?.accessToken ||
      responseData?.data?.accessToken
    const newRefreshToken =
      responseData?.refreshToken ||
      responseData?.tokens?.refreshToken ||
      responseData?.data?.refreshToken

    if (!accessToken) {
      throw new Error('Unable to refresh access token')
    }

    // Update tokens in store
    useAuthStore.getState().authenticate({
      token: accessToken,
      refreshToken: newRefreshToken || refreshTokenValue,
    })

    return accessToken
  } catch (error) {
    // Refresh failed, logout user
    const reset = useAuthStore.getState().reset
    reset()
    if (!window.location.pathname.includes('auth')) {
      window.location.pathname = ROUTES.IN_APP.AUTH.LOGIN
    }
    throw error
  }
}

function errorHandler(error: AxiosError) {
  let { status } = error.response || {}
  status = error.code === 'ERR_CANCELED' ? CANCELLED_STATUS_CODE : status

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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    let { status } = error.response || {}
    status = error.code === 'ERR_CANCELED' ? CANCELLED_STATUS_CODE : status

    // Handle 401 Unauthorized errors
    if (status === 401 && !window.location.pathname.includes('auth')) {
      // Skip refresh for refresh token endpoint to avoid infinite loop
      if (originalRequest?.url?.includes('/auth/refresh-token')) {
        const reset = useAuthStore.getState().reset
        reset()
        window.location.pathname = ROUTES.IN_APP.AUTH.LOGIN
        return errorHandler(error)
      }

      // Check if token is valid first
      const currentToken = useAuthStore.getState().getToken()
      if (currentToken && isTokenValid(currentToken)) {
        // Token is valid but request failed, might be a different issue
        return errorHandler(error)
      }

      // If already retried, don't retry again
      if (originalRequest._retry) {
        return errorHandler(error)
      }

      // If refresh is in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            // Retry the original request with new token
            const newToken = useAuthStore.getState().getToken()
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return instance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Start token refresh
      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        isRefreshing = false

        // Update the original request with new token
        if (originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        // Process queued requests
        processQueue()

        // Retry the original request
        return instance(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError)
        return errorHandler(error)
      }
    }

    // For non-401 errors, use the standard error handler
    return errorHandler(error)
  },
)

export { instance as axiosClient }
