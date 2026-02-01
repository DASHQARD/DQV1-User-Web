import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUploadFiles, useCountriesData, useToast } from '@/hooks'
import type { BusinessDocumentType } from '@/types'
import type { CreateVendorPayload } from '@/types/forms'
import type { UserProfileResponse } from '@/types/user'
import { CreateVendorFormSchema, type CreateVendorFormData } from '@/utils/schemas'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function useCreateVendorAccount({
  onClose,
  corporateUser,
}: {
  onClose: () => void
  corporateUser: UserProfileResponse | null
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)

  const methods = useForm<CreateVendorFormData>({
    resolver: zodResolver(CreateVendorFormSchema),
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
      type: 'llc',
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
    setStep((current) => (current < 3 ? ((current + 1) as 1 | 2 | 3) : current))
  }, [])

  const goToPreviousStep = React.useCallback(() => {
    setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3) : current))
  }, [])

  const handleStep1Complete = React.useCallback(() => {
    methods.trigger('vendor_name').then((isValid) => {
      if (isValid) goToNextStep()
    })
  }, [methods, goToNextStep])

  const handleProfileSubmit = React.useCallback(() => {
    const checkboxProfileSameAsCorporate = methods.getValues('checkbox_profile_same_as_corporate')
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
      if (isValid) goToNextStep()
    })
  }, [methods, goToNextStep])

  const handleVendorDetailsSubmit = React.useCallback(
    async (data: CreateVendorFormData) => {
      try {
        const vendorNameSameAsCorporate = methods.getValues('use_corporate_info') || false
        const profileSameAsCorporate =
          methods.getValues('checkbox_profile_same_as_corporate') || false
        const vendorDetailsSameAsCorporate =
          methods.getValues('checkbox_vendor_details_same_as_corporate') || false

        if (vendorNameSameAsCorporate && profileSameAsCorporate && vendorDetailsSameAsCorporate) {
          const minimalPayload = {
            vendor_name_details: { use_corporate_info: true },
            personal_details: { use_corporate_info: true },
            business_details: { use_corporate_info: true },
            business_documents: { use_corporate_info: true },
          } as CreateVendorPayload
          await createVendor(minimalPayload)
          handleCloseModal()
          return
        }

        const corporateBusiness = corporateUser?.business_details?.[0]
        const corporateBusinessDocs = corporateUser?.business_documents || []

        const idImages: { front?: string; back?: string } = {}
        if (
          profileSameAsCorporate &&
          corporateUser?.id_images &&
          corporateUser.id_images.length >= 2
        ) {
          const frontImage =
            corporateUser.id_images.find((img) => img.file_url) || corporateUser.id_images[0]
          const backImage =
            corporateUser.id_images.find((img, idx) => idx > 0 && img.file_url) ||
            corporateUser.id_images[1]
          if (frontImage?.file_url) idImages.front = frontImage.file_url
          if (backImage?.file_url) idImages.back = backImage.file_url
        } else if (!profileSameAsCorporate) {
          if (data.front_id) {
            const frontResponse = await uploadFiles([data.front_id])
            idImages.front = frontResponse[0]?.file_key || ''
          }
          if (data.back_id) {
            const backResponse = await uploadFiles([data.back_id])
            idImages.back = backResponse[0]?.file_key || ''
          }
        }

        let businessFiles: Array<{ type: string; file_url: string; file_name: string }> = []
        if (vendorDetailsSameAsCorporate && corporateBusinessDocs.length > 0) {
          businessFiles = corporateBusinessDocs.map((doc) => ({
            type: doc.type,
            file_url: doc.file_url,
            file_name: doc.file_name,
          }))
        } else {
          const documentTypes: Array<{ file: File; type: BusinessDocumentType }> = []
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

        const phoneNumber = vendorDetailsSameAsCorporate
          ? corporateUser?.phonenumber || corporateBusiness?.phone || ''
          : data.phone || ''
        const phoneMatch = phoneNumber?.match(/^(\+\d{1,4})(.+)$/)
        const countryCode = phoneMatch ? phoneMatch[1] : '+233'
        const country = countries?.find((c) => c.code === countryCode)?.label || 'Ghana'

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
            country,
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

        await createVendor(payload)
        handleCloseModal()
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string }; message?: string }
          message?: string
        }
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to create vendor account. Please try again.',
        )
      }
    },
    [corporateUser, createVendor, uploadFiles, countries, toast, handleCloseModal, methods],
  )

  return {
    step,
    methods,
    handleCloseModal,
    goToNextStep,
    goToPreviousStep,
    handleStep1Complete,
    handleProfileSubmit,
    handleVendorDetailsSubmit,
  }
}
