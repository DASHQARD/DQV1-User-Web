import { CreateAccountMan } from '@/assets/images'
import LogoWhite from '@/assets/svgs/logo-white.svg?react'
import { ROUTES } from '@/utils/constants'
import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
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
