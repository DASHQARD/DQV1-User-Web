import React from 'react'
import { Navigate } from 'react-router'

import { useAuthStore } from '@/stores'
import { isTesting, ROUTES } from '@/utils/constants'

type Props = Readonly<{
  children: React.ReactNode
}>
export function RouteGuard({ children }: Props) {
  const { isAuthenticated, reset } = useAuthStore()

  if (!isAuthenticated) {
    if (!isTesting) reset()
    return <Navigate to={ROUTES.IN_APP.AUTH.LOGIN} />
  }
  return <>{children}</>
}
