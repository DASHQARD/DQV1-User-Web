import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react-router'

import { ToastProvider } from '../ToastProvider'
import { useAuthSessionBootstrap, useAutoRefreshToken } from '@/hooks'
import { resetAuthInterceptorState } from '@/libs/axios'
import { useAuthStore } from '@/stores'
import { cancelMemberSessionQueries } from '@/utils/memberSessionQueries'

const queryClient = new QueryClient()

function useMemberLogoutQueryCleanup() {
  const wasMemberSession = useRef(false)

  useEffect(() => {
    const syncMemberFlag = () => {
      const { isAuthenticated, isGuestAuth } = useAuthStore.getState()
      wasMemberSession.current = isAuthenticated && !isGuestAuth
    }

    syncMemberFlag()

    return useAuthStore.subscribe((state) => {
      const isMemberSession = state.isAuthenticated && !state.isGuestAuth
      if (wasMemberSession.current && !isMemberSession) {
        cancelMemberSessionQueries(queryClient)
        resetAuthInterceptorState()
      }
      wasMemberSession.current = isMemberSession
    })
  }, [])
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  useAuthSessionBootstrap()
  useAutoRefreshToken()
  useMemberLogoutQueryCleanup()

  return (
    <ToastProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NuqsAdapter>
    </ToastProvider>
  )
}
