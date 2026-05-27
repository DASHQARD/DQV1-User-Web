import { Outlet } from 'react-router'
import { Sidebar } from '../components'
import { Navbar } from '@/components'
import { useInactivityLogout } from '@/hooks'
import { useDashboardLayout } from './useDashboardLayout'

export default function DashboardLayout() {
  useDashboardLayout()
  useInactivityLogout()

  return (
    <div className="no-print relative flex overflow-hidden h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="bg-gray-50 flex h-screen min-h-0 w-full flex-col overflow-hidden">
        <Navbar variant="dashboard" />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-10 py-5 pb-10 min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
