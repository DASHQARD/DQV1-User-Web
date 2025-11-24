import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { BasePhoneInput, Combobox, Input } from '@/components'
import { Button } from '@/components/Button'
import { OnboardingSchema } from '@/utils/schemas'
import { useAuth } from '../hooks'
import { useCountriesData } from '@/hooks'
import { ROUTES } from '@/utils/constants'

export default function OnboardingForm() {
  const navigate = useNavigate()
  const { useOnboardingService } = useAuth()
  const { mutate, isPending } = useOnboardingService()
  const { countries } = useCountriesData()
  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
  })
  const onSubmit = (data: z.infer<typeof OnboardingSchema>) => {
    const phoneNumber = data.phone_number.replace('-', '')

    const payload = {
      full_name: data.full_name,
      phone_number: phoneNumber,
      street_address: data.street_address,
      dob: data.dob,
      id_type: data.id_type,
      id_number: data.id_number,
    }
    mutate(payload, {
      onSuccess: () => {
        navigate(ROUTES.IN_APP.AUTH.UPLOAD_ID)
      },
    })
  }
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <p className="text-sm text-gray-500">Please complete contact personnel details </p>

      <section className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          {...form.register('full_name')}
          error={form.formState.errors.full_name?.message}
        />

        <Controller
          control={form.control}
          name="phone_number"
          render={({ field: { value, onChange } }) => {
            return (
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={countries}
                selectedVal={value}
                maxLength={10}
                handleChange={onChange}
                label="Phone number"
                error={form.formState.errors.phone_number?.message}
              />
            )
          }}
        />

        <Input
          label="Street Address"
          placeholder="Enter your password"
          {...form.register('street_address')}
          error={form.formState.errors.street_address?.message}
        />
        <Input
          type="date"
          label="Date of Birth"
          placeholder="Enter your date of birth"
          {...form.register('dob')}
          error={form.formState.errors.dob?.message}
        />

        <Controller
          name="id_type"
          control={form.control}
          render={({ field }) => (
            <Combobox
              label="ID Type"
              placeholder="Enter your ID type"
              {...field}
              error={form.formState.errors.id_type?.message}
              options={[
                { label: 'National ID', value: 'national_id' },
                { label: 'Passport', value: 'passport' },
                { label: "Driver's License", value: 'drivers_license' },
                { label: 'Other', value: 'other' },
              ]}
            />
          )}
        />

        <Input
          label="ID Number"
          placeholder="Enter your ID number"
          {...form.register('id_number')}
          error={form.formState.errors.id_number?.message}
        />
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-full"
        >
          Next
        </Button>
      </section>
    </form>
  )
}
