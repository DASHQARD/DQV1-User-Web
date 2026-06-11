import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores'

import { ENV_VARS, ROUTES } from '../utils/constants'
import {
  isInvalidTokenTypeMessage,
  refreshStoredAccessToken,
} from '@/utils/authSession'
import {
  isGuestSessionAuth,
  recreateGuestSession,
} from '@/features/website/services/guestSession'
import {
  canRetryRequestAfterGuestRecovery,
  isMemberOnlyRequestPath,
  shouldRecoverWithGuestSession,
} from '@/utils/authRequestRecovery'

const instance = axios.create({
  baseURL: `${ENV_VARS.API_BASE_URL}/api/v1`,
})

const CANCELLED_STATUS_CODE = 499

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

/** Clears in-flight refresh queue — call when the member session ends (logout). */
export function resetAuthInterceptorState() {
  isRefreshing = false
  failedQueue = []
}

const shouldRedirectToLogin = () => {
  const path = window.location.pathname
  return !path.includes('auth') && !path.includes('/redeem')
}

function getErrorBody(error: AxiosError): Record<string, unknown> | undefined {
  const errorData = error?.response?.data
  if (errorData && typeof errorData === 'object') {
    return errorData as Record<string, unknown>
  }
  return undefined
}

function getErrorMessage(error: AxiosError): string {
  const errorData = error?.response?.data
  return typeof errorData === 'string'
    ? errorData
    : (errorData as { message?: string })?.message || error.message || ''
}

function errorHandler(error: AxiosError) {
  let { status } = error.response || {}
  status = error.code === 'ERR_CANCELED' ? CANCELLED_STATUS_CODE : status
  const body = getErrorBody(error)

  throw {
    status,
    message: getErrorMessage(error) || 'Sorry, an unexpected error occurred.',
    requires_account: body?.requires_account === true,
  }
}

function clearAuthAndMaybeRedirect() {
  const state = useAuthStore.getState()
  if (state.isGuestAuth && isGuestSessionAuth()) {
    return
  }
  const wasGuest = state.isGuestAuth
  if (wasGuest) {
    useAuthStore.getState().logout()
    return
  }
  useAuthStore.getState().reset()
  if (shouldRedirectToLogin()) {
    window.location.pathname = ROUTES.IN_APP.HOME
  }
}

instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().getToken()
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  } else if (request.headers.Authorization) {
    delete request.headers.Authorization
  }
  return request
})

instance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    let { status } = error.response || {}
    status = error.code === 'ERR_CANCELED' ? CANCELLED_STATUS_CODE : status

    if (status === 401 && !window.location.pathname.includes('auth')) {
      const errorMessage = getErrorMessage(error)
      const requestUrl = originalRequest?.url
      const authState = useAuthStore.getState()

      if (
        !authState.getToken() &&
        !authState.getRefreshToken() &&
        isMemberOnlyRequestPath(requestUrl)
      ) {
        return errorHandler(error)
      }

      if (
        originalRequest?.url?.includes('/auth/refresh-token') ||
        originalRequest?.url?.includes('/guest-auth/token/refresh')
      ) {
        clearAuthAndMaybeRedirect()
        return errorHandler(error)
      }

      if (isInvalidTokenTypeMessage(errorMessage)) {
        clearAuthAndMaybeRedirect()
        return errorHandler(error)
      }

      if (originalRequest._retry) {
        clearAuthAndMaybeRedirect()
        return errorHandler(error)
      }

      const canRecoverGuestSession =
        shouldRecoverWithGuestSession(errorMessage) &&
        canRetryRequestAfterGuestRecovery(requestUrl)

      if (canRecoverGuestSession) {
        originalRequest._retry = true
        try {
          const newToken = await recreateGuestSession()
          if (originalRequest.headers && newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return instance(originalRequest)
        } catch {
          return errorHandler(error)
        }
      }

      if (isGuestSessionAuth() && isMemberOnlyRequestPath(requestUrl)) {
        clearAuthAndMaybeRedirect()
        return errorHandler(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            const newToken = useAuthStore.getState().getToken()
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return instance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshStoredAccessToken()
        isRefreshing = false

        if (originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        processQueue()
        return instance(originalRequest)
      } catch {
        isRefreshing = false
        processQueue(new Error('Token refresh failed'))
        const canRecoverAfterRefreshFailure =
          shouldRecoverWithGuestSession(errorMessage) &&
          canRetryRequestAfterGuestRecovery(originalRequest?.url)
        if (canRecoverAfterRefreshFailure) {
          try {
            const newToken = await recreateGuestSession()
            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return instance(originalRequest)
          } catch {
            return errorHandler(error)
          }
        }
        clearAuthAndMaybeRedirect()
        return errorHandler(error)
      }
    }

    return errorHandler(error)
  },
)

export { instance as axiosClient }
