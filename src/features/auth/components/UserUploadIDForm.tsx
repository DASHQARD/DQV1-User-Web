import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { FileUploader } from '@/components'
import { Button } from '@/components/Button'
import { useAuth } from '../../auth/hooks'
import { UploadUserIDSchema } from '@/utils/schemas'
import { useUploadFiles } from '@/hooks'
import { useToast } from '@/hooks'
import { ROUTES } from '@/utils/constants'

export default function UserUploadIDForm() {
  const navigate = useNavigate()
  const { useUploadUserIDService } = useAuth()
  const { mutateAsync: submitUserID, isPending: isSubmitting } = useUploadUserIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const toast = useToast()
  const form = useForm<z.infer<typeof UploadUserIDSchema>>({
    resolver: zodResolver(UploadUserIDSchema),
  })

  const isPending = isUploading || isSubmitting

  const onSubmit = async (data: z.infer<typeof UploadUserIDSchema>) => {
    try {
      // Upload each file one at a time using Promise.all
      const files = [data.front_id, data.back_id, data.selfie_id]
      const uploadPromises = files.map((file) => uploadFiles([file]))
      const responses = await Promise.all(uploadPromises)

      // Map the uploaded files to the required format
      // Each response is an array with one file, so we take the first element
      const identificationPhotos = responses.map(
        (response: { file_name: string; file_key: string }[], index: number) => ({
          file_url: response[0].file_key, // file_key is the URL/key
          file_name: files[index].name, // Use the original file name
        }),
      )

      // Submit the user ID data
      await submitUserID({ identificationPhotos })
      // Navigate to home or next step after successful submission
      navigate(ROUTES.IN_APP.HOME)
    } catch (error: any) {
      console.error('File upload failed:', error)
      toast.error(error?.message || 'Failed to upload files. Please try again.')
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <p className="text-sm text-gray-500">
        Upload your pictures of your identification (front and back)
      </p>

      <section className="flex flex-col gap-4">
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

        <Controller
          control={form.control}
          name="selfie_id"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FileUploader
              label="Upload Picture of Selfie with Identification"
              value={value}
              onChange={onChange}
              error={error?.message}
              id="selfie_id"
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate(ROUTES.IN_APP.AUTH.ONBOARDING)}
            type="button"
            variant="outline"
            className="w-full"
          >
            Back
          </Button>
          <Button
            disabled={!form.formState.isValid || isPending}
            loading={isPending}
            type="submit"
            variant="secondary"
            className="w-full"
          >
            Next
          </Button>
        </div>
      </section>
    </form>
  )
}
