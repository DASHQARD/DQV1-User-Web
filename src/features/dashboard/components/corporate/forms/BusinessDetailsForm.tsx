import { Button } from '@/components/Button'
import { Input, FileUploader, CreatableCombobox, Text, Modal } from '@/components'
import { BUSINESS_INDUSTRY_OPTIONS, ROUTES } from '@/utils/constants'
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../../../auth/hooks'
import { useNavigate } from 'react-router-dom'
import { BasePhoneInput, RadioGroup, RadioGroupItem } from '@/components'
import { useCountriesData, userProfile, useUploadFiles, usePresignedURL, useToast } from '@/hooks'
import React from 'react'
import LoaderGif from '@/assets/gifs/loader.gif'

const CombinedBusinessSchema = BusinessDetailsSchema.merge(UploadBusinessIDSchema)

export default function BusinessDetailsForm() {
  const { useBusinessDetailsWithDocumentsService } = useAuth()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: submitBusinessDetails, isPending: isSubmittingDetails } =
    useBusinessDetailsWithDocumentsService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()
  const toast = useToast()
  const [documentUrls, setDocumentUrls] = React.useState<Record<string, string | null>>({})

  const { countries: phoneCountries } = useCountriesData()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof CombinedBusinessSchema>>({
    resolver: zodResolver(CombinedBusinessSchema),
  })

  // Fetch business documents
  React.useEffect(() => {
    if (!userProfileData?.business_documents?.length) {
      return
    }

    let cancelled = false

    const loadDocuments = async () => {
      try {
        const documentPromises = userProfileData.business_documents.map(async (doc) => {
          const url = await fetchPresignedURL(doc.file_url)
          return { type: doc.type, url }
        })

        const results = await Promise.all(documentPromises)

        if (cancelled) return

        const urlsMap: Record<string, string | null> = {}
        results.forEach(({ type, url }) => {
          urlsMap[type] = url
        })

        setDocumentUrls(urlsMap)
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
  }, [fetchPresignedURL, toast, userProfileData])

  const isPending = isSubmittingDetails || isUploading || isFetchingPresignedURL
  // Pre-fill form with existing business details and documents data
  React.useEffect(() => {
    if (
      userProfileData?.business_details &&
      Array.isArray(userProfileData.business_details) &&
      userProfileData.business_details.length > 0
    ) {
      const businessDetail = userProfileData.business_details[0]
      const firstDoc = userProfileData.business_documents?.[0]
      form.reset({
        name: businessDetail?.name || '',
        type: businessDetail?.type,
        phone: businessDetail?.phone || '',
        email: businessDetail?.email || '',
        street_address: businessDetail?.street_address || '',
        digital_address: businessDetail?.digital_address || '',
        registration_number: businessDetail?.registration_number || '',
        employer_identification_number: firstDoc?.employer_identification_number || '',
        business_industry: firstDoc?.business_industry || '',
      })
    }
  }, [userProfileData, form])

  const onSubmit = async (data: z.infer<typeof CombinedBusinessSchema>) => {
    try {
      // Upload all business documents
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

      // Submit business details with documents in a single request
      await submitBusinessDetails(
        {
          name: data.name,
          type: data.type,
          phone: data.phone,
          email: data.email,
          street_address: data.street_address,
          digital_address: data.digital_address,
          registration_number: data.registration_number,
          country: 'Ghana',
          country_code: '01',
          employer_identification_number: data.employer_identification_number,
          business_industry: data.business_industry,
          files,
        },
        {
          onSuccess: () => {
            const DashboardUrl = `${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`
            navigate(DashboardUrl)
          },
        },
      )
    } catch (error: any) {
      console.error('Submission failed:', error)
      // Error toast is already shown by the mutation's onError handler
    }
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <section className="flex sm:flex-row flex-col gap-10 border-b border-[#CDD3D3] pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
          <Text variant="h6" weight="normal" className="text-[#151819]">
            Business Details
          </Text>
          <p className="text-sm text-gray-500">Complete your business information</p>
        </div>
        <section className="flex flex-col gap-4 flex-1">
          <Input
            label="Business Name"
            placeholder="Provide your business name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <Text as="h2" className="text-2xl font-bold">
                  Business Type
                </Text>
                <RadioGroup value={value} onValueChange={onChange}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="llc" id="r1" />
                    <Text as="label" htmlFor="r1" className="cursor-pointer">
                      Limited Liability Company
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="sole_proprietor" id="r2" />
                    <Text as="label" htmlFor="r2" className="cursor-pointer">
                      Sole Proprietorship
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="partnership" id="r3" />
                    <Text as="label" htmlFor="r3" className="cursor-pointer">
                      Partnership
                    </Text>
                  </div>
                </RadioGroup>
                {error && <p className="text-sm text-red-500">{error.message}</p>}
              </div>
            )}
          />

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="phone"
              render={({ field: { onChange } }) => {
                return (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={phoneCountries}
                    maxLength={9}
                    handleChange={onChange}
                    label="Phone Number"
                    error={form.formState.errors.phone?.message}
                  />
                )
              }}
            />
            <p className="text-xs text-gray-500">
              Please enter your number in the format:{' '}
              <span className="font-medium">5512345678</span>
            </p>
          </div>
          <Input
            label="Email"
            placeholder="Enter your email"
            {...form.register('email')}
            type="email"
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Street Address"
            placeholder="Enter your business street address"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
          />

          <Input
            label="Ghana Post Digital Address"
            placeholder="Enter your Ghana Post Digital Address"
            {...form.register('digital_address')}
            error={form.formState.errors.digital_address?.message}
          />

          <Input
            label="Business Registration Number"
            placeholder="Enter your business registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
          />
        </section>
      </section>

      {/* Business Documents Section */}
      <section className="flex sm:flex-row flex-col gap-10 border-b border-[#CDD3D3] pb-16">
        <div className="flex flex-col gap-2 max-w-[271px] w-full">
          <Text variant="h6" weight="normal" className="text-[#151819]">
            Business Documents
          </Text>
          <p className="text-sm text-gray-500">Upload required business documents</p>
        </div>
        <section className="flex flex-col gap-4 flex-1">
          <div className="p-4 bg-[#EAEBEF]">
            <p className="text-sm text-gray-500 mb-2">
              Submit the following documents to help us verify your business.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Certificate of Incorporation (Required)</li>
              <li>Business License (Required)</li>
              <li>Articles of Incorporation (Optional)</li>
              <li>Utility Bill (Required)</li>
              <li>Business Logo (Optional)</li>
            </ul>
          </div>

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
                options={BUSINESS_INDUSTRY_OPTIONS}
                name={name}
                value={value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="certificate_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['certificate_of_incorporation']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'certificate_of_incorporation',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Certificate of Incorporation'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Certificate of Incorporation'
                          : 'Upload Certificate of Incorporation'
                      }
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="certificate_of_incorporation"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="business_license"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['business_license']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'business_license',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Business License'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Business License'
                          : 'Upload Business License'
                      }
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="business_license"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="articles_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['articles_of_incorporation']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'articles_of_incorporation',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Articles of Incorporation'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Articles of Incorporation (Optional)'
                          : 'Upload Articles of Incorporation (Optional)'
                      }
                      value={value || null}
                      onChange={onChange}
                      error={error?.message}
                      id="articles_of_incorporation"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="utility_bill"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['utility_bill']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'utility_bill',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Utility Bill'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={existingUrl && !value ? 'Replace Utility Bill' : 'Upload Utility Bill'}
                      value={value}
                      onChange={onChange}
                      error={error?.message}
                      id="utility_bill"
                    />
                  </div>
                )
              }}
            />

            <Controller
              control={form.control}
              name="logo"
              render={({ field: { onChange, value }, fieldState: { error } }) => {
                const existingUrl = documentUrls['logo']
                const existingDoc = userProfileData?.business_documents?.find(
                  (doc) => doc.type === 'logo',
                )
                return (
                  <div className="space-y-2">
                    {existingUrl && !value && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-48">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Current Document</p>
                        </div>
                        <img
                          src={existingUrl}
                          alt={existingDoc?.file_name || 'Business Logo'}
                          className="max-h-48 w-full object-contain rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <FileUploader
                      label={
                        existingUrl && !value
                          ? 'Replace Business Logo (Optional)'
                          : 'Upload Business Logo (Optional)'
                      }
                      value={value || null}
                      onChange={onChange}
                      error={error?.message}
                      id="logo"
                    />
                  </div>
                )
              }}
            />
          </div>
        </section>
      </section>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(-1)}>
          Discard
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Save Changes
        </Button>
      </div>

      {/* Submission Modal with Loader */}
      <Modal
        isOpen={isPending}
        setIsOpen={() => {}} // Prevent closing during submission
        title="Saving Business Details"
        showClose={false}
        position="center"
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 min-h-[200px]">
          <div className="flex justify-center items-center mb-6">
            <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
          </div>
          <Text variant="p" className="text-center text-gray-600">
            Please wait while we save your business details and upload your documents...
          </Text>
        </div>
      </Modal>
    </form>
  )
}
