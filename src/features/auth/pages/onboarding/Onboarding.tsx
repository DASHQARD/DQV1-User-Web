import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks'
import { Loader } from '@/components'
import { ROUTES } from '@/utils/constants'
import LogoWhite from '@/assets/svgs/logo-white.svg?react'
import CreateAccountMan from '@/assets/images/create-account-man.png'
import { OnboardingForm } from '../../components'

export default function Onboarding() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('vtoken')
  const { useVerifyEmailMutation } = useAuth()
  const { mutate, isPending } = useVerifyEmailMutation()

  React.useEffect(() => {
    if (token) {
      mutate(token)
    }
  }, [token, mutate])

  return (
    <>
      {isPending ? (
        <Loader />
      ) : (
        <div className="flex relative min-h-screen overflow-hidden">
          <div className="bg-primary-500 rounded-tr-[220px] min-w-[623.34px] relative hidden lg:block">
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

          <div className="flex-1 flex items-center justify-center">
            <OnboardingForm />
          </div>
        </div>
      )}
    </>
  )
}
