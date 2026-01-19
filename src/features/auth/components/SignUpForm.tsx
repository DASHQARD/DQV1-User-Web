import { useEffect, useState } from 'react'
import { BasePhoneInput, Input, Text, Modal } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateAccountSchema } from '@/utils/schemas'
import { z } from 'zod'
import { AccountType } from '.'
import { useAuth } from '../hooks'
import { useCountriesData } from '@/hooks'

export default function SignUpForm() {
  const navigate = useNavigate()
  const { useSignUpMutation, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useSignUpMutation()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const SPECIAL_CHARACTERS = '!@#$%^&*()'
  const [isEmailSentModalOpen, setIsEmailSentModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    // mode: 'onTouched',
    defaultValues: {
      country: 'Ghana',
      country_code: '01',
      user_type: 'user',
    },
  })

  useEffect(() => {
    if (countries && !form.getValues('country')) {
      const ghana = countries.find(
        (country: any) =>
          country.id === 1 || country.name === 'Ghana' || country.name?.toLowerCase() === 'ghana',
      )
      if (ghana) {
        form.setValue('country', String(ghana.id))
      }
    }
  }, [countries, form])

  const password = form.watch('password') || ''
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()]/.test(password)

  const onSubmit = (data: z.infer<typeof CreateAccountSchema>) => {
    setUserEmail(data.email)
    mutate(data, {
      onSuccess: () => {
        setIsEmailSentModalOpen(true)
      },
    })
  }

  return (
    <section className="wrapper">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[470.61px] w-full flex flex-col gap-6 mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
            <Icon icon="bi:shop-window" className="size-5 text-white" />
          </div>
          <div>
            <Text as="h2" className="text-2xl font-bold">
              Create account
            </Text>
            <p className="text-sm text-gray-500">Join us and start managing your digital cards </p>
          </div>
        </div>
        <AccountType
          value={form.watch('user_type')}
          onChange={(value) => form.setValue('user_type', value)}
        />
        <section className="flex flex-col gap-4">
          {/* <Controller
            control={form.control}
            name="country"
            render={({ field, fieldState: { error } }) => {
              return (
                <Combobox
                  label="Country"
                  options={countries?.map((country: any) => ({
                    label: country.name,
                    value: country.name,
                  }))}
                  value={field.value || undefined}
                  error={error?.message}
                  placeholder="Select country"
                  isDisabled={true}
                />
              )
            }}
          /> */}

          <Input
            label="Email"
            placeholder="Enter your email"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="phone_number"
              render={({ field: { onChange } }) => {
                return (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={phoneCountries}
                    maxLength={9}
                    handleChange={onChange}
                    label="Phone Number"
                    error={form.formState.errors.phone_number?.message}
                  />
                )
              }}
            />
            <p className="text-xs text-gray-500">
              Please enter your number in the format:{' '}
              <span className="font-medium">5512345678</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Input
              label="Password"
              placeholder="Enter your password"
              {...form.register('password')}
              type="password"
              error={form.formState.errors.password?.message}
            />
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-500">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasMinLength ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {hasMinLength ? '✓' : '✗'}
                </div>
                <p className="text-xs leading-[18px]">Minimum 8 characters</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasNumber ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {hasNumber ? '✓' : '✗'}
                </div>
                <p className="text-xs leading-[18px]">One number</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasUppercase ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {hasUppercase ? '✓' : '✗'}
                </div>
                <p className="text-xs leading-[18px]">One Uppercase character</p>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasSpecialChar ? 'bg-primary-400 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {hasSpecialChar ? '✓' : '✗'}
                </div>
                <p className="text-xs leading-[18px]">
                  One special character {`(${SPECIAL_CHARACTERS})`}
                </p>
              </div>
            </section>
          </div>

          <Button
            disabled={!form.formState.isValid || isPending}
            loading={isPending}
            type="submit"
            variant="secondary"
            className="w-full"
          >
            Create account
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
              <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 underline">
                Login
              </Link>
            </p>
          </div>
        </section>
      </form>

      {/* Email Sent Modal */}
      <Modal
        isOpen={isEmailSentModalOpen}
        setIsOpen={setIsEmailSentModalOpen}
        title="Email Sent"
        panelClass="max-w-md"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Icon icon="bi:check-circle" className="size-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-sm text-gray-600 mb-1">We've sent a verification email to:</p>
              <p className="text-sm font-medium text-gray-900 mb-4">{userEmail}</p>
              <p className="text-sm text-gray-600">
                Please check your inbox and click the verification link to activate your account. If
                you don't see the email, please check your spam folder.
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEmailSentModalOpen(false)
                navigate(ROUTES.IN_APP.AUTH.LOGIN)
              }}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
