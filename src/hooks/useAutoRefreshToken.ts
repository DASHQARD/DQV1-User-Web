import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'

import { logout as logoutRequest } from '@/features/auth/services'
import { useAuthStore } from '@/stores'
import {
  ACCESS_TOKEN_REFRESH_THRESHOLD_MS,
  isAccessTokenExpired,
  refreshStoredAccessToken,
} from '@/utils/authSession'
import { useToast } from './useToast'

type JwtPayload = {
  exp?: number
}

export function useAutoRefreshToken() {
  const token = useAuthStore((state) => state.token)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const clearAuthState = useAuthStore((state) => state.logout)
  const toast = useToast()
  const refreshPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (!token || !isSessionReady) {
      return
    }

    let refreshTimeoutId: number | null = null
    let expiryTimeoutId: number | null = null

    const safeDecode = (jwtToken: string): JwtPayload | null => {
      try {
        return jwtDecode<JwtPayload>(jwtToken)
      } catch (error) {
        console.error('Failed to decode token', error)
        return null
      }
    }

    const runLogout = async () => {
      try {
        await logoutRequest()
      } catch (error) {
        console.error('Failed to call logout endpoint', error)
      } finally {
        clearAuthState()
      }
    }

    const runRefresh = async () => {
      try {
        await refreshStoredAccessToken()
      } catch (error) {
        console.error('Failed to refresh token', error)
        await runLogout()
        toast.error('Session expired. Please log in again.')
      }
    }

    const scheduleForcedLogout = () => {
      const refreshDecoded = refreshToken ? safeDecode(refreshToken) : null
      const accessDecoded = safeDecode(token)
      const sessionExpSeconds = refreshDecoded?.exp ?? accessDecoded?.exp

      if (!sessionExpSeconds) return

      const sessionExpiresAt = sessionExpSeconds * 1000
      const delay = sessionExpiresAt - Date.now()

      const forceLogout = async () => {
        await runLogout()
        toast.error('Session expired. Please log in again.')
      }

      if (delay <= 0) {
        void forceLogout()
        return
      }

      expiryTimeoutId = window.setTimeout(() => {
        void forceLogout()
      }, delay)
    }

    const scheduleRefresh = () => {
      if (!refreshToken) return

      if (!isAccessTokenExpired(token, ACCESS_TOKEN_REFRESH_THRESHOLD_MS)) {
        const decoded = safeDecode(token)
        if (!decoded?.exp) return
        const expiresAt = decoded.exp * 1000
        const refreshAt = expiresAt - ACCESS_TOKEN_REFRESH_THRESHOLD_MS
        const delay = refreshAt - Date.now()

        refreshTimeoutId = window.setTimeout(() => {
          if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = runRefresh()
          }
          refreshPromiseRef.current.finally(() => {
            refreshPromiseRef.current = null
          })
        }, delay)
        return
      }

      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = runRefresh()
      }
      refreshPromiseRef.current.finally(() => {
        refreshPromiseRef.current = null
      })
    }

    scheduleForcedLogout()
    scheduleRefresh()

    return () => {
      if (refreshTimeoutId) {
        window.clearTimeout(refreshTimeoutId)
      }
      if (expiryTimeoutId) {
        window.clearTimeout(expiryTimeoutId)
      }
    }
  }, [token, refreshToken, isGuestAuth, isSessionReady, clearAuthState, toast])
}
