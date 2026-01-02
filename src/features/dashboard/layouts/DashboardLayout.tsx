import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Sidebar } from '../components'
import { ROUTES } from '@/utils/constants'
import { Navbar } from '@/components'

export default function DashboardLayout() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === ROUTES.IN_APP.DASHBOARD.HOME) {
      // Check if user navigated from within dashboard (not from login)
      const previousPath = sessionStorage.getItem('previousDashboardPath')
      const isNavigatingWithinDashboard = previousPath && previousPath.startsWith('/dashboard')

      if (isNavigatingWithinDashboard) {
        // User manually navigated to dashboard - allow them to see it
        sessionStorage.setItem('dashboardManuallyAccessed', 'true')
        sessionStorage.removeItem('complianceRedirectDone')
      }

      // Update previous path
      sessionStorage.setItem('previousDashboardPath', location.pathname)
    } else if (location.pathname.startsWith('/dashboard')) {
      // Track any dashboard navigation
      sessionStorage.setItem('previousDashboardPath', location.pathname)
    }
  }, [location.pathname])

  return (
    <div className="no-print relative flex overflow-hidden h-screen">
      <Sidebar />
      <div className="bg-gray-50 flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden">
        <Navbar />
        <main className="flex-1 px-5 sm:px-10 py-5 min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
