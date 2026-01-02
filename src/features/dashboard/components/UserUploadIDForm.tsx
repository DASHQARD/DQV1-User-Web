import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { FileUploader, Loader } from '@/components'
import { Button } from '@/components/Button'
import { useAuth } from '../../auth/hooks'
import { UploadUserIDSchema } from '@/utils/schemas'
import { useUploadFiles, userProfile, usePresignedURL } from '@/hooks'
import { useToast } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import React from 'react'
import { cn } from '@/libs'

export default function UserUploadIDForm() {
  const navigate = useNavigate()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { isLoading } = useGetUserProfileService()
  const { useUploadUserIDService } = useAuth()
  const { mutateAsync: submitUserID, isPending: isSubmitting } = useUploadUserIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()
  const [frontOfIdentification, setFrontOfIdentification] = React.useState<string | null>(null)
  const [backOfIdentification, setBackOfIdentification] = React.useState<string | null>(null)
  const toast = useToast()
  const form = useForm<z.infer<typeof UploadUserIDSchema>>({
    resolver: zodResolver(UploadUserIDSchema),
  })

  React.useEffect(() => {
    if (!userProfileData?.id_images?.length) {
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
  }, [fetchPresignedURL, toast, userProfileData])

  const isPending = isUploading || isSubmitting

  const onSubmit = async (data: z.infer<typeof UploadUserIDSchema>) => {
    try {
      const files = [data.front_id, data.back_id]
      const uploadPromises = files.map((file) => uploadFiles([file]))
      const responses = await Promise.all(uploadPromises)

      const identificationPhotos = responses.map(
        (response: { file_name: string; file_key: string }[], index: number) => ({
          file_url: response[0].file_key,
          file_name: files[index].name,
        }),
      )

      // Submit the user ID data
      await submitUserID(
        { identificationPhotos },
        {
          onSuccess: () => {
            if (
              userProfileData?.user_type === 'corporate' ||
              userProfileData?.user_type === 'vendor'
            ) {
              navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS)
            } else {
              navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
            }
          },
        },
      )
    } catch (error: any) {
      console.error('File upload failed:', error)
      toast.error(error?.message || 'Failed to upload files. Please try again.')
    }
  }

  return isLoading ? (
    <div className="flex justify-center items-center h-full bg-white">
      <Loader />
    </div>
  ) : userProfileData?.id_images?.length && userProfileData?.id_images?.length > 0 ? (
    <>
      {isFetchingPresignedURL ? (
        <div className="flex justify-center items-center h-full bg-white">
          <Loader />
        </div>
      ) : (
        <>
          {userProfileData?.id_images?.length && userProfileData?.id_images?.length > 0 && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">Front of Identification</p>
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
                <p className="text-sm font-medium text-gray-700">Back of Identification</p>
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
          )}
        </>
      )}
    </>
  ) : (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-full flex flex-col gap-10 min-w-0"
    >
      <p className="text-sm text-gray-500">
        Upload your pictures of your identification (front and back)
      </p>

      {!userProfileData?.id_images && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 min-w-0">
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

      <div className="flex gap-4  border-t border-[#CDD3D3] pt-4">
        <Button onClick={() => navigate(-1)} type="button" variant="outline" className="w-fit">
          Discard
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
