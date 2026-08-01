import React from 'react'
import { Navigate } from 'react-router'

import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

type Props = Readonly<{
  children: React.ReactNode
}>

/** Protects member dashboard routes — redirect only; never mutate auth during render. */
export function RouteGuard({ children }: Props) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.IN_APP.HOME} replace />
  }

  if (isGuestAuth) {
    return <Navigate to={ROUTES.IN_APP.DASHQARDS} replace />
  }

  return <>{children}</>
}
