import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Combobox, Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { OnboardingSchema } from '@/utils/schemas'
import { useAuth } from '../../auth/hooks'
import { useUserProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import React from 'react'

export default function OnboardingForm() {
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfile()

  const { useOnboardingService } = useAuth()
  const { mutate, isPending } = useOnboardingService()

  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
  })

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        first_name: userProfile?.fullname?.split(' ')[0],
        last_name: userProfile?.fullname?.split(' ')[1],
        dob: userProfile?.dob,
        street_address: userProfile?.street_address,
        id_type: userProfile?.id_type,
        id_number: userProfile?.id_number,
      })
    }
  }, [userProfile, form])

  const onSubmit = (data: z.infer<typeof OnboardingSchema>) => {
    const payload = {
      full_name: `${data.first_name} ${data.last_name}`,
      street_address: data.street_address,
      dob: data.dob,
      id_type: data.id_type,
      id_number: data.id_number,
    }
    mutate(payload, {
      onSuccess: () => {
        navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.UPLOAD_ID)
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex sm:flex-row flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
          <Text variant="h2" weight="semibold">
            Name & address
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500">
            Update your personal details and contact information
          </Text>
        </div>

        <section className="grid grid-cols-2 gap-4 flex-1 max-w-[554px]">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
          />
          <Input
            type="date"
            label="Date of Birth"
            placeholder="Enter your date of birth"
            className="col-span-full"
            {...form.register('dob')}
            error={form.formState.errors.dob?.message}
          />

          <Input
            label="Street Address"
            placeholder="Enter your street address"
            className="col-span-full"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
          />

          <Controller
            name="id_type"
            control={form.control}
            render={({ field }) => (
              <Combobox
                label="ID Type"
                className="col-span-full"
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
            className="col-span-full"
            {...form.register('id_number')}
            error={form.formState.errors.id_number?.message}
          />
        </section>
      </section>
      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(-1)}>
          Discard
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
