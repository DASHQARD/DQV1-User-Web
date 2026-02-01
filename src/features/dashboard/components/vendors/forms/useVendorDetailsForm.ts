import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { UserProfileResponse } from '@/types/user'

export function useVendorDetailsForm(corporateUser?: UserProfileResponse | null) {
  const form = useFormContext()

  const checkboxVendorDetailsSameAsCorporate = form.watch(
    'checkbox_vendor_details_same_as_corporate',
  )
  const type = form.watch('type')
  const streetAddress = form.watch('street_address')
  const digitalAddress = form.watch('digital_address')
  const registrationNumber = form.watch('registration_number')
  const employerIdentificationNumber = form.watch('employer_identification_number')
  const businessIndustry = form.watch('business_industry')
  const phone = form.watch('phone')
  const email = form.watch('email')
  const logo = form.watch('logo')
  const certificateOfIncorporation = form.watch('certificate_of_incorporation')
  const businessLicense = form.watch('business_license')

  useEffect(() => {
    if (checkboxVendorDetailsSameAsCorporate && corporateUser?.business_details?.[0]) {
      const business = corporateUser.business_details[0]

      form.setValue('type', (business.type as 'llc' | 'sole_proprietor' | 'partnership') || 'llc', {
        shouldValidate: true,
      })
      form.setValue('phone', corporateUser?.phonenumber || '', { shouldValidate: true })
      form.setValue('email', business.email || '', { shouldValidate: true })
      form.setValue('street_address', business.street_address || '', { shouldValidate: true })
      form.setValue('digital_address', business.digital_address || '', { shouldValidate: true })
      form.setValue('registration_number', business.registration_number || '', {
        shouldValidate: true,
      })
      form.setValue(
        'employer_identification_number',
        corporateUser?.employee_identification_number || '',
        {
          shouldValidate: true,
        },
      )
      form.setValue('business_industry', corporateUser?.business_industry || '', {
        shouldValidate: true,
      })
    } else if (!checkboxVendorDetailsSameAsCorporate) {
      form.setValue('type', 'llc', { shouldValidate: false })
      form.setValue('street_address', '', { shouldValidate: false })
      form.setValue('digital_address', '', { shouldValidate: false })
      form.setValue('registration_number', '', { shouldValidate: false })
      form.setValue('employer_identification_number', '', { shouldValidate: false })
      form.setValue('business_industry', '', { shouldValidate: false })
      form.setValue('logo', null, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit form to avoid loop: form ref changes when provider re-renders
  }, [checkboxVendorDetailsSameAsCorporate, corporateUser])

  const isSubmitDisabled = useMemo(() => {
    const { formState } = form
    const hasDocErrors =
      !!formState.errors.logo ||
      !!formState.errors.certificate_of_incorporation ||
      !!formState.errors.business_license
    const hasDocs = !!(logo && certificateOfIncorporation && businessLicense)
    const hasFieldErrors =
      !!formState.errors.type ||
      !!formState.errors.phone ||
      !!formState.errors.email ||
      !!formState.errors.street_address ||
      !!formState.errors.digital_address ||
      !!formState.errors.registration_number ||
      !!formState.errors.employer_identification_number ||
      !!formState.errors.business_industry

    const missingRequired =
      !type ||
      !phone ||
      !email ||
      !streetAddress ||
      !digitalAddress ||
      !registrationNumber ||
      !employerIdentificationNumber ||
      !businessIndustry

    const missingDocsWhenNotSameAsCorporate =
      !checkboxVendorDetailsSameAsCorporate && (!hasDocs || hasDocErrors)

    return (
      missingRequired ||
      missingDocsWhenNotSameAsCorporate ||
      (!checkboxVendorDetailsSameAsCorporate && !hasDocs) ||
      hasFieldErrors
    )
  }, [
    form,
    type,
    phone,
    email,
    streetAddress,
    digitalAddress,
    registrationNumber,
    employerIdentificationNumber,
    businessIndustry,
    checkboxVendorDetailsSameAsCorporate,
    logo,
    certificateOfIncorporation,
    businessLicense,
  ])

  return {
    form,
    checkboxVendorDetailsSameAsCorporate,
    type,
    streetAddress,
    digitalAddress,
    registrationNumber,
    employerIdentificationNumber,
    businessIndustry,
    phone,
    email,
    isSubmitDisabled,
  }
}
