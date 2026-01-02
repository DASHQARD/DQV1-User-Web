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
    if (!token || !refreshToken) {
      return
    }

    let timeoutId: number | null = null

    const safeDecode = (jwtToken: string): JwtPayload | null => {
      try {
        const decodedPayload = jwtDecode<JwtPayload>(jwtToken)
        return decodedPayload
      } catch (error) {
        console.error('Failed to decode token', error)
        return null
      }
    }

    const runRefresh = async (activeRefreshToken: string) => {
      try {
        const response = await refreshTokenRequest(activeRefreshToken)
        const nextAccessToken = response?.data?.tokens?.accessToken
        const nextRefreshToken = response?.data?.tokens?.refreshToken

        if (!nextAccessToken) {
          throw new Error('Unable to refresh access token')
        }

        authenticate({
          token: nextAccessToken,
          refreshToken: nextRefreshToken,
        })
      } catch (error) {
        console.error('Failed to refresh token', error)
        logout()
        toast.error('Session expired. Please log in again.')
      }
    }

    const scheduleRefresh = () => {
      const decoded = safeDecode(token)
      if (!decoded?.exp) {
        return
      }
      const expiresAt = decoded.exp * 1000
      const refreshAt = expiresAt - REFRESH_THRESHOLD_MS
      const delay = refreshAt - Date.now()

      const trigger = () => {
        if (!refreshPromiseRef.current) {
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
