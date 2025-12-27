import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Combobox, Input, Text, FileUploader, Loader } from '@/components'
import { Button } from '@/components/Button'
import { ProfileAndIdentitySchema } from '@/utils/schemas'
import { useAuth } from '../../../../auth/hooks'
import { userProfile, useUploadFiles, usePresignedURL, useToast } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import React from 'react'
import { cn } from '@/libs'

export default function OnboardingForm() {
  const navigate = useNavigate()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData, isLoading } = useGetUserProfileService()
  const toast = useToast()

  const { usePersonalDetailsWithIDService } = useAuth()
  const { mutateAsync: submitPersonalDetailsWithID, isPending: isSubmittingPersonalDetailsWithID } =
    usePersonalDetailsWithIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()

  const [frontOfIdentification, setFrontOfIdentification] = React.useState<string | null>(null)
  const [backOfIdentification, setBackOfIdentification] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof ProfileAndIdentitySchema>>({
    resolver: zodResolver(ProfileAndIdentitySchema),
  })

  const isPending = isSubmittingPersonalDetailsWithID || isUploading

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
        setBackOfIdentification(backUrl)

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

  const onSubmit = async (data: z.infer<typeof ProfileAndIdentitySchema>) => {
    try {
      // First upload ID images
      const files = [data.front_id, data.back_id]
      const uploadPromises = files.map((file) => uploadFiles([file]))
      const responses = await Promise.all(uploadPromises)

      const identificationPhotos = responses.map(
        (response: { file_name: string; file_key: string }[], index: number) => ({
          file_url: response[0].file_key,
          file_name: files[index].name,
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
          const businessDetailsUrl = `${ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.BUSINESS_DETAILS}?account=corporate`
          navigate(businessDetailsUrl)
        },
      })
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save. Please try again.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex sm:flex-row flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
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

      {/* ID Upload Section */}
      <section className="flex sm:flex-row flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
          <Text variant="h2" weight="semibold">
            Identity Documents
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500">
            Upload pictures of your identification (front and back)
          </Text>
        </div>

        {isLoading || isFetchingPresignedURL ? (
          <div className="flex justify-center items-center h-full bg-white">
            <Loader />
          </div>
        ) : userProfileData?.id_images?.length && userProfileData?.id_images?.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-[554px]">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 mb-2">Front of Identification</p>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                )}
              >
                <img
                  src={frontOfIdentification ?? ''}
                  alt="Front of Identification"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 mb-2">Back of Identification</p>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center min-w-0',
                )}
              >
                <img
                  src={backOfIdentification ?? ''}
                  alt="Back of Identification"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <Controller
              control={form.control}
              name="front_id"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <FileUploader
                  label="Upload Picture of Front of Identification"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  id="front_id"
                />
              )}
            />

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
          </section>
        )}
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
          Submit & Continue
        </Button>
      </div>
    </form>
  )
}
