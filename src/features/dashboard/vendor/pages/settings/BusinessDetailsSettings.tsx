import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, CreatableCombobox } from '@/components'
import { useVendorMutations } from '../../hooks/useVendorMutations'
import { userProfile } from '@/hooks'
import { BasePhoneInput } from '@/components'

const UpdateBusinessDetailsSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Business name is required'),
  type: z.string().min(1, 'Business type is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  street_address: z.string().min(1, 'Street address is required'),
  digital_address: z.string().optional().default(''),
  registration_number: z.string().min(1, 'Registration number is required'),
})

export function BusinessDetailsSettings() {
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessDetailsService } = useVendorMutations()
  const { mutateAsync: updateBusinessDetails, isPending } = useUpdateBusinessDetailsService()

  type FormData = z.input<typeof UpdateBusinessDetailsSchema>
  const form = useForm<FormData>({
    resolver: zodResolver(UpdateBusinessDetailsSchema),
    defaultValues: {
      id: 0,
      name: '',
      type: '',
      phone: '',
      email: '',
      street_address: '',
      digital_address: '',
      registration_number: '',
    },
  })

  React.useEffect(() => {
    if (userProfileData?.business_details?.[0]) {
      const business = userProfileData.business_details[0]
      form.reset({
        id: business.id,
        name: business.name || '',
        type: business.type || '',
        phone: business.phone || '',
        email: business.email || '',
        street_address: business.street_address || '',
        digital_address: business.digital_address || '',
        registration_number: business.registration_number || '',
      })
    }
  }, [userProfileData, form])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        digital_address: data.digital_address || '',
      } as z.output<typeof UpdateBusinessDetailsSchema>
      await updateBusinessDetails(payload)
    } catch (error) {
      console.error('Failed to update business details:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Business Name"
            placeholder="Enter business name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
        </div>

        <div>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState: { error } }) => (
              <CreatableCombobox
                label="Business Type"
                options={[
                  { label: 'LLC', value: 'llc' },
                  { label: 'Sole Proprietor', value: 'sole_proprietor' },
                  { label: 'Partnership', value: 'partnership' },
                  { label: 'Corporation', value: 'corporation' },
                ]}
                value={field.value}
                onChange={(e: any) => {
                  const value = e?.target?.value || e?.value || ''
                  field.onChange(value)
                }}
                error={error?.message}
                placeholder="Select business type"
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState: { error } }) => (
              <BasePhoneInput
                label="Phone Number"
                value={field.value || ''}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
        </div>

        <div>
          <Input
            label="Street Address"
            placeholder="Enter street address"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
          />
        </div>

        <div>
          <Input
            label="Digital Address"
            placeholder="Enter digital address (optional)"
            {...form.register('digital_address')}
            error={form.formState.errors.digital_address?.message}
          />
        </div>

        <div>
          <Input
            label="Registration Number"
            placeholder="Enter registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="secondary" loading={isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
