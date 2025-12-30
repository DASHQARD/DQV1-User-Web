import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'

import { refreshToken as refreshTokenRequest } from '@/features/auth/services'
import { useAuthStore } from '@/stores'
import { useToast } from './useToast'

type JwtPayload = {
  exp?: number
}
const REFRESH_THRESHOLD_MS = 60_000 // refresh 1 minute before expiry

export function useAutoRefreshToken() {
  const token = useAuthStore((state) => state.token)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const authenticate = useAuthStore((state) => state.authenticate)
  const logout = useAuthStore((state) => state.logout)
  const toast = useToast()
  const refreshPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    console.log('[useAutoRefreshToken] effect triggered', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    })
    if (!token || !refreshToken) {
      console.log('[useAutoRefreshToken] missing token or refresh token, skipping setup')
      return
    }

    let timeoutId: number | null = null

    const safeDecode = (jwtToken: string): JwtPayload | null => {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(jwtToken)
        console.log('[useAutoRefreshToken] decoded token', decodedPayload)
        return decodedPayload
      } catch (error) {
        console.error('[useAutoRefreshToken] failed to decode token', error)
        return null
      }
    }

    const runRefresh = async (activeRefreshToken: string) => {
      try {
        console.log('[useAutoRefreshToken] starting refresh')
        const response = await refreshTokenRequest(activeRefreshToken)
        console.log('[useAutoRefreshToken] refresh response', response)
        const nextAccessToken = response?.data?.tokens?.accessToken
        const nextRefreshToken = response?.data?.tokens?.refreshToken

        if (!nextAccessToken) {
          throw new Error('Unable to refresh access token')
        }

        authenticate({
          token: nextAccessToken,
          refreshToken: nextRefreshToken,
        })
        console.log('[useAutoRefreshToken] refresh succeeded')
      } catch (error) {
        console.error('Failed to refresh token', error)
        logout()
        toast.error('Session expired. Please log in again.')
      }
    }

    const scheduleRefresh = () => {
      const decoded = safeDecode(token)
      if (!decoded?.exp) {
        console.warn('[useAutoRefreshToken] no exp on token, cannot schedule refresh')
        return
      }
      const expiresAt = decoded.exp * 1000
      const refreshAt = expiresAt - REFRESH_THRESHOLD_MS
      const delay = refreshAt - Date.now()
      console.log('[useAutoRefreshToken] scheduling refresh', {
        expiresAt,
        refreshAt,
        delay,
      })

      const trigger = () => {
        if (!refreshPromiseRef.current) {
          console.log('[useAutoRefreshToken] triggering refresh now')
          refreshPromiseRef.current = runRefresh(refreshToken)
        }
        refreshPromiseRef.current.finally(() => {
          refreshPromiseRef.current = null
        })
      }

      if (delay <= 0) {
        trigger()
        return
      }

      timeoutId = window.setTimeout(trigger, delay)
    }

    scheduleRefresh()

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [token, refreshToken, authenticate, logout, toast])
}
