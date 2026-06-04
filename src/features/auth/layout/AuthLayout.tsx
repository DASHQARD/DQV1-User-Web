import { CreateAccountMan, Logo } from '@/assets/images'
import LogoWhite from '@/assets/svgs/logo-white.svg?react'
import { ROUTES } from '@/utils/constants'
import { Link, Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const { pathname } = useLocation()
  const isRegisterPage = pathname.includes('/register')

  if (isRegisterPage) {
    return (
      <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
        <Link
          to={ROUTES.IN_APP.HOME}
          className="absolute left-6 top-6 z-20 hidden lg:block lg:left-8"
          aria-label="DashQard home"
        >
          <img src={Logo} alt="DashQard" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex min-h-0 w-full min-w-0 flex-1 items-stretch">
          <Outlet />
        </div>
      </div>
    )
  }

  return (
    <div className="flex relative min-h-screen overflow-x-hidden">
      <div className="bg-primary-500 rounded-tr-[220px] min-w-[623.34px] relative hidden lg:block shrink-0">
        <Link
          to={ROUTES.IN_APP.HOME}
          className="absolute top-[80px] left-1/2 -translate-x-1/2 z-10"
        >
          <LogoWhite />
        </Link>
        <img
          src={CreateAccountMan}
          alt="Create Account Man"
          className="absolute bottom-0 -right-15 z-10"
        />
      </div>
      <div className="flex-1 flex items-center justify-center w-full min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <Outlet />
      </div>
    </div>
  )
}
