import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserProfile, useCountriesData } from '@/hooks'
import { useVendorMutations } from '../useVendorMutations'
import { UpdateBusinessDetailsSchema } from '@/utils/schemas/settings'
import type { UpdateBusinessDetailsFormData } from '@/utils/schemas/settings'
import { BUSINESS_TYPE_OPTIONS } from '@/utils/constants'

export type FormValues = z.input<typeof UpdateBusinessDetailsSchema>

const defaultValues: FormValues = {
  id: 0,
  name: '',
  type: '',
  phone: '',
  email: '',
  street_address: '',
  digital_address: '',
  registration_number: '',
}

const businessTypeOptionsForCombobox = BUSINESS_TYPE_OPTIONS.map((opt) => ({
  label: opt.title,
  value: opt.value,
}))

export function useBusinessDetailsSettingsForm() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessDetailsService } = useVendorMutations()
  const { mutateAsync: updateBusinessDetails, isPending } = useUpdateBusinessDetailsService()
  const { countries: phoneCountries } = useCountriesData()

  const isApproved =
    userProfileData?.status === 'approved' || userProfileData?.status === 'verified'

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdateBusinessDetailsSchema),
    defaultValues,
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

  const onSubmit = React.useCallback(
    async (data: FormValues) => {
      try {
        const payload: UpdateBusinessDetailsFormData = {
          ...data,
          digital_address: data.digital_address ?? '',
        }
        await updateBusinessDetails(payload)
      } catch (error) {
        console.error('Failed to update business details:', error)
      }
    },
    [updateBusinessDetails],
  )

  return {
    form,
    phoneCountries,
    businessTypeOptions: businessTypeOptionsForCombobox,
    onSubmit,
    isPending,
    isApproved,
  }
}
