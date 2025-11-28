import { Link } from 'react-router-dom'
import CreateAccountMan from '@/assets/images/create-account-man.png'
import LogoWhite from '@/assets/svgs/logo-white.svg?react'
import { ROUTES } from '@/utils/constants'
import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdminOnboardingSchema } from '@/utils/schemas'
import { z } from 'zod'
import { useAdminOnboarding } from '../../hooks/useAdminOnboarding'

export default function AdminOnboarding() {
  const { mutate: onboard, isPending } = useAdminOnboarding()

  const form = useForm<z.infer<typeof AdminOnboardingSchema>>({
    resolver: zodResolver(AdminOnboardingSchema),
  })

  const onSubmit = (data: z.infer<typeof AdminOnboardingSchema>) => {
    onboard({
      verification_code: data.verification_code,
      phone_number: data.phone_number,
      password: data.password,
    })
  }

  return (
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-[470.61px] w-full flex flex-col gap-10"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <Icon icon="bi:person-gear" className="size-5 text-white" />
            </div>
            <div>
              <Text as="h2" className="text-2xl font-bold">
                Complete Your Onboarding
              </Text>
              <p className="text-sm text-gray-500">Set up your admin account to get started</p>
            </div>
          </div>

          <section className="flex flex-col gap-4">
            <Input
              label="Verification Code"
              placeholder="Enter verification code"
              {...form.register('verification_code')}
              error={form.formState.errors.verification_code?.message}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              {...form.register('phone_number')}
              error={form.formState.errors.phone_number?.message}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />

            <Button
              disabled={!form.formState.isValid || isPending}
              loading={isPending}
              type="submit"
              variant="secondary"
              className="w-full"
            >
              Complete Onboarding
            </Button>

            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our{' '}
              <a href={ROUTES.IN_APP.TERMS_OF_SERVICE} className="text-primary-500 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href={ROUTES.IN_APP.PRIVACY_POLICY} className="text-primary-500 underline">
                Privacy Policy
              </a>
            </p>

            <hr className="border-gray-200" />

            <div className="flex items-center gap-2">
              <p>
                Already have an account?{' '}
                <Link
                  to={ROUTES.IN_APP.ADMIN.AUTH.LOGIN}
                  className="text-primary-500 underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}

