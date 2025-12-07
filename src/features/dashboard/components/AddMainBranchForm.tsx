import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button, Checkbox, Combobox } from '@/components'
import { useAuth } from '@/features/auth/hooks'
import { AddMainBranchSchema } from '@/utils/schemas'
import { useUserProfile } from '@/hooks'
import React from 'react'

export default function AddMainBranchForm({ onSuccess }: { onSuccess?: () => void }) {
  const { useAddMainBranchService, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useAddMainBranchService()
  const { data: countries } = useGetCountriesService()
  const { refetch } = useUserProfile()

  const form = useForm<z.infer<typeof AddMainBranchSchema>>({
    resolver: zodResolver(AddMainBranchSchema),
    mode: 'onChange',
    defaultValues: {
      country: '',
      country_code: '',
      is_single_branch: false,
      branch_name: '',
      branch_location: '',
      branch_manager_name: '',
      branch_manager_email: '',
    },
  })

  const countryName = form.watch('country')

  // Update country_code when country changes (using country name)
  React.useEffect(() => {
    if (countryName && countries) {
      const selectedCountry = countries.find((c) => c.name === countryName)
      if (selectedCountry) {
        const countryCode = selectedCountry.code || selectedCountry.iso_code || ''
        form.setValue('country_code', countryCode, { shouldValidate: true })
      }
    } else if (!countryName) {
      form.setValue('country_code', '', { shouldValidate: true })
    }
  }, [countryName, countries, form])

  const onSubmit = (data: z.infer<typeof AddMainBranchSchema>) => {
    mutate(data, {
      onSuccess: () => {
        refetch()
        onSuccess?.()
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="is_single_branch"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              id="is_single_branch"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              label="Single branch operation"
            />
          )}
        />

        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState: { error } }) => (
            <Combobox
              label="Country"
              options={
                countries?.map((country) => ({
                  label: country.name,
                  value: country.name,
                })) || []
              }
              value={field.value}
              onChange={(e: { target: { value: string } }) => {
                field.onChange(e.target.value || '')
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
          label="Branch Name"
          placeholder="Enter branch name"
          {...form.register('branch_name')}
          error={form.formState.errors.branch_name?.message}
        />

        <Input
          label="Branch Location"
          placeholder="Enter branch location/address"
          {...form.register('branch_location')}
          error={form.formState.errors.branch_location?.message}
        />

        <Input
          label="Branch Manager Name"
          placeholder="Enter branch manager name"
          {...form.register('branch_manager_name')}
          error={form.formState.errors.branch_manager_name?.message}
        />

        <Input
          label="Branch Manager Email"
          placeholder="Enter branch manager email"
          type="email"
          {...form.register('branch_manager_email')}
          error={form.formState.errors.branch_manager_email?.message}
        />
      </section>

      <div className="flex gap-4 border-t border-[#CDD3D3] pt-4">
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Add Main Branch
        </Button>
      </div>
    </form>
  )
}
