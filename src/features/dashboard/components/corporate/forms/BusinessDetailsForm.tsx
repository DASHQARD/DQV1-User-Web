import { Button } from '@/components/Button'
import { Input, FileUploader, CreatableCombobox, Text, Modal, ImageUpload } from '@/components'
import { BUSINESS_INDUSTRY_OPTIONS, ROUTES } from '@/utils/constants'
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../../../auth/hooks'
import { useNavigate } from 'react-router-dom'
import { BasePhoneInput, RadioGroup, RadioGroupItem } from '@/components'
import {
  useCountriesData,
  useUserProfile,
  useUploadFiles,
  usePresignedURL,
  useToast,
} from '@/hooks'
import React from 'react'
import { cn } from '@/libs'
import LoaderGif from '@/assets/gifs/loader.gif'

const CombinedBusinessSchema = BusinessDetailsSchema.merge(UploadBusinessIDSchema)

const DRAFT_STORAGE_KEY = 'business_details_form_draft'

const BUSINESS_TYPE_OPTIONS = [
  {
    value: 'llc' as const,
    title: 'Limited Liability Company',
    description:
      "A flexible structure that protects owners' personal assets from business liabilities.",
  },
  {
    value: 'sole_proprietor' as const,
    title: 'Sole Proprietorship',
    description: 'A business owned and run by one person with no legal distinction from the owner.',
  },
  {
    value: 'partnership' as const,
    title: 'Partnership',
    description: 'Two or more parties agree to share ownership, profits, and liability.',
  },
]

export default function BusinessDetailsForm() {
  const { useBusinessDetailsWithDocumentsService } = useAuth()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: submitBusinessDetails, isPending: isSubmittingDetails } =
    useBusinessDetailsWithDocumentsService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL, isPending: isFetchingPresignedURL } = usePresignedURL()
  const toast = useToast()
  const [documentUrls, setDocumentUrls] = React.useState<Record<string, string | null>>({})
  const [isSavingProgress, setIsSavingProgress] = React.useState(false)

  const { countries: phoneCountries } = useCountriesData()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof CombinedBusinessSchema>>({
    resolver: zodResolver(CombinedBusinessSchema),
    mode: 'onChange',
  })

  // Save progress to localStorage (including File objects as base64)
  const saveProgress = React.useCallback(async () => {
    try {
      const draftData: Record<string, any> = {}
      const formValues = form.getValues()

      // Save only non-file fields
      const nonFileFields: (keyof typeof formValues)[] = [
        'name',
        'type',
        'phone',
        'email',
        'street_address',
        'digital_address',
        'registration_number',
        'employer_identification_number',
        'business_industry',
      ]

      nonFileFields.forEach((field) => {
        if (
          formValues[field] !== undefined &&
          formValues[field] !== null &&
          formValues[field] !== ''
        ) {
          draftData[field] = formValues[field]
        }
      })

      // Save file data as base64
      const fileFields: (keyof typeof formValues)[] = [
        'certificate_of_incorporation',
        'business_license',
        'articles_of_incorporation',
        'utility_bill',
        'logo',
      ]

      // Convert files to base64 and save
      for (const field of fileFields) {
        const file = formValues[field] as File | undefined
        if (file) {
          try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => {
                const result = reader.result as string
                resolve(result)
              }
              reader.onerror = reject
              reader.readAsDataURL(file)
            })

            draftData[`${field}_name`] = file.name
            draftData[`${field}_size`] = file.size
            draftData[`${field}_type`] = file.type
            draftData[`${field}_data`] = base64
          } catch (fileError) {
            console.error(`Failed to convert ${field} to base64:`, fileError)
            // Still save metadata even if base64 conversion fails
            draftData[`${field}_name`] = file.name
            draftData[`${field}_size`] = file.size
            draftData[`${field}_type`] = file.type
          }
        }
      }

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      return true
    } catch (error) {
      console.error('Failed to save progress:', error)
      return false
    }
  }, [form])

  // Load saved progress from localStorage
  const loadProgress = React.useCallback(() => {
    try {
      const savedData = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!savedData) return null

      const draftData = JSON.parse(savedData)

      // Convert base64 strings back to File objects
      const fileFields = [
        'certificate_of_incorporation',
        'business_license',
        'articles_of_incorporation',
        'utility_bill',
        'logo',
      ]

      fileFields.forEach((field) => {
        if (
          draftData[`${field}_data`] &&
          draftData[`${field}_name`] &&
          draftData[`${field}_type`]
        ) {
          try {
            // Convert base64 to File object
            const base64Data = draftData[`${field}_data`]
            const byteString = atob(base64Data.split(',')[1])
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mimeString })
            const file = new File([blob], draftData[`${field}_name`], {
              type: draftData[`${field}_type`],
              lastModified: Date.now(),
            })
            draftData[field] = file
          } catch (fileError) {
            console.error(`Failed to convert ${field} from base64:`, fileError)
          }
        }
      })

      return draftData
    } catch (error) {
      console.error('Failed to load progress:', error)
      return null
    }
  }, [])

  // Clear saved progress
  const clearProgress = React.useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear progress:', error)
    }
  }, [])

  // Manual save progress handler
  const handleSaveProgress = React.useCallback(async () => {
    setIsSavingProgress(true)
    try {
      const success = await saveProgress()
      if (success) {
        toast.success('Progress saved successfully. You can continue later.')
      } else {
        toast.error('Failed to save progress. Please try again.')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Failed to save progress. Please try again.')
    } finally {
      setTimeout(() => setIsSavingProgress(false), 500)
    }
  }, [saveProgress, toast])

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

  // Load saved progress on mount (only if no existing userProfileData)
  React.useEffect(() => {
    const hasExistingData =
      userProfileData?.business_details &&
      Array.isArray(userProfileData.business_details) &&
      userProfileData.business_details.length > 0

    if (!hasExistingData) {
      const savedProgress = loadProgress()
      if (savedProgress) {
        form.reset({
          name: savedProgress.name || '',
          type: savedProgress.type,
          phone: savedProgress.phone || '',
          email: savedProgress.email || '',
          street_address: savedProgress.street_address || '',
          digital_address: savedProgress.digital_address || '',
          registration_number: savedProgress.registration_number || '',
          employer_identification_number: savedProgress.employer_identification_number || '',
          business_industry: savedProgress.business_industry || '',
          // Restore file fields if they exist
          certificate_of_incorporation: savedProgress.certificate_of_incorporation || undefined,
          business_license: savedProgress.business_license || undefined,
          articles_of_incorporation: savedProgress.articles_of_incorporation || undefined,
          utility_bill: savedProgress.utility_bill || undefined,
          logo: savedProgress.logo || undefined,
        })
        // Trigger validation after a brief delay to ensure File objects are recognized
        setTimeout(async () => {
          // Manually trigger validation to update formState.isValid
          await form.trigger()
        }, 200)
        toast.success('Saved progress loaded. Continue where you left off.')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

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
        { file: data.logo, type: 'logo' },
        { file: data.certificate_of_incorporation, type: 'certificate_of_incorporation' },
        { file: data.business_license, type: 'business_license' },
        { file: data.utility_bill, type: 'utility_bill' },
        ...(data.articles_of_incorporation
          ? [{ file: data.articles_of_incorporation, type: 'articles_of_incorporation' as const }]
          : []),
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
            // Clear saved progress on successful submission
            clearProgress()
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
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Text variant="h3" weight="semibold">
            Business Details
          </Text>
          <Text variant="span" className="text-[#A0AEC0]">
            Complete your business information
          </Text>
        </div>

        <hr className="border-[#F1F2F4]" />

        <section className="flex flex-col gap-4 flex-1">
          <Controller
            control={form.control}
            name="logo"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const existingUrl = documentUrls['logo']
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Text as="label" className="text-[#151819] text-sm font-medium">
                      Business Logo
                    </Text>
                    <span className="text-error">*</span>
                  </div>
                  <ImageUpload
                    file={value ?? null}
                    onFileChange={(f) => onChange(f ?? null)}
                    onUpload={() => {}}
                    isUploading={isPending}
                    currentImageUrl={existingUrl && !value ? existingUrl : undefined}
                    className="h-[120px]! w-[120px]!"
                  />
                  {error && <p className="text-sm text-red-500">{error.message}</p>}
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="type"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="flex flex-col gap-2">
                <Text variant="h3" weight="semibold">
                  Business Type
                </Text>
                <RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-3">
                  {BUSINESS_TYPE_OPTIONS.map((opt) => {
                    const isSelected = value === opt.value
                    const id = `business-type-${opt.value}`
                    return (
                      <label
                        key={opt.value}
                        htmlFor={id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                          'bg-gray-50 hover:bg-gray-100',
                          isSelected ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200',
                        )}
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-gray-900">{opt.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                        </div>
                        <RadioGroupItem
                          value={opt.value}
                          id={id}
                          className={cn(
                            'shrink-0 size-5',
                            isSelected
                              ? 'border-primary-500 data-[state=checked]:border-primary-500'
                              : '',
                          )}
                        />
                      </label>
                    )
                  })}
                </RadioGroup>
                {error && <p className="text-sm text-red-500">{error.message}</p>}
              </div>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              isRequired
              placeholder="Provide your business name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
            <Controller
              control={form.control}
              name="phone"
              render={({ field: { onChange } }) => (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  isRequired
                  maxLength={14}
                  handleChange={onChange}
                  label="Phone Number"
                  error={form.formState.errors.phone?.message}
                  hint={
                    <>
                      Please enter your number in the format:{' '}
                      <span className="font-medium">5512345678</span>
                    </>
                  }
                />
              )}
            />
          </div>

          <Input
            label="Business Email"
            isRequired
            placeholder="Enter your email"
            {...form.register('email')}
            type="email"
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Business Registration Number (VAT)"
            isRequired
            placeholder="Enter your business registration number (VAT)"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Taxpayer Identification Number (TIN)"
              isRequired
              placeholder="Enter your Taxpayer Identification Number (TIN)"
              {...form.register('employer_identification_number')}
              error={form.formState.errors.employer_identification_number?.message}
            />
            <Controller
              control={form.control}
              name="business_industry"
              render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                <CreatableCombobox
                  label="Business Industry"
                  isRequired
                  placeholder="Select or create your business industry"
                  options={BUSINESS_INDUSTRY_OPTIONS}
                  name={name}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Street Address"
              isRequired
              placeholder="Enter your business street address"
              {...form.register('street_address')}
              error={form.formState.errors.street_address?.message}
            />
            <Input
              label="Business Ghana Post Digital Address"
              isRequired
              placeholder="Enter your Ghana Post Digital Address"
              {...form.register('digital_address')}
              error={form.formState.errors.digital_address?.message}
            />
          </div>
        </section>
      </section>

      {/* Business Documents Section */}
      <section className="flex flex-col gap-4 border-b border-[#CDD3D3] pb-16">
        <div className="flex flex-col gap-2 w-full">
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
              <li>Utility Bill (Required)</li>
              <li>Articles of Incorporation (Optional)</li>
            </ul>
          </div>

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
          </div>
        </section>
      </section>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(-1)}>
          Discard
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={handleSaveProgress}
          disabled={isSavingProgress || isPending}
        >
          {isSavingProgress ? 'Saving...' : 'Save Progress'}
        </Button>
        <Button
          disabled={!form.formState.isValid || isPending}
          type="submit"
          variant="secondary"
          className="w-fit"
        >
          Submit
        </Button>
      </div>

      {/* Submission Modal with Loader */}
      <Modal
        isOpen={isPending}
        setIsOpen={() => {}}
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
