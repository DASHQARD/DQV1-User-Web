import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/features/auth/hooks/auth'
import { useUserProfile } from '@/hooks'
import type { OnboardingData } from '@/types/auth/auth'
import { PersonalInformationSchema } from '@/utils/schemas/settings'

export type PersonalInformationFormData = z.infer<typeof PersonalInformationSchema>

export function usePersonalInformationSettings() {
  const { usePersonalDetailsService } = useAuth()
  const { mutate: updatePersonalDetails, isPending } = usePersonalDetailsService()
  const { useGetUserProfileService } = useUserProfile()
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

  useEffect(() => {
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

  const handleReset = () => {
    form.reset()
  }

  return {
    form,
    onSubmit,
    handleReset,
    isPending,
  }
}
