import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { useGuestOtpVerified } from '@/features/website/services/guestSession'

type Props = Readonly<{
  children: React.ReactNode
}>

/** Post-purchase guest pages — require OTP-verified guest auth, not browse session alone. */
export function GuestRouteGuard({ children }: Props) {
  const { isAuthenticated, isGuestAuth } = useAuthStore()
  const guestOtpVerified = useGuestOtpVerified()

  if (!isAuthenticated || !isGuestAuth || !guestOtpVerified) {
    return <Navigate to={ROUTES.IN_APP.DASHQARDS} replace />
  }

  return <>{children}</>
}
