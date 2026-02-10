import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks'
import {
  useUserProfile,
  useUploadFiles,
  usePresignedURL,
  useToast,
  usePersistedModalState,
} from '@/hooks'
import { useAuthStore } from '@/stores'
import { ProfileAndIdentitySchema } from '@/utils/schemas'
import { MODALS } from '@/utils/constants'

function getAgeFromDateOfBirth(dobString: string): number | null {
  if (!dobString || typeof dobString !== 'string') return null
  const trimmed = dobString.trim()
  let birth: Date
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    birth = new Date(trimmed + 'T12:00:00')
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [a, b, year] = trimmed.split('/').map(Number)
    const month = Math.min(a, b) - 1
    const day = Math.max(a, b)
    birth = new Date(year, month, day)
  } else {
    birth = new Date(trimmed)
  }
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const dynamicSchema = (() => {
  const baseSchema = ProfileAndIdentitySchema.omit({ back_id: true }).extend({
    back_id: z
      .instanceof(File, { message: 'Back ID photo is required' })
      .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
      .optional(),
  })

  return baseSchema
    .superRefine((data, ctx) => {
      if (data.id_type === 'passport' || data.id_type === 'national_id') {
        if (!data.front_id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              data.id_type === 'passport'
                ? 'Passport page is required'
                : 'Front ID photo is required',
            path: ['front_id'],
          })
        }
      }
    })
    .superRefine((data, ctx) => {
      if (data.dob) {
        const age = getAgeFromDateOfBirth(data.dob)
        if (age !== null && age < 18) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'You must be at least 18 years old',
            path: ['dob'],
          })
        }
      }
    })
})()

export type OnboardingFormData = z.infer<typeof dynamicSchema>

export function useOnboardingForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userType = (user as { user_type?: string })?.user_type
  const isBranchManager = userType === 'branch'
  const isCorporateAdmin = userType === 'corporate admin'
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading } = useGetUserProfileService()
  const toast = useToast()

  const { usePersonalDetailsWithIDService } = useAuth()
  const { mutateAsync: submitPersonalDetailsWithID, isPending: isSubmittingPersonalDetailsWithID } =
    usePersonalDetailsWithIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()

  const [frontOfIdentification, setFrontOfIdentification] = useState<string | null>(null)
  const [backOfIdentification, setBackOfIdentification] = useState<string | null>(null)
  const successModal = usePersistedModalState({
    paramName: MODALS.ONBOARDING.PARAM_NAME,
  })

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(dynamicSchema),
    mode: 'onChange',
  })

  const selectedIdType = form.watch('id_type')
  const isPassport = selectedIdType === 'passport'
  const isNationalId = selectedIdType === 'national_id'
  const needsOnlyFront = isPassport || isNationalId

  const isPending = isSubmittingPersonalDetailsWithID || isUploading

  useEffect(() => {
    if (needsOnlyFront) {
      const currentBackId = form.getValues('back_id')
      if (currentBackId) {
        form.setValue('back_id', undefined)
        form.clearErrors('back_id')
      }
    }
  }, [needsOnlyFront, form])

  useEffect(() => {
    if (!userProfileData?.id_images?.length) {
      if (userProfileData) {
        form.reset({
          first_name: userProfileData?.fullname?.split(' ')[0] || '',
          last_name: userProfileData?.fullname?.split(' ')[1] || '',
          dob: userProfileData?.dob || '',
          street_address: userProfileData?.street_address || '',
          id_type: userProfileData?.id_type || '',
          id_number: userProfileData?.id_number || '',
        } as OnboardingFormData)
      }
      return
    }

    let cancelled = false

    const loadImages = async () => {
      try {
        const [frontUrl, backUrl] = await Promise.all([
          userProfileData.id_images[0]
            ? fetchPresignedURL(userProfileData.id_images[0].file_url)
            : null,
          userProfileData.id_images[1]
            ? fetchPresignedURL(userProfileData.id_images[1].file_url)
            : null,
        ])

        if (cancelled) return

        setFrontOfIdentification(frontUrl ?? null)
        setBackOfIdentification(backUrl ?? null)

        form.reset({
          first_name: userProfileData?.fullname?.split(' ')[0] || '',
          last_name: userProfileData?.fullname?.split(' ')[1] || '',
          dob: userProfileData?.dob || '',
          street_address: userProfileData?.street_address || '',
          id_type: userProfileData?.id_type || '',
          id_number: userProfileData?.id_number || '',
        } as OnboardingFormData)
      } catch (error) {
        console.error('Failed to fetch identification images', error)
        if (!cancelled) {
          toast.error('Unable to fetch existing identification images.')
        }
      }
    }

    loadImages()

    return () => {
      cancelled = true
    }
  }, [fetchPresignedURL, toast, userProfileData, form])

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const filesToUpload: File[] = [data.front_id]
      if (data.back_id && !needsOnlyFront) {
        filesToUpload.push(data.back_id)
      }

      const uploadPromises = filesToUpload.map((file) => uploadFiles([file]))
      const responses = await Promise.all(uploadPromises)

      const identificationPhotos = responses.map(
        (response: { file_name: string; file_key: string }[], index: number) => ({
          file_url: response[0].file_key,
          file_name: filesToUpload[index].name,
        }),
      )

      const onboardingPayload = {
        full_name: `${data.first_name} ${data.last_name}`,
        street_address: data.street_address,
        dob: data.dob,
        id_type: data.id_type,
        id_number: data.id_number,
        identification_photos: identificationPhotos,
      }

      await submitPersonalDetailsWithID(onboardingPayload, {
        onSuccess: () => {
          successModal.openModal(MODALS.ONBOARDING.SUCCESS)
        },
      })
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed to save. Please try again.'
      toast.error(message)
    }
  }

  const handleDiscard = () => {
    navigate(-1)
  }

  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  const submitButtonLabel = isBranchManager || isCorporateAdmin ? 'Submit' : 'Submit & Continue'

  return {
    form,
    frontOfIdentification,
    backOfIdentification,
    isPassport,
    isNationalId,
    needsOnlyFront,
    isPending,
    isLoading,
    isFetchingPresignedURL,
    userProfileData,
    onSubmit,
    handleDiscard,
    dobMaxDate,
    submitButtonLabel,
  }
}
