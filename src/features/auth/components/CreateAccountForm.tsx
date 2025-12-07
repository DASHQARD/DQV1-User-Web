import { BasePhoneInput, Combobox, Input, Text } from '@/components'
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
import React from 'react'

export default function CreateAccountForm() {
  const { useCreateAccountMutation, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useCreateAccountMutation()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  console.log('countries', countries)
  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    mode: 'onChange',
    defaultValues: {
      user_type: 'user',
      phone_number: '+233-',
    },
  })

  const selectedCountryId = form.watch('country')

  // Update country_code when country changes
  React.useEffect(() => {
    if (selectedCountryId && countries) {
      const selectedCountry = countries.find((c) => c.id === selectedCountryId)
      if (selectedCountry) {
        const countryCode = selectedCountry.code || selectedCountry.iso_code || ''
        form.setValue('country_code', countryCode, { shouldValidate: true })
      }
    } else if (!selectedCountryId) {
      form.setValue('country_code', '', { shouldValidate: true })
    }
  }, [selectedCountryId, countries, form])

  const onSubmit = (data: z.infer<typeof CreateAccountSchema>) => {
    const payload: any = {
      user_type: data.user_type,
      email: data.email,
      phone_number: data.phone_number.replace('-', ''),
      password: data.password,
      country: String(data.country),
      country_code: data.country_code,
    }

    mutate(payload)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
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
        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState: { error } }) => (
            <Combobox
              label="Country"
              options={
                countries?.map((country) => ({
                  label: country.name,
                  value: String(country.id),
                })) || []
              }
              value={field.value ? String(field.value) : undefined}
              onChange={(e: { target: { value: string } }) => {
                const value = e.target.value ? Number(e.target.value) : undefined
                field.onChange(value)

                // Set country_code synchronously when country changes
                if (value && countries) {
                  const selectedCountry = countries.find((c) => c.id === value)
                  if (selectedCountry) {
                    const countryCode = selectedCountry.code || selectedCountry.iso_code || ''
                    form.setValue('country_code', countryCode, { shouldValidate: true })
                  }
                } else {
                  form.setValue('country_code', '', { shouldValidate: true })
                }
              }}
              error={error?.message}
              placeholder="Select country"
              isSearchable={true}
            />
          )}
        />
        <Controller
          control={form.control}
          name="country_code"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />

        <Controller
          control={form.control}
          name="phone_number"
          render={({ field: { value, onChange } }) => {
            return (
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={phoneCountries}
                selectedVal={value || '+233-'}
                maxLength={10}
                handleChange={onChange}
                label="Phone Number"
                error={form.formState.errors.phone_number?.message}
              />
            )
          }}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          {...form.register('password')}
          type="password"
          error={form.formState.errors.password?.message}
        />
        <Input
          label="Confirm Password"
          placeholder="Enter your confirm password"
          {...form.register('confirmPassword')}
          type="password"
          error={form.formState.errors.confirmPassword?.message}
        />

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
  )
}
