import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { UserDashboard } from '../pages'

export function DashboardIndexResolver() {
  const [searchParams] = useSearchParams()
  const userType = useAuthStore((state) => (state.user as any)?.user_type)
  const account = searchParams.get('account')

  if (account === 'corporate') {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`} replace />
  }

  if (account === 'vendor') {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`} replace />
  }

  if (
    userType === 'corporate' ||
    userType === 'corporate admin' ||
    userType === 'corporate super admin'
  ) {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`} replace />
  }

  if (userType === 'vendor' || userType === 'corporate_vendor') {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`} replace />
  }

  if (userType === 'branch') {
    return <Navigate to={`${ROUTES.IN_APP.DASHBOARD.BRANCH.HOME}?account=branch`} replace />
  }

  return <UserDashboard />
}
