import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Text, Combobox } from '@/components'
import { Icon } from '@/libs'
import { useAuth } from '@/features/auth/hooks/auth'
import { userProfile } from '@/hooks'
import type { OnboardingData } from '@/types/auth/auth'

// Schema for personal information form
const PersonalInformationSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  street_address: z.string().min(1, 'Street address is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  id_type: z.string().min(1, 'ID type is required'),
  id_number: z.string().min(1, 'ID number is required'),
})

type PersonalInformationFormData = z.infer<typeof PersonalInformationSchema>

const ID_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_id', label: "Voter's ID" },
  { value: 'ghana_card', label: 'Ghana Card' },
]

export function PersonalInformationSettings() {
  const { usePersonalDetailsService } = useAuth()
  const { mutate: updatePersonalDetails, isPending } = usePersonalDetailsService()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const form = useForm<PersonalInformationFormData>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      full_name: userProfileData?.fullname || '',
      street_address: userProfileData?.street_address || '',
      dob: userProfileData?.dob || '',
      id_type: userProfileData?.id_type || '',
      id_number: userProfileData?.id_number || '',
    },
  })

  // Update form when userProfileData changes
  React.useEffect(() => {
    if (userProfileData) {
      form.reset({
        full_name: userProfileData?.fullname || '',
        street_address: userProfileData?.street_address || '',
        dob: userProfileData?.dob || '',
        id_type: userProfileData?.id_type || '',
        id_number: userProfileData?.id_number || '',
      })
    }
  }, [userProfileData, form])

  const onSubmit = (data: PersonalInformationFormData) => {
    const payload: OnboardingData = {
      full_name: data.full_name,
      street_address: data.street_address,
      dob: data.dob,
      id_type: data.id_type,
      id_number: data.id_number,
    }

    updatePersonalDetails(payload, {
      onSuccess: () => {
        form.reset(data)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Personal Information
        </Text>
        <Text variant="p" className="text-gray-600 text-sm">
          Update your personal details and identification information. This information is used for
          account verification and compliance purposes.
        </Text>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:person-fill" className="size-4 mr-2 text-gray-500" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              {...form.register('full_name')}
              error={form.formState.errors.full_name?.message}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:geo-alt-fill" className="size-4 mr-2 text-gray-500" />
              Street Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your street address"
              {...form.register('street_address')}
              error={form.formState.errors.street_address?.message}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:calendar-event" className="size-4 mr-2 text-gray-500" />
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              placeholder="Select your date of birth"
              {...form.register('dob')}
              error={form.formState.errors.dob?.message}
            />
            <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD (e.g., 1990-01-15)</p>
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:card-text" className="size-4 mr-2 text-gray-500" />
              ID Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="id_type"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  placeholder="Select ID type"
                  options={ID_TYPE_OPTIONS}
                  value={field.value}
                  onChange={(e: { target: { value: string } }) => {
                    field.onChange(e.target.value)
                  }}
                  error={error?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:hash" className="size-4 mr-2 text-gray-500" />
              ID Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your ID number"
              {...form.register('id_number')}
              error={form.formState.errors.id_number?.message}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
            variant="primary"
            className="min-w-[150px]"
          >
            <Icon icon="bi:check-circle" className="size-4 mr-2" />
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
