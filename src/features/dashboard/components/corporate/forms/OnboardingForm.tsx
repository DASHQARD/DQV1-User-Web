import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Combobox, Input, Text, FileUploader, Loader } from '@/components'
import { Button } from '@/components/Button'
import { ProfileAndIdentitySchema } from '@/utils/schemas'
import { useAuth } from '../../../../auth/hooks'
import { useUserProfile, useUploadFiles, usePresignedURL, useToast } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import React from 'react'
import { cn } from '@/libs'
import { useAuthStore } from '@/stores'

export default function OnboardingForm() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userType = (user as any)?.user_type
  const isBranchManager = userType === 'branch'
  const isVendor = userType === 'vendor'
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading } = useGetUserProfileService()
  const toast = useToast()

  const { usePersonalDetailsWithIDService } = useAuth()
  const { mutateAsync: submitPersonalDetailsWithID, isPending: isSubmittingPersonalDetailsWithID } =
    usePersonalDetailsWithIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()

  const [frontOfIdentification, setFrontOfIdentification] = React.useState<string | null>(null)
  const [backOfIdentification, setBackOfIdentification] = React.useState<string | null>(null)

  // Create schema with conditional validation for back_id
  const dynamicSchema = React.useMemo(() => {
    // Extend the schema to make back_id optional, then add conditional validation
    const baseSchema = ProfileAndIdentitySchema.omit({ back_id: true }).extend({
      back_id: z
        .instanceof(File, { message: 'Back ID photo is required' })
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .optional(),
    })

    return baseSchema.superRefine((data, ctx) => {
      // For passport and national_id, back_id is optional (only front_id required)
      if (data.id_type === 'passport' || data.id_type === 'national_id') {
        // Passport and National ID only need front_id
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
        // back_id is optional for passport and national_id, so no validation needed
      }
    })
  }, [])

  type FormData = z.infer<typeof dynamicSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(dynamicSchema),
    mode: 'onChange',
  })

  // Watch ID type to determine which uploaders to show
  const selectedIdType = form.watch('id_type')
  const isPassport = selectedIdType === 'passport'
  const isNationalId = selectedIdType === 'national_id'
  const needsOnlyFront = isPassport || isNationalId // Both passport and national_id only need front

  const isPending = isSubmittingPersonalDetailsWithID || isUploading

  // Reset back_id when ID type changes to passport or national_id
  React.useEffect(() => {
    if (needsOnlyFront) {
      const currentBackId = form.getValues('back_id')
      if (currentBackId) {
        form.setValue('back_id', undefined as any)
        form.clearErrors('back_id')
      }
    }
  }, [needsOnlyFront, form])

  React.useEffect(() => {
    if (!userProfileData?.id_images?.length) {
      if (userProfileData) {
        form.reset({
          first_name: userProfileData?.fullname?.split(' ')[0] || '',
          last_name: userProfileData?.fullname?.split(' ')[1] || '',
          dob: userProfileData?.dob || '',
          street_address: userProfileData?.street_address || '',
          id_type: userProfileData?.id_type || '',
          id_number: userProfileData?.id_number || '',
        } as any)
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

        setFrontOfIdentification(frontUrl)
        setBackOfIdentification(backUrl || null)

        // Reset form with existing data
        form.reset({
          first_name: userProfileData?.fullname?.split(' ')[0] || '',
          last_name: userProfileData?.fullname?.split(' ')[1] || '',
          dob: userProfileData?.dob || '',
          street_address: userProfileData?.street_address || '',
          id_type: userProfileData?.id_type || '',
          id_number: userProfileData?.id_number || '',
        } as any)
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

  const onSubmit = async (data: FormData) => {
    try {
      // First upload ID images - handle passport and national_id (one file) vs other IDs (two files)
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

      // Submit personal details with identification photos
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
          if (isBranchManager || isVendor) {
            navigate(-1)
          } else {
            const businessDetailsUrl = `${ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.BUSINESS_DETAILS}?account=corporate`
            navigate(businessDetailsUrl)
          }
        },
      })
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save. Please try again.')
    }
  }

  console.log('form.formState.errors', form.formState.errors)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 w-full">
          <Text variant="h2" weight="semibold">
            Key Person Details
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500">
            Update your personal details and contact information
          </Text>
        </div>

        <section className="grid grid-cols-2 gap-4 flex-1">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            className="col-span-full sm:col-span-1"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            className="col-span-full sm:col-span-1"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
          />
          <Input
            type="date"
            label="Date of Birth"
            placeholder="Enter your date of birth"
            className="col-span-full"
            max={(() => {
              const today = new Date()
              const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
              return maxDate.toISOString().split('T')[0]
            })()}
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
                className="col-span-full sm:col-span-1"
                placeholder="Enter your ID type"
                {...field}
                error={form.formState.errors.id_type?.message}
                options={[
                  { label: 'National ID', value: 'national_id' },
                  { label: 'Passport', value: 'passport' },
                ]}
              />
            )}
          />

          <Input
            label="ID Number"
            placeholder="Enter your ID number"
            className="col-span-full sm:col-span-1"
            {...form.register('id_number')}
            error={form.formState.errors.id_number?.message}
          />
        </section>
        <section className="flex flex-col gap-10 pb-16">
          <div className="flex flex-col gap-2 w-full">
            <Text variant="h2" weight="semibold">
              Identity Documents
            </Text>
            <Text variant="span" weight="normal" className="text-gray-500">
              {isPassport
                ? 'Upload a picture of your passport page'
                : isNationalId
                  ? 'Upload a picture of the front of your National ID'
                  : 'Upload pictures of your identification (front and back)'}
            </Text>
          </div>

          {isLoading || isFetchingPresignedURL ? (
            <div className="flex justify-center items-center h-full bg-white">
              <Loader />
            </div>
          ) : userProfileData?.id_images?.length && userProfileData?.id_images?.length > 0 ? (
            <section
              className={cn(
                'grid gap-4 flex-1 max-w-[554px]',
                needsOnlyFront ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isPassport
                    ? 'Passport Page'
                    : isNationalId
                      ? 'Front of National ID'
                      : 'Front of Identification'}
                </p>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                  )}
                >
                  {frontOfIdentification ? (
                    <img
                      src={frontOfIdentification}
                      alt={isPassport ? 'Passport Page' : 'Front of Identification'}
                      className="max-h-48 w-full object-contain"
                    />
                  ) : null}
                </div>
              </div>
              {!needsOnlyFront && backOfIdentification && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 mb-2">Back of Identification</p>
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                    )}
                  >
                    {backOfIdentification ? (
                      <img
                        src={backOfIdentification}
                        alt="Back of Identification"
                        className="max-h-48 w-full object-contain"
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section
              className={cn(
                'grid gap-4 flex-1',
                needsOnlyFront ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              <Controller
                control={form.control}
                name="front_id"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <FileUploader
                    label={
                      isPassport
                        ? 'Upload Passport Page'
                        : isNationalId
                          ? 'Upload Picture of Front of National ID'
                          : 'Upload Picture of Front of Identification'
                    }
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    id="front_id"
                  />
                )}
              />

              {!needsOnlyFront && (
                <Controller
                  control={form.control}
                  name="back_id"
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FileUploader
                      label="Upload Picture of Back of Identification"
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="back_id"
                    />
                  )}
                />
              )}
            </section>
          )}
        </section>
      </section>

      <div className="flex justify-end gap-4">
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
          {isBranchManager ? 'Submit' : 'Submit & Continue'}
        </Button>
      </div>
    </form>
  )
}
