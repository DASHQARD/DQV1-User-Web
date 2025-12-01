import { Outlet } from 'react-router'
import { Sidebar } from '../components'

// import { AfriTransferLoader } from '@/assets/images'

// import { useAdminService } from '../hooks'

export default function DashboardLayout() {
  // const { useAdminProfile } = useAdminService()
  // const { isLoading } = useAdminProfile()

  return (
    <div className="no-print relative flex overflow-hidden h-screen">
      <Sidebar />
      <div className="bg-gray-50 flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden">
        {/* <Topbar /> */}
        <main className="flex-1 px-5 sm:px-10 py-5 min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
