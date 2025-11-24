import { Outlet } from 'react-router'
import { Sidebar } from '../components'

// import { AfriTransferLoader } from '@/assets/images'

// import { useAdminService } from '../hooks'

export default function DashboardLayout() {
  // const { useAdminProfile } = useAdminService()
  // const { isLoading } = useAdminProfile()

  return (
    <div className="no-print relative flex">
      <Sidebar />
      <div className="bg-gray-50 flex h-screen w-full flex-col overflow-y-auto">
        {/* <Topbar /> */}
        <main className="flex-1 px-5 sm:px-10 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
