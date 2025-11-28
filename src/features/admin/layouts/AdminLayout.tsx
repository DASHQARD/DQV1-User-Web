import { Outlet } from 'react-router'
import { AdminSidebar } from '../components'
import { useAutoRefreshAdminToken } from '@/hooks/useAutoRefreshAdminToken'

export default function AdminLayout() {
  useAutoRefreshAdminToken()

  return (
    <div className="no-print relative flex">
      <AdminSidebar />
      <div className="bg-gray-50 flex h-screen w-full flex-col overflow-y-auto">
        <main className="flex-1 px-5 sm:px-10 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
