import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useUserProfile, useCountriesData, useToast } from '@/hooks'
import { EditUserProfileSchema, type EditUserProfileFormData } from '@/utils/schemas/settings'
import { editUserProfile } from '@/features/dashboard/services/user'
import type { EditUserProfilePayload } from '@/types'

function profileToFormValues(
  profile: Record<string, unknown> | null | undefined,
): EditUserProfileFormData {
  return {
    full_name: String(profile?.fullname ?? ''),
    phone_number: String(profile?.phonenumber ?? ''),
    street_address: String(profile?.street_address ?? ''),
    dob: String(profile?.dob ?? ''),
    id_type: String(profile?.id_type ?? ''),
    id_number: String(profile?.id_number ?? ''),
  }
}

function buildEditUserProfilePayload(data: EditUserProfileFormData): EditUserProfilePayload {
  return {
    full_name: data.full_name.trim(),
    phone_number: data.phone_number.trim(),
    street_address: data.street_address.trim(),
    dob: data.dob.trim(),
    id_type: data.id_type.trim(),
    id_number: data.id_number.trim(),
  }
}

export type PersonalInformationFormData = EditUserProfileFormData

export function usePersonalInformationSettings() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { countries: phoneCountries } = useCountriesData()

  const form = useForm<EditUserProfileFormData>({
    resolver: zodResolver(EditUserProfileSchema),
    mode: 'onChange',
    defaultValues: profileToFormValues(userProfileData as Record<string, unknown> | undefined),
  })

  const resetToProfile = useCallback(() => {
    form.reset(profileToFormValues(userProfileData as Record<string, unknown> | undefined))
  }, [form, userProfileData])

  useEffect(() => {
    if (userProfileData) {
      resetToProfile()
    }
  }, [userProfileData, resetToProfile])

  const onSubmit = async (data: EditUserProfileFormData) => {
    try {
      const response = await editUserProfile(buildEditUserProfilePayload(data))
      toast.success(
        response.message ||
          'Profile update request submitted for admin approval. Your current details are unchanged until approved.',
      )
      resetToProfile()
      await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit profile update request. Please try again.'
      toast.error(message)
    }
  }

  const handleReset = () => {
    resetToProfile()
  }

  return {
    form,
    onSubmit,
    handleReset,
    isPending: form.formState.isSubmitting,
    phoneCountries,
    profileEmail: userProfileData?.email ?? '',
  }
}
