import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { ROUTES } from '@/utils/constants'

/**
 * Tracks dashboard navigation for compliance redirect and manual access.
 * When user lands on dashboard home from within dashboard, marks as manually accessed
 * and clears compliance redirect state. Always updates previous path for any dashboard route.
 */
export function useDashboardLayout() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === ROUTES.IN_APP.DASHBOARD.HOME) {
      const previousPath = sessionStorage.getItem('previousDashboardPath')
      const isNavigatingWithinDashboard = previousPath && previousPath.startsWith('/dashboard')

      if (isNavigatingWithinDashboard) {
        sessionStorage.setItem('dashboardManuallyAccessed', 'true')
        sessionStorage.removeItem('complianceRedirectDone')
      }

      sessionStorage.setItem('previousDashboardPath', location.pathname)
    } else if (location.pathname.startsWith('/dashboard')) {
      sessionStorage.setItem('previousDashboardPath', location.pathname)
    }
  }, [location.pathname])
}
