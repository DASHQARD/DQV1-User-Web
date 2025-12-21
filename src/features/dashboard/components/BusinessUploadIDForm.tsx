import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import { FileUploader, Input, CreatableCombobox, Loader } from '@/components'
import { Button } from '@/components/Button'
import { useAuth } from '@/features/auth/hooks'
import { UploadBusinessIDSchema } from '@/utils/schemas'
import { useUploadFiles, useToast, userProfile, usePresignedURL } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import type { DropdownOption } from '@/types'
import React from 'react'
import { cn } from '@/libs'

const businessIndustryOptions: DropdownOption[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
]

export default function BusinessUploadIDForm() {
  const navigate = useNavigate()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  console.log('userProfileData', userProfileData)
  const { isLoading } = useGetUserProfileService()
  const { useBusinessUploadIDService } = useAuth()
  const { mutateAsync: submitBusinessID, isPending: isSubmitting } = useBusinessUploadIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()
  const [documentUrls, setDocumentUrls] = React.useState<Record<string, string | null>>({})
  const toast = useToast()
  const form = useForm<z.infer<typeof UploadBusinessIDSchema>>({
    resolver: zodResolver(UploadBusinessIDSchema),
  })

  React.useEffect(() => {
    if (!userProfileData?.business_documents?.length) {
      return
    }

    let cancelled = false

    const loadDocuments = async () => {
      try {
        const documentPromises = userProfileData.business_documents.map(async (doc: any) => {
          const url = await fetchPresignedURL(doc.file_url)
          return { type: doc.type, url }
        })

        const results = await Promise.all(documentPromises)

        if (cancelled) return

        const urlsMap: Record<string, string | null> = {}
        results.forEach(({ type, url }: { type: string; url: string }) => {
          urlsMap[type] = url
        })

        setDocumentUrls(urlsMap)

        // Prefill form with existing data
        const firstDoc = userProfileData.business_documents[0]
        if (firstDoc) {
          form.reset({
            employer_identification_number: firstDoc.employer_identification_number || '',
            business_industry: firstDoc.business_industry || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch business documents', error)
        if (!cancelled) {
          toast.error('Unable to fetch existing business documents.')
        }
      }
    }

    loadDocuments()

    return () => {
      cancelled = true
    }
  }, [fetchPresignedURL, toast, userProfileData, form])

  const isPending = isUploading || isSubmitting

  const onSubmit = async (data: z.infer<typeof UploadBusinessIDSchema>) => {
    try {
      type DocumentType =
        | 'certificate_of_incorporation'
        | 'business_license'
        | 'articles_of_incorporation'
        | 'utility_bill'
        | 'logo'

      const documentTypes: Array<{ file: File; type: DocumentType }> = [
        { file: data.certificate_of_incorporation, type: 'certificate_of_incorporation' },
        { file: data.business_license, type: 'business_license' },
        ...(data.articles_of_incorporation
          ? [{ file: data.articles_of_incorporation, type: 'articles_of_incorporation' as const }]
          : []),
        { file: data.utility_bill, type: 'utility_bill' },
        ...(data.logo ? [{ file: data.logo, type: 'logo' as const }] : []),
      ]

      const uploadPromises = documentTypes.map((doc) => uploadFiles([doc.file]))
      const responses = await Promise.all(uploadPromises)

      const files = responses.map(
        (response: { file_name: string; file_key: string }[], index: number) => ({
          type: documentTypes[index].type,
          file_url: response[0].file_key,
          file_name: documentTypes[index].file.name,
        }),
      )

      await submitBusinessID(
        {
          employer_identification_number: data.employer_identification_number,
          business_industry: data.business_industry,
          files,
        },
        {
          onSuccess: () => {
            navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
          },
        },
      )
    } catch (error: any) {
      console.error('File upload failed:', error)
      toast.error(error?.message || 'Failed to upload files. Please try again.')
    }
  }

  const hasDocuments =
    userProfileData?.business_documents?.length && userProfileData.business_documents.length > 0

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-white">
        <Loader />
      </div>
    )
  }

  if (hasDocuments) {
    return (
      <>
        {isFetchingPresignedURL ? (
          <div className="flex justify-center items-center h-full bg-white">
            <Loader />
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            {userProfileData.business_documents.map((doc: any) => (
              <div key={doc.id}>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {doc.type
                    .split('_')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </p>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center',
                  )}
                >
                  {documentUrls[doc.type] ? (
                    <img
                      src={documentUrls[doc.type] ?? ''}
                      alt={doc.file_name}
                      className="max-h-48 w-full object-contain"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Loading image...</p>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-full flex flex-col gap-10 min-w-0"
    >
      <div className="p-4 bg-[#EAEBEF]">
        <p className="text-sm text-gray-500">
          Submit the following documents to help us verify your business.
        </p>
        <div className="p-4">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Certificate of Incorporation (Required)</li>
            <li>Business License (Required)</li>
            <li>Articles of Incorporation (Optional)</li>
            <li>Utility Bill (Required)</li>
            <li>Business Logo (Optional)</li>
          </ul>
        </div>
      </div>

      <section className="flex flex-col gap-4 min-w-0">
        <Input
          label="Employer Identification Number"
          placeholder="Enter your employer identification number"
          {...form.register('employer_identification_number')}
          error={form.formState.errors.employer_identification_number?.message}
        />

        <Controller
          control={form.control}
          name="business_industry"
          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
            <CreatableCombobox
              label="Business Industry"
              placeholder="Select or create your business industry"
              options={businessIndustryOptions}
              name={name}
              value={value}
              onChange={onChange}
              error={error?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          <Controller
            control={form.control}
            name="certificate_of_incorporation"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploader
                label="Upload Certificate of Incorporation"
                value={value}
                onChange={onChange}
                error={error?.message}
                id="certificate_of_incorporation"
              />
            )}
          />

          <Controller
            control={form.control}
            name="business_license"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploader
                label="Upload Business License"
                value={value}
                onChange={onChange}
                error={error?.message}
                id="business_license"
              />
            )}
          />

          <Controller
            control={form.control}
            name="articles_of_incorporation"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploader
                label="Upload Articles of Incorporation (Optional)"
                value={value || null}
                onChange={onChange}
                error={error?.message}
                id="articles_of_incorporation"
              />
            )}
          />
          <Controller
            control={form.control}
            name="utility_bill"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploader
                label="Upload Utility Bill"
                value={value}
                onChange={onChange}
                error={error?.message}
                id="utility_bill"
              />
            )}
          />

          <Controller
            control={form.control}
            name="logo"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploader
                label="Upload Business Logo (Optional)"
                value={value || null}
                onChange={onChange}
                error={error?.message}
                id="logo"
              />
            )}
          />
        </div>
      </section>
      <div className="flex gap-4 border-t border-[#CDD3D3] pt-4">
        <Button
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)}
          type="button"
          variant="outline"
          className="w-fit"
        >
          Back
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Next
        </Button>
      </div>
    </form>
  )
}
