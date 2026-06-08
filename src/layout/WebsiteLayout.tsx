import { Footer, Navbar } from '../components'
import { useScrollTop } from '@/hooks'
import { Outlet } from 'react-router-dom'

export default function WebsiteLayout() {
  useScrollTop()

  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
