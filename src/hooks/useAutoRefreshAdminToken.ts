import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'

import { refreshAdminToken } from '@/features/admin/services'
import { useAuthStore } from '@/stores'
import { useToast } from './useToast'

type JwtPayload = {
  exp?: number
}
const REFRESH_THRESHOLD_MS = 60_000 // refresh 1 minute before expiry

export function useAutoRefreshAdminToken() {
  const token = useAuthStore((state) => state.token)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const authenticate = useAuthStore((state) => state.authenticate)
  const logout = useAuthStore((state) => state.logout)
  const toast = useToast()
  const refreshPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    // Only run if we're on an admin route
    if (!window.location.pathname.startsWith('/admin')) {
      return
    }

    console.log('[useAutoRefreshAdminToken] effect triggered', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
    })
    if (!token || !refreshToken) {
      console.log('[useAutoRefreshAdminToken] missing token or refresh token, skipping setup')
      return
    }

    let timeoutId: number | null = null

    const safeDecode = (jwtToken: string): JwtPayload | null => {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(jwtToken)
        console.log('[useAutoRefreshAdminToken] decoded token', decodedPayload)
        return decodedPayload
      } catch (error) {
        console.error('[useAutoRefreshAdminToken] failed to decode token', error)
        return null
      }
    }

    const runRefresh = async (activeRefreshToken: string) => {
      try {
        console.log('[useAutoRefreshAdminToken] starting refresh')
        const response = await refreshAdminToken({ refresh_token: activeRefreshToken })
        console.log('[useAutoRefreshAdminToken] refresh response', response)
        const nextAccessToken = response?.data?.accessToken ?? response?.accessToken ?? null
        const nextRefreshToken =
          response?.data?.refreshToken ?? response?.refreshToken ?? activeRefreshToken

        if (!nextAccessToken) {
          throw new Error('Unable to refresh access token')
        }

        authenticate({
          token: nextAccessToken,
          refreshToken: nextRefreshToken,
        })
        console.log('[useAutoRefreshAdminToken] refresh succeeded')
      } catch (error) {
        console.error('Failed to refresh admin token', error)
        logout()
        toast.error('Session expired. Please log in again.')
      }
    }

    const scheduleRefresh = () => {
      const decoded = safeDecode(token)
      if (!decoded?.exp) {
        console.warn('[useAutoRefreshAdminToken] no exp on token, cannot schedule refresh')
        return
      }
      const expiresAt = decoded.exp * 1000
      const refreshAt = expiresAt - REFRESH_THRESHOLD_MS
      const delay = refreshAt - Date.now()
      console.log('[useAutoRefreshAdminToken] scheduling refresh', {
        expiresAt,
        refreshAt,
        delay,
      })

      const trigger = () => {
        if (!refreshPromiseRef.current) {
          console.log('[useAutoRefreshAdminToken] triggering refresh now')
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
