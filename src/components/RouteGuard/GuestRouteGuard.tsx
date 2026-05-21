import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

type Props = Readonly<{
  children: React.ReactNode
}>

/** Website-only routes for OTP guest sessions (not member dashboard). */
export function GuestRouteGuard({ children }: Props) {
  const { isAuthenticated, isGuestAuth } = useAuthStore()

  if (!isAuthenticated || !isGuestAuth) {
    return <Navigate to={ROUTES.IN_APP.DASHQARDS} replace />
  }

  return <>{children}</>
}
