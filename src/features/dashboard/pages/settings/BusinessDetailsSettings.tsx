import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, CreatableCombobox, Text, FileUploader, Avatar } from '@/components'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import {
  useUserProfile,
  useUploadFiles,
  usePresignedURL,
  useToast,
  useCountriesData,
} from '@/hooks'
import { BasePhoneInput } from '@/components'

const UpdateBusinessDetailsSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Business name is required'),
  type: z.string().min(1, 'Business type is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  street_address: z.string().min(1, 'Street address is required'),
  digital_address: z.string().optional().default(''),
  registration_number: z.string().min(1, 'Registration number is required'),
})

export function BusinessDetailsSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdateBusinessDetailsService, useUpdateBusinessLogoService } = corporateMutations()
  const { mutateAsync: updateBusinessDetails, isPending } = useUpdateBusinessDetailsService()
  const { mutateAsync: updateBusinessLogo, isPending: isUpdatingLogo } =
    useUpdateBusinessLogoService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const { countries: phoneCountries } = useCountriesData()
  const toast = useToast()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)

  const isApproved = userProfileData?.status === 'approved'

  console.log('userProfileData checking', userProfileData)

  type FormData = z.input<typeof UpdateBusinessDetailsSchema>
  const form = useForm<FormData>({
    resolver: zodResolver(UpdateBusinessDetailsSchema),
    defaultValues: {
      id: 0,
      name: '',
      type: '',
      phone: '',
      email: '',
      street_address: '',
      digital_address: '',
      registration_number: '',
    },
  })

  React.useEffect(() => {
    if (userProfileData?.business_details?.[0]) {
      const business = userProfileData.business_details[0]
      form.reset({
        id: business.id,
        name: business.name || '',
        type: business.type || '',
        phone: business.phone || '',
        email: business.email || '',
        street_address: business.street_address || '',
        digital_address: business.digital_address || '',
        registration_number: business.registration_number || '',
      })
    }
  }, [userProfileData, form])

  // Fetch logo
  React.useEffect(() => {
    const logoDocument = userProfileData?.business_documents?.find((doc) => doc.type === 'logo')
    if (!logoDocument?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDocument.file_url)
        if (!cancelled) {
          setLogoUrl(url)
        }
      } catch (error) {
        console.error('Failed to fetch logo presigned URL', error)
        if (!cancelled) {
          setLogoUrl(null)
        }
      }
    }

    loadLogo()

    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  const handleLogoFileChange = (file: File | null) => {
    setLogoFile(file)
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    try {
      const uploadedFiles = await uploadFiles([logoFile])
      if (uploadedFiles && uploadedFiles.length > 0) {
        const fileKey = uploadedFiles[0].file_key
        await updateBusinessLogo({ file_url: fileKey })
        // Fetch the presigned URL for the newly uploaded logo
        try {
          const url = await fetchPresignedURL(fileKey)
          setLogoUrl(url)
          setLogoFile(null)
          toast.success('Logo uploaded successfully')
        } catch (error) {
          console.error('Failed to fetch presigned URL for new logo', error)
          // Still set the file_key as fallback
          setLogoUrl(fileKey)
          setLogoFile(null)
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload logo')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        digital_address: data.digital_address || '',
      } as z.output<typeof UpdateBusinessDetailsSchema>
      await updateBusinessDetails(payload)
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update business details')
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-6">
          <div>
            <Text variant="h6" weight="medium" className="mb-2">
              Business Logo
            </Text>
            <Text variant="span" className="text-sm text-gray-600">
              Upload your business logo. Recommended size: 200x200px
            </Text>
          </div>
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              src={logoUrl}
              name={userProfileData?.business_details?.[0]?.name || 'Business'}
              className="w-24 h-24"
            />
            {!isApproved && (
              <div className="flex flex-col gap-2">
                <FileUploader
                  onChange={handleLogoFileChange}
                  value={logoFile}
                  accept="image/*"
                  id="logo-upload"
                />
                {logoFile && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleLogoUpload}
                    loading={isUpdatingLogo}
                  >
                    Upload Logo
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Business Name"
            className="col-span-2"
            placeholder="Enter business name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
            disabled={isApproved}
          />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState: { error } }) => (
                <CreatableCombobox
                  className="col-span-2"
                  label="Business Type"
                  options={[
                    { label: 'LLC', value: 'llc' },
                    { label: 'Sole Proprietor', value: 'sole_proprietor' },
                    { label: 'Partnership', value: 'partnership' },
                    { label: 'Corporation', value: 'corporation' },
                  ]}
                  value={field.value}
                  onChange={(e: any) => {
                    const value = e?.target?.value || e?.value || ''
                    field.onChange(value)
                  }}
                  error={error?.message}
                  placeholder="Select business type"
                  isDisabled={isApproved}
                />
              )}
            />

            <div className="flex flex-col gap-1 md:col-span-full col-span-1">
              <Controller
                control={form.control}
                name="phone"
                render={({ field: { onChange, value } }) => {
                  // Ensure value is always a string
                  const phoneValue = value || ''
                  return (
                    <BasePhoneInput
                      placeholder="Enter number eg. 5512345678"
                      options={phoneCountries}
                      maxLength={9}
                      handleChange={onChange}
                      selectedVal={phoneValue}
                      label="Phone Number"
                      error={form.formState.errors.phone?.message}
                      disabled={isApproved}
                    />
                  )
                }}
              />
              <p className="text-xs text-gray-500">
                Please enter your number in the format:{' '}
                <span className="font-medium">5512345678</span>
              </p>
            </div>
          </section>

          <Input
            label="Email"
            type="email"
            placeholder="Enter email address"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            disabled={isApproved}
          />

          <Input
            label="Street Address"
            placeholder="Enter street address"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
            disabled={isApproved}
          />

          <Input
            label="Digital Address"
            placeholder="Enter digital address (optional)"
            {...form.register('digital_address')}
            error={form.formState.errors.digital_address?.message}
            disabled={isApproved}
          />

          <Input
            label="Registration Number"
            className="col-span-2"
            placeholder="Enter registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
            disabled={isApproved}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" variant="secondary" loading={isPending} disabled={isApproved}>
            Update
          </Button>
        </div>
      </form>
    </div>
  )
}
