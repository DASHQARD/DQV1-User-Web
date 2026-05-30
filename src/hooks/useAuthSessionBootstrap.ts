import { useEffect } from 'react'

import { useAuthStore } from '@/stores'
import { isAccessTokenExpired, refreshStoredAccessToken } from '@/utils/authSession'

/**
 * After auth store rehydrates, refresh an expired access token before guest/member API queries run.
 */
export function useAuthSessionBootstrap() {
  const setSessionReady = useAuthStore((state) => state.setSessionReady)

  useEffect(() => {
    let cancelled = false

    const finishBootstrap = async () => {
      const { token, refreshToken } = useAuthStore.getState()

      if (!token) {
        if (!cancelled) setSessionReady(true)
        return
      }

      if (isAccessTokenExpired(token) && refreshToken) {
        try {
          await refreshStoredAccessToken()
        } catch {
          // refreshStoredAccessToken callers / axios may reset auth on hard failure
        }
      }

      if (!cancelled) setSessionReady(true)
    }

    if (useAuthStore.persist.hasHydrated()) {
      void finishBootstrap()
      return () => {
        cancelled = true
      }
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      void finishBootstrap()
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [setSessionReady])
}
