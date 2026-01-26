import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Text } from '@/components'
import { Icon } from '@/libs'
import { usePersistedModalState, useUploadFiles, useCountriesData, useToast } from '@/hooks'
import { MODALS } from '@/utils/constants'
import type { CreateVendorPayload } from '@/types/forms'
import type { UserProfileResponse } from '@/types/user'
import {
  VendorNameForm,
  VendorProfileForm,
  VendorDetailsForm,
} from '@/features/dashboard/components/vendors/forms'
import { ProfileAndIdentitySchema } from '@/utils/schemas'
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'
// Combined form schema for all steps
const vendorNameSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
  use_corporate_info: z.boolean().optional(),
  checkbox_profile_same_as_corporate: z.boolean().optional(),
  checkbox_vendor_details_same_as_corporate: z.boolean().optional(),
})

// File validation helper
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')

const optionalFileSchema = z.union([fileSchema, z.undefined(), z.null(), z.literal('')]).optional()

// Conditional schemas that make fields optional based on checkboxes
const conditionalProfileSchema = z
  .object({
    checkbox_profile_same_as_corporate: z.boolean().optional(),
    front_id: optionalFileSchema,
    back_id: optionalFileSchema,
  })
  .superRefine((data, ctx) => {
    if (data.checkbox_profile_same_as_corporate) {
      return
    }
    if (!data.front_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Front ID photo is required',
        path: ['front_id'],
      })
    }
    // Back ID not required for National ID or Passport
  })

const conditionalBusinessDocsSchema = z
  .object({
    checkbox_vendor_details_same_as_corporate: z.boolean().optional(),
    logo: optionalFileSchema,
    certificate_of_incorporation: optionalFileSchema,
    business_license: optionalFileSchema,
    utility_bill: optionalFileSchema,
  })
  .superRefine((data, ctx) => {
    if (data.checkbox_vendor_details_same_as_corporate) {
      return
    }
    if (!data.logo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business logo is required',
        path: ['logo'],
      })
    }
    if (!data.certificate_of_incorporation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Certificate of Incorporation is required',
        path: ['certificate_of_incorporation'],
      })
    }
    if (!data.business_license) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business License is required',
        path: ['business_license'],
      })
    }
    if (!data.utility_bill) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Utility Bill is required',
        path: ['utility_bill'],
      })
    }
  })

// Remove name from BusinessDetailsSchema since we use vendor_name
const businessDetailsSchemaWithoutName = BusinessDetailsSchema.omit({ name: true })

// Remove file fields from UploadBusinessIDSchema since we handle them conditionally
const uploadBusinessIDSchemaWithoutFiles = UploadBusinessIDSchema.omit({
  certificate_of_incorporation: true,
  business_license: true,
  utility_bill: true,
})

const createVendorFormSchema = vendorNameSchema
  .merge(ProfileAndIdentitySchema.omit({ front_id: true, back_id: true }))
  .merge(conditionalProfileSchema)
  .merge(businessDetailsSchemaWithoutName)
  .merge(uploadBusinessIDSchemaWithoutFiles)
  .merge(conditionalBusinessDocsSchema)

type CreateVendorFormData = z.infer<typeof createVendorFormSchema>

type CreateVendorAccountModalData = {
  user: UserProfileResponse | null
}

export function CreateVendorAccount() {
  const modal = usePersistedModalState<CreateVendorAccountModalData>({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT,
  })

  const corporateUser = modal.modalData?.user || null

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
  }, [modal])

  return (
    <Modal
      position="center"
      title=""
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[1200px] max-w-[90vw]"
    >
      <CreateVendorAccountContent onClose={handleCloseModal} corporateUser={corporateUser} />
    </Modal>
  )
}

function CreateVendorAccountContent({
  onClose,
  corporateUser,
}: {
  onClose: () => void
  corporateUser: UserProfileResponse | null
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)

  const methods = useForm<CreateVendorFormData>({
    resolver: zodResolver(createVendorFormSchema),
    mode: 'onTouched',
    defaultValues: {
      vendor_name: '',
      use_corporate_info: false,
      checkbox_profile_same_as_corporate: false,
      checkbox_vendor_details_same_as_corporate: false,
      first_name: '',
      last_name: '',
      dob: '',
      id_type: '',
      id_number: '',
      street_address: '',
      type: undefined,
      phone: '',
      email: '',
      digital_address: '',
      registration_number: '',
      employer_identification_number: '',
      business_industry: '',
    } as Partial<CreateVendorFormData>,
  })

  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { countries } = useCountriesData()
  const toast = useToast()
  const { useCreateVendorService } = corporateMutations()
  const { mutateAsync: createVendor } = useCreateVendorService()
  const handleCloseModal = React.useCallback(() => {
    methods.reset()
    setStep(1)
    onClose()
  }, [methods, onClose])

  const goToNextStep = React.useCallback(() => {
    setStep((current) => {
      if (current < 3) {
        return (current + 1) as 1 | 2 | 3
      }
      return current
    })
  }, [])

  const goToPreviousStep = React.useCallback(() => {
    setStep((current) => {
      if (current > 1) {
        return (current - 1) as 1 | 2 | 3
      }
      return current
    })
  }, [])

  const handleStep1Complete = React.useCallback(() => {
    methods.trigger('vendor_name').then((isValid) => {
      if (isValid) {
        goToNextStep()
      }
    })
  }, [methods, goToNextStep])

  const handleProfileSubmit = React.useCallback(() => {
    const checkboxProfileSameAsCorporate = methods.getValues('checkbox_profile_same_as_corporate')

    // Only validate front_id if checkbox is not checked (National ID / Passport: front only)
    const fieldsToValidate = checkboxProfileSameAsCorporate
      ? ([
          'first_name',
          'last_name',
          'dob',
          'street_address',
          'id_type',
          'id_number',
          'phone',
          'email',
        ] as const)
      : ([
          'first_name',
          'last_name',
          'dob',
          'street_address',
          'id_type',
          'id_number',
          'front_id',
          'phone',
          'email',
        ] as const)

    methods.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        goToNextStep()
      }
    })
  }, [methods, goToNextStep])

  const handleVendorDetailsSubmit = React.useCallback(
    async (data: any) => {
      try {
        // Get checkbox values from form
        const vendorNameSameAsCorporate = methods.getValues('use_corporate_info') || false
        const profileSameAsCorporate =
          methods.getValues('checkbox_profile_same_as_corporate') || false
        const vendorDetailsSameAsCorporate =
          methods.getValues('checkbox_vendor_details_same_as_corporate') || false

        // If all checkboxes are checked (same as corporate), send minimal payload
        if (vendorNameSameAsCorporate && profileSameAsCorporate && vendorDetailsSameAsCorporate) {
          const minimalPayload = {
            vendor_name_details: {
              use_corporate_info: true,
            },
            personal_details: {
              use_corporate_info: true,
            },
            business_details: {
              use_corporate_info: true,
            },
            business_documents: {
              use_corporate_info: true,
            },
          } as CreateVendorPayload

          // Call the API
          await createVendor(minimalPayload)

          handleCloseModal()
          return
        }

        // Otherwise, send full payload
        // Get corporate business details
        const corporateBusiness = corporateUser?.business_details?.[0]
        const corporateBusinessDocs = corporateUser?.business_documents || []

        // Handle ID images - use corporate ID images if same as corporate, otherwise upload new ones
        const idImages: { front?: string; back?: string } = {}
        if (
          profileSameAsCorporate &&
          corporateUser?.id_images &&
          corporateUser.id_images.length >= 2
        ) {
          // Use corporate ID images - ensure both front and back exist
          const frontImage =
            corporateUser.id_images.find((img) => img.file_url) || corporateUser.id_images[0]
          const backImage =
            corporateUser.id_images.find((img, idx) => idx > 0 && img.file_url) ||
            corporateUser.id_images[1]

          if (frontImage?.file_url) {
            idImages.front = frontImage.file_url
          }
          if (backImage?.file_url) {
            idImages.back = backImage.file_url
          }
        } else if (!profileSameAsCorporate) {
          // Upload new ID images only if not using corporate
          if (data.front_id) {
            const frontResponse = await uploadFiles([data.front_id])
            idImages.front = frontResponse[0]?.file_key || ''
          }
          // National ID / Passport: front only; back not uploaded
          if (data.back_id) {
            const backResponse = await uploadFiles([data.back_id])
            idImages.back = backResponse[0]?.file_key || ''
          }
        }

        // Handle business documents
        type DocumentType =
          | 'certificate_of_incorporation'
          | 'business_license'
          | 'articles_of_incorporation'
          | 'utility_bill'
          | 'logo'

        let businessFiles: Array<{
          type: string
          file_url: string
          file_name: string
        }> = []

        if (vendorDetailsSameAsCorporate && corporateBusinessDocs.length > 0) {
          businessFiles = corporateBusinessDocs.map((doc) => ({
            type: doc.type,
            file_url: doc.file_url,
            file_name: doc.file_name,
          }))
        } else {
          const documentTypes: Array<{ file: File; type: DocumentType }> = []
          if (data.certificate_of_incorporation) {
            documentTypes.push({
              file: data.certificate_of_incorporation,
              type: 'certificate_of_incorporation',
            })
          }
          if (data.business_license) {
            documentTypes.push({ file: data.business_license, type: 'business_license' })
          }
          if (data.articles_of_incorporation) {
            documentTypes.push({
              file: data.articles_of_incorporation,
              type: 'articles_of_incorporation',
            })
          }
          if (data.utility_bill) {
            documentTypes.push({ file: data.utility_bill, type: 'utility_bill' })
          }
          if (data.logo) {
            documentTypes.push({ file: data.logo, type: 'logo' })
          }

          const uploadPromises = documentTypes.map((doc) => uploadFiles([doc.file]))
          const documentResponses = await Promise.all(uploadPromises)

          businessFiles = documentResponses.map(
            (response: { file_name: string; file_key: string }[], index: number) => ({
              type: documentTypes[index].type,
              file_url: response[0]?.file_key || '',
              file_name: documentTypes[index].file.name,
            }),
          )
        }

        // Extract personal details
        const personalDetails =
          profileSameAsCorporate && corporateUser
            ? {
                first_name: corporateUser.fullname?.split(' ')[0] || '',
                last_name: corporateUser.fullname?.split(' ').slice(1).join(' ') || '',
                dob: corporateUser.dob || '',
                id_type: corporateUser.id_type || '',
                id_number: corporateUser.id_number || '',
                street_address: corporateUser.street_address || '',
              }
            : {
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                dob: data.dob || '',
                id_type: data.id_type || '',
                id_number: data.id_number || '',
                street_address: data.street_address || '',
              }

        // Extract phone and country info
        const phoneNumber = vendorDetailsSameAsCorporate
          ? corporateUser?.phonenumber || corporateBusiness?.phone || ''
          : data.phone || ''
        const phoneMatch = phoneNumber?.match(/^(\+\d{1,4})(.+)$/)
        const countryCode = phoneMatch ? phoneMatch[1] : '+233'
        const country = countries?.find((c) => c.code === countryCode)?.label || 'Ghana'

        // Build the payload
        const payload: CreateVendorPayload = {
          vendor_name_details: {
            use_corporate_info: vendorNameSameAsCorporate,
            vendor_name:
              vendorNameSameAsCorporate && corporateBusiness
                ? corporateBusiness.name
                : data.vendor_name,
          },
          personal_details: {
            use_corporate_info: profileSameAsCorporate,
            first_name: personalDetails.first_name,
            last_name: personalDetails.last_name,
            dob: personalDetails.dob,
            id_type: personalDetails.id_type,
            id_number: personalDetails.id_number,
            street_address: personalDetails.street_address,
            id_front_image_url: idImages.front || '',
            id_back_image_url: idImages.back || '',
          },
          business_details: {
            use_corporate_info: vendorDetailsSameAsCorporate,
            type:
              vendorDetailsSameAsCorporate && corporateBusiness
                ? corporateBusiness.type
                : data.type || 'llc',
            phone_number: phoneNumber,
            email:
              vendorDetailsSameAsCorporate && corporateBusiness
                ? corporateBusiness.email
                : data.email || '',
            street_address:
              vendorDetailsSameAsCorporate && corporateBusiness
                ? corporateBusiness.street_address
                : data.street_address || '',
            digital_address:
              vendorDetailsSameAsCorporate && corporateBusiness
                ? corporateBusiness.digital_address
                : data.digital_address || '',
            registration_number:
              vendorDetailsSameAsCorporate && corporateBusiness
                ? corporateBusiness.registration_number
                : data.registration_number || '',
            industry: vendorDetailsSameAsCorporate
              ? corporateUser?.business_industry ||
                corporateBusinessDocs[0]?.business_industry ||
                ''
              : data.business_industry || '',
            country: country,
            country_code: '01',
            employer_identification_number: vendorDetailsSameAsCorporate
              ? corporateUser?.employee_identification_number ||
                corporateBusinessDocs[0]?.employer_identification_number ||
                ''
              : data.employer_identification_number || '',
            logo: businessFiles.find((f) => f.type === 'logo')?.file_url || '',
          },
          business_documents: {
            use_corporate_info: vendorDetailsSameAsCorporate,
            employer_identification_number: vendorDetailsSameAsCorporate
              ? corporateUser?.employee_identification_number ||
                corporateBusinessDocs[0]?.employer_identification_number ||
                ''
              : data.employer_identification_number || '',
            business_industry: vendorDetailsSameAsCorporate
              ? corporateUser?.business_industry ||
                corporateBusinessDocs[0]?.business_industry ||
                ''
              : data.business_industry || '',
            files: businessFiles,
          },
        }

        // Call the API
        await createVendor(payload)

        handleCloseModal()
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to create vendor account. Please try again.',
        )
      }
    },
    [corporateUser, uploadFiles, countries, toast, handleCloseModal, methods],
  )

  return (
    <FormProvider {...methods}>
      <section
        className="rounded-2xl bg-white min-h-[760px]"
        style={{
          boxShadow: 'rgba(228, 232, 247, 0.4) 0px 0px 80px 0px',
          background:
            'url(https://builds.contra.com/dda4cd83/assets/static/gradient-background-4.Z9JWGgX2.webp) 21rem / contain no-repeat rgb(255, 255, 255)',
        }}
      >
        <div className="py-5 px-4">
          <button className="bg-[#f5f6f9] px-4 py-2 rounded-full text-[#373f51] text-sm font-semibold flex items-center gap-2">
            <Icon icon="bi:arrow-left" className="text-gray-600" /> Change Account Type
          </button>
        </div>

        <section className="flex justify-between items-center gap-6 mx-auto py-10 px-12 ">
          {step === 1 ? (
            <VendorNameForm onSubmit={handleStep1Complete} corporateUser={corporateUser} />
          ) : step === 2 ? (
            <VendorProfileForm
              onSubmit={handleProfileSubmit}
              onCancel={goToPreviousStep}
              corporateUser={corporateUser}
            />
          ) : (
            <VendorDetailsForm
              onSubmit={handleVendorDetailsSubmit}
              onCancel={goToPreviousStep}
              corporateUser={corporateUser}
            />
          )}
          <div className="py-8 px-6 mt-[120px] max-w-[480px] w-full rounded-2xl border border-[#e5e7eb] flex gap-4 h-fit bg-white">
            <div className="w-[90px] h-[90px] rounded-full bg-[#f2f4f7] flex items-center justify-center">
              <svg
                fill="none"
                focusable="false"
                height="32"
                role="img"
                strokeWidth="1"
                viewBox="0 0 24 24"
                width="32"
              >
                <path
                  d="M15 11.5C13.703 11.3162 12.6838 10.297 12.5 9H11.5C11.3162 10.297 10.297 11.3162 9 11.5V12.5C10.297 12.6838 11.3162 13.703 11.5 15H12.5C12.6838 13.703 13.703 12.6838 15 12.5V11.5Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.40627 2.3906C8.7772 1.8342 9.40166 1.5 10.0704 1.5H13.9296C14.5983 1.5 15.2228 1.8342 15.5937 2.3906L15.6133 2.41987C16.0968 3.14524 16.3386 3.50792 16.6522 3.77697C16.9839 4.0615 17.3738 4.27014 17.7945 4.38829C18.1923 4.5 18.6282 4.5 19.5 4.5C21.1569 4.5 22.5 5.84315 22.5 7.5V18C22.5 19.6569 21.1569 21 19.5 21H4.5C2.84315 21 1.5 19.6569 1.5 18V7.5C1.5 5.84315 2.84315 4.5 4.5 4.5C5.37178 4.5 5.80767 4.5 6.2055 4.38829C6.62623 4.27014 7.01608 4.0615 7.34776 3.77697C7.66139 3.50792 7.90318 3.14524 8.38675 2.41987L8.40627 2.3906ZM10.0704 3C9.90319 3 9.74708 3.08355 9.65434 3.22265L9.55173 3.37676C9.15147 3.97858 8.79931 4.50806 8.32442 4.91545C7.82689 5.34226 7.24212 5.65521 6.61102 5.83243C6.00863 6.00158 5.37274 6.00089 4.64997 6.00011L4.5 6C3.67157 6 3 6.67157 3 7.5V18C3 18.8284 3.67157 19.5 4.5 19.5H19.5C20.3284 19.5 21 18.8284 21 18V7.5C21 6.67157 20.3284 6 19.5 6L19.35 6.00011C18.6273 6.00089 17.9914 6.00159 17.389 5.83243C16.7579 5.65521 16.1731 5.34226 15.6756 4.91545C15.2007 4.50806 14.8485 3.97858 14.4483 3.37677L14.3457 3.22265C14.2529 3.08355 14.0968 3 13.9296 3H10.0704Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div className="flex flex-col gap-6 flex-1 w-full">
              <Text variant="h2" weight="semibold" className="text-[#9ba2b0]">
                Vendor Name
              </Text>
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="text-[#059669]" />
                  <div className="w-[40%] bg-[#f2f4f7] h-3 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="bi:check-circle-fill" className="text-[#059669]" />
                  <div className="w-[50%] bg-[#f2f4f7] h-3 rounded-full" />
                </div>
              </section>
              <section className="flex flex-col gap-2">
                <div className="w-full bg-[#f2f4f7] h-3 rounded-full" />
                <div className="w-[80%] bg-[#f2f4f7] h-3 rounded-full" />
              </section>
            </div>
          </div>
        </section>
      </section>
    </FormProvider>
  )
}
