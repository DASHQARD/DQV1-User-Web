import { useEffect } from 'react'
import { BasePhoneInput, Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateAccountSchema } from '@/utils/schemas'
import { z } from 'zod'
import { AccountType } from '.'
import { useAuth } from '../hooks'
import { useCountriesData } from '@/hooks'

export default function SignUpForm() {
  const { useSignUpMutation, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useSignUpMutation()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const SPECIAL_CHARACTERS = '!@#$%^&*()'

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
    mutate(data)
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
    </section>
  )
}
