import { Button } from '@/components/Button'
import { Input, FileUploader, CreatableCombobox, Text } from '@/components'
import { ROUTES } from '@/utils/constants'
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks'
import { useNavigate } from 'react-router-dom'
import { BasePhoneInput, RadioGroup, RadioGroupItem } from '@/components'
import { useCountriesData, useUserProfile, useUploadFiles } from '@/hooks'
import React from 'react'
import type { DropdownOption } from '@/types'

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

const CombinedBusinessSchema = BusinessDetailsSchema.merge(UploadBusinessIDSchema)

export default function BusinessDetailsForm() {
  const { useBusinessDetailsService, useBusinessUploadIDService } = useAuth()
  const { data: userProfile } = useUserProfile()
  const { mutateAsync: submitBusinessDetails, isPending: isSubmittingDetails } =
    useBusinessDetailsService()
  const { mutateAsync: submitBusinessID, isPending: isSubmittingID } = useBusinessUploadIDService()
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()

  const { countries } = useCountriesData()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof CombinedBusinessSchema>>({
    resolver: zodResolver(CombinedBusinessSchema),
  })

  React.useEffect(() => {
    if (
      userProfile?.business_details &&
      Array.isArray(userProfile.business_details) &&
      userProfile.business_details.length > 0
    ) {
      const businessDetail = userProfile.business_details[0]
      const firstDoc = userProfile.business_documents?.[0]
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
  }, [userProfile, form])

  const isPending = isSubmittingDetails || isSubmittingID || isUploading

  const onSubmit = async (data: z.infer<typeof CombinedBusinessSchema>) => {
    try {
      // First submit business details
      await submitBusinessDetails({
        name: data.name,
        type: data.type,
        phone: data.phone,
        email: data.email,
        street_address: data.street_address,
        digital_address: data.digital_address,
        registration_number: data.registration_number,
      })

      // Then upload and submit business documents
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

      await submitBusinessID({
        employer_identification_number: data.employer_identification_number,
        business_industry: data.business_industry,
        files,
      })

      // Navigate after both submissions succeed
      navigate(ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.ROOT)
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
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { value, onChange } }) => {
              return (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={countries}
                  selectedVal={value}
                  maxLength={10}
                  handleChange={onChange}
                  label="Business Phone Number"
                  error={form.formState.errors.phone?.message}
                />
              )
            }}
          />
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
            maxLength={10}
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
                options={businessIndustryOptions}
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
          Submit
        </Button>
      </div>
    </form>
  )
}
