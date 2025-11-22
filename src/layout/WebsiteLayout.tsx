import { Footer, Navbar } from '../components'
import { Outlet } from 'react-router-dom'

export default function WebsiteLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
