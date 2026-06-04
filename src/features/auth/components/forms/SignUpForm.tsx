import { useRef, useState } from 'react'
import { BasePhoneInput, Input, PhoneFormatHint, Text } from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { Logo } from '@/assets/images'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link, useNavigate } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { isDialCodeOnlyPhone } from '@/utils/schemas/shared'
import AccountType from '../AccountType'
import EmailSentModal from '../modals/EmailSentModal'
import PasswordRequirementsChecklist from '../PasswordRequirementsChecklist'
import { useSignUpForm } from '../../hooks'
import { getVisibleFieldError } from '../../utils/showFieldError'
import { cn } from '@/libs'

export default function SignUpForm() {
  const { form, onSubmit, isPending, phoneCountries } = useSignUpForm()
  const { isValid, touchedFields } = form.formState
  const phoneDialCodeSynced = useRef(false)
  const navigate = useNavigate()
  const [isWiggling, setIsWiggling] = useState(false)
  const password = form.watch('password') || ''
  const phoneError = getVisibleFieldError(form, 'phone_number')
  const showPhoneHint = Boolean(phoneError) || Boolean(touchedFields.phone_number)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(ROUTES.IN_APP.HOME)
  }

  const triggerWiggle = () => {
    if (isValid && !isPending) return
    setIsWiggling(true)
    window.setTimeout(() => setIsWiggling(false), 600)
  }

  return (
    <>
      <div
        className={cn(
          'flex w-full min-w-0 flex-1 flex-col bg-white px-5 py-5 sm:px-6 sm:py-6 lg:flex-none',
          'lg:mx-auto lg:max-w-[450px] lg:rounded-[20px] lg:border lg:border-primary-500/10 lg:p-8 lg:shadow-[0_15px_40px_rgba(0,0,0,0.1)]',
          isWiggling && 'animate-[signup-wiggle_0.6s_ease-in-out]',
        )}
      >
        <header className="mb-5 lg:hidden">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700"
          >
            <Icon icon="bi:arrow-left" className="size-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.IN_APP.HOME}
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-1.5"
              aria-label="DashQard home"
            >
              <img src={Logo} alt="" className="h-full w-full object-contain" />
            </Link>
            <div className="min-w-0">
              <Text as="h2" className="text-xl font-bold text-[#2d1a72] sm:text-2xl">
                Create Account
              </Text>
              <p className="text-sm text-gray-500">Start managing your digital cards</p>
            </div>
          </div>
        </header>

        <div className="mb-6 hidden text-center lg:block">
          <h4 className="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-[#2d1a72]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-[#2d1a72] p-2">
              <Icon icon="bi:shop-window" className="size-5 text-white" />
            </span>
            Create Account
          </h4>
          <p className="text-base text-[#666]">Join us and start managing your digital cards</p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <AccountType
            compact
            value={form.watch('user_type')}
            onChange={(value) =>
              form.setValue('user_type', value, { shouldValidate: true, shouldDirty: true })
            }
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            isRequired
            type="text"
            inputMode="email"
            {...form.register('email')}
            error={getVisibleFieldError(form, 'email')}
          />

          <Controller
            control={form.control}
            name="phone_number"
            render={({ field: { onChange, value, ref, onBlur } }) => (
              <BasePhoneInput
                ref={ref}
                placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                options={phoneCountries}
                isRequired
                selectedVal={value ?? ''}
                handleChange={(phone) => {
                  const normalized = phone?.trim() ?? ''
                  if (!phoneDialCodeSynced.current && isDialCodeOnlyPhone(normalized)) {
                    phoneDialCodeSynced.current = true
                    return
                  }
                  phoneDialCodeSynced.current = true
                  onChange(phone)
                }}
                label="Phone Number"
                error={phoneError}
                hint={showPhoneHint ? <PhoneFormatHint /> : undefined}
                onBlur={onBlur}
              />
            )}
          />

          <div className="flex flex-col gap-2">
            <Input
              isRequired
              label="Password"
              placeholder="Enter your password"
              {...form.register('password')}
              type="password"
              error={getVisibleFieldError(form, 'password')}
            />
            {password.length > 0 ? (
              <PasswordRequirementsChecklist password={password} compact />
            ) : null}
          </div>

          <Button
            disabled={!isValid || isPending}
            loading={isPending}
            type="submit"
            variant="secondary"
            className="h-12! w-full rounded-xl! text-base! font-semibold! disabled:bg-primary-500! disabled:opacity-45!"
            onClick={triggerWiggle}
          >
            {isPending ? 'Signing up...' : 'Sign Up'}
          </Button>

          <footer className="space-y-3 border-t border-gray-100 pt-4 pb-2 lg:border-0 lg:pt-0 lg:pb-0">
            <p className="text-center text-sm text-gray-600 lg:hidden">
              Already have an account?{' '}
              <Link
                to={ROUTES.IN_APP.AUTH.LOGIN}
                className="font-semibold text-primary-500 hover:underline"
              >
                Sign In
              </Link>
            </p>

            <p className="text-center text-xs leading-relaxed text-gray-500">
              By continuing, you agree to our{' '}
              <Link
                to={ROUTES.IN_APP.TERMS_OF_SERVICE}
                className="font-medium text-primary-500 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to={ROUTES.IN_APP.PRIVACY_POLICY}
                className="font-medium text-primary-500 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="relative my-1 hidden text-center lg:block lg:my-2">
              <span className="relative z-1 bg-white px-4 text-sm text-[#6b7280]">or</span>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200" aria-hidden />
            </div>

            <p className="hidden text-center text-[15px] text-[#6b7280] lg:block">
              Already have an account?{' '}
              <Link
                to={ROUTES.IN_APP.AUTH.LOGIN}
                className="font-semibold text-primary-500 no-underline hover:text-[#2d1a72] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </form>
      </div>

      <EmailSentModal />
    </>
  )
}
