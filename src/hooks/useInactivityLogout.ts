import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

import { logout as logoutRequest } from '@/features/auth/services'
import { useAuthStore } from '@/stores'
import { ROUTES, isTesting } from '@/utils/constants'

import { useToast } from './useToast'

/** Default idle window before forced logout — aligned with our security baseline (10–15 min). */
const DEFAULT_TIMEOUT_MINUTES = 15

/**
 * Activity events fire very frequently (mousemove / scroll fire 60+/s). Coalesce
 * resets so we don't churn timers on every pointer pixel.
 */
const ACTIVITY_THROTTLE_MS = 1_000

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

type Options = {
  timeoutMinutes?: number
  redirectTo?: string
}

/**
 * Logs the authenticated user out after a period of inactivity.
 *
 * - Listens for mouse / keyboard / touch / scroll activity and resets a timer.
 * - On expiry, calls `/auth/logout` or `/guest-auth/logout` based on session type,
 *   clears local auth state and the react-query cache, then redirects to login.
 * - No-ops when unauthenticated or in the test environment.
 */
export function useInactivityLogout({
  timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
  redirectTo = ROUTES.IN_APP.AUTH.LOGIN,
}: Options = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { error } = useToast()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const clearAuthState = useAuthStore((state) => state.logout)

  const timerRef = useRef<number | null>(null)
  const lastResetAtRef = useRef(0)

  const handleLogout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch (err) {
      console.error('Failed to call logout endpoint on inactivity:', err)
    } finally {
      queryClient.clear()
      clearAuthState()
      error?.('You have been logged out due to inactivity.')
      navigate(redirectTo, { replace: true })
    }
  }, [clearAuthState, error, navigate, queryClient, redirectTo])

  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(
      () => {
        void handleLogout()
      },
      timeoutMinutes * 60 * 1000,
    )
  }, [handleLogout, timeoutMinutes])

  useEffect(() => {
    if (!isAuthenticated || isTesting) {
      return
    }

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastResetAtRef.current < ACTIVITY_THROTTLE_MS) {
        return
      }
      lastResetAtRef.current = now
      resetTimer()
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    resetTimer()

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [isAuthenticated, resetTimer])
}
