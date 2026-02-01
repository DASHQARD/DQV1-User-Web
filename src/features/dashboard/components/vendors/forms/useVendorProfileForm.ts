import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useCountriesData } from '@/hooks'
import type { UserProfileResponse } from '@/types/user'

export function useVendorProfileForm(corporateUser?: UserProfileResponse | null) {
  const form = useFormContext()
  const { countries } = useCountriesData()

  const checkboxProfileSameAsCorporate = form.watch('checkbox_profile_same_as_corporate')
  const firstName = form.watch('first_name')
  const lastName = form.watch('last_name')
  const dob = form.watch('dob')
  const streetAddress = form.watch('street_address')
  const idType = form.watch('id_type')
  const idNumber = form.watch('id_number')
  const frontId = form.watch('front_id')
  const phone = form.watch('phone')
  const email = form.watch('email')

  useEffect(() => {
    const business = corporateUser?.business_details?.[0]
    if (checkboxProfileSameAsCorporate && corporateUser) {
      const nameParts = corporateUser.fullname?.split(' ') || []
      const firstNameValue = nameParts[0] || ''
      const lastNameValue = nameParts.slice(1).join(' ') || ''

      form.setValue('first_name', firstNameValue, { shouldValidate: false })
      form.setValue('last_name', lastNameValue, { shouldValidate: false })
      form.setValue('dob', corporateUser.dob || '', { shouldValidate: false })
      form.setValue('street_address', corporateUser.street_address || '', {
        shouldValidate: false,
      })
      form.setValue('id_type', corporateUser.id_type || '', { shouldValidate: false })
      form.setValue('id_number', corporateUser.id_number || '', { shouldValidate: false })
      form.setValue('phone', corporateUser.phonenumber || business?.phone || '', {
        shouldValidate: false,
      })
      form.setValue('email', business?.email || '', { shouldValidate: false })
    } else if (!checkboxProfileSameAsCorporate) {
      form.setValue('first_name', '', { shouldValidate: false })
      form.setValue('last_name', '', { shouldValidate: false })
      form.setValue('dob', '', { shouldValidate: false })
      form.setValue('street_address', '', { shouldValidate: false })
      form.setValue('id_type', '', { shouldValidate: false })
      form.setValue('id_number', '', { shouldValidate: false })
      form.setValue('front_id', undefined, { shouldValidate: false })
      form.setValue('back_id', undefined, { shouldValidate: false })
      form.setValue('phone', '', { shouldValidate: false })
      form.setValue('email', '', { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit form to avoid clearing fields on every keystroke when form ref changes
  }, [checkboxProfileSameAsCorporate, corporateUser])

  const isSubmitDisabled = useMemo(() => {
    const { formState } = form
    const hasFieldErrors =
      !!formState.errors.first_name ||
      !!formState.errors.last_name ||
      !!formState.errors.dob ||
      !!formState.errors.street_address ||
      !!formState.errors.id_type ||
      !!formState.errors.id_number ||
      !!formState.errors.phone ||
      !!formState.errors.email ||
      (!checkboxProfileSameAsCorporate && !!formState.errors.front_id)

    const missingRequired =
      !firstName ||
      !lastName ||
      !dob ||
      !streetAddress ||
      !idType ||
      !idNumber ||
      !phone ||
      !email ||
      (!checkboxProfileSameAsCorporate && !frontId)

    return missingRequired || hasFieldErrors
  }, [
    form,
    firstName,
    lastName,
    dob,
    streetAddress,
    idType,
    idNumber,
    phone,
    email,
    checkboxProfileSameAsCorporate,
    frontId,
  ])

  return {
    form,
    countries,
    checkboxProfileSameAsCorporate,
    isSubmitDisabled,
  }
}
