import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Checkbox, Loader, Combobox } from '@/components'
import { useAuth } from '@/features/auth/hooks'
import { AddBranchSchema } from '@/utils/schemas'
import { ROUTES } from '@/utils/constants'
import { useUserProfile } from '@/hooks'
import React from 'react'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import type { BranchData } from '@/types/auth'

export default function AddBranchForm() {
  const navigate = useNavigate()
  const { data: userProfile, isLoading } = useUserProfile()
  const { useAddBranchService, useGetCountriesService } = useAuth()
  const { mutate, isPending } = useAddBranchService()
  const { data: countries } = useGetCountriesService()

  const existingBranches = userProfile?.branches || []

  const form = useForm<z.infer<typeof AddBranchSchema>>({
    resolver: zodResolver(AddBranchSchema),
    mode: 'onChange',
    defaultValues: {
      country: undefined,
      country_code: '',
      main_branch: false,
      is_single_branch: false,
      branch_name: '',
      branch_location: '',
      branches: [{ branch_manager_name: '', branch_manager_email: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'branches',
  })

  const isSingleBranch = form.watch('is_single_branch')
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

  React.useEffect(() => {
    if (isSingleBranch && fields.length > 1) {
      // Remove all but the first branch manager when single branch is checked
      while (fields.length > 1) {
        remove(fields.length - 1)
      }
    }
  }, [isSingleBranch, fields.length, remove])

  const onSubmit = (data: z.infer<typeof AddBranchSchema>) => {
    // Convert country from number to string as API expects string
    const basePayload = {
      country: String(data.country),
      country_code: data.country_code,
      is_single_branch: data.is_single_branch,
      branch_name: data.branch_name,
      branch_location: data.branch_location,
    }

    // If single branch, don't send branches array
    // If not single branch, send branches and add main_branch
    const payload = data.is_single_branch
      ? basePayload
      : {
          ...basePayload,
          main_branch: data.main_branch,
          branches: data.branches,
        }

    mutate(payload as BranchData, {
      onSuccess: () => {
        navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-white">
        <Loader />
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Add Branch</h1>
        <p className="text-sm text-gray-500">
          This is the details of all the branches you have added to your business.
        </p>
      </div>

      {existingBranches.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Branches</h2>
          <div className="space-y-4">
            {existingBranches.map((branch) => (
              <div
                key={branch.id}
                className={cn(
                  'p-4 border border-gray-200 rounded-lg flex flex-col gap-3',
                  'hover:border-primary-300 transition-colors',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {branch.branch_name}
                      </h3>
                      {branch.is_single_branch && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Single Branch
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <Icon icon="bi:geo-alt" className="inline mr-1" />
                      {branch.branch_location}
                    </p>
                    <div className="space-y-1">
                      {branch.branch_manager_name && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Manager:</span> {branch.branch_manager_name}
                        </p>
                      )}
                      {branch.branch_manager_email && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Email:</span> {branch.branch_manager_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Added {new Date(branch.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {existingBranches.length > 0 ? 'Add New Branch' : 'Add Branch'}
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-10">
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
                      value: String(country.id),
                    })) || []
                  }
                  value={field.value ? String(field.value) : undefined}
                  onChange={(e: { target: { value: string } }) => {
                    const value = e.target.value ? Number(e.target.value) : undefined
                    field.onChange(value)
                  }}
                  error={error?.message}
                  placeholder="Select country"
                  isSearchable={true}
                />
              )}
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

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Branch Managers</h3>
                {!isSingleBranch && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ branch_manager_name: '', branch_manager_email: '' })}
                    className="w-fit"
                  >
                    <Icon icon="bi:plus" className="mr-2" />
                    Add Manager
                  </Button>
                )}
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Manager {index + 1}</h4>
                    {fields.length > 1 && !isSingleBranch && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => remove(index)}
                        className="w-fit text-red-600 hover:text-red-700"
                      >
                        <Icon icon="bi:trash" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      control={form.control}
                      name={`branches.${index}.branch_manager_name`}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Manager Name"
                          placeholder="Enter manager name"
                          {...field}
                          error={error?.message}
                        />
                      )}
                    />

                    <Controller
                      control={form.control}
                      name={`branches.${index}.branch_manager_email`}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          label="Manager Email"
                          placeholder="Enter manager email"
                          type="email"
                          {...field}
                          error={error?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              ))}

              {form.formState.errors.branches && (
                <p className="text-sm text-red-500">{form.formState.errors.branches.message}</p>
              )}
            </div>
          </section>

          <div className="flex gap-4 border-t border-[#CDD3D3] pt-4">
            <Button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)}
              type="button"
              variant="outline"
              className="w-fit"
            >
              Back
            </Button>
            <Button
              disabled={!form.formState.isValid || isPending}
              loading={isPending}
              type="submit"
              variant="secondary"
              className="w-fit"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
