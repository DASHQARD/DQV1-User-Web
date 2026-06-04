import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useCountriesData } from '@/hooks'
import type { UserProfileResponse } from '@/types/user'

const PROFILE_FIELD_NAMES = [
  'first_name',
  'last_name',
  'dob',
  'street_address',
  'id_type',
  'id_number',
  'phone',
  'email',
] as const

/** RHF treats `disabled` registered inputs as undefined — use readOnly on Input inner box only. */
export const VENDOR_PROFILE_LOCKED_INNER_CLASS =
  'text-gray-400 bg-[#f3f3f4] cursor-not-allowed'

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
  const backId = form.watch('back_id')
  const isPassport = idType === 'passport'
  const isNationalId = idType === 'national_id'
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
      form.clearErrors([...PROFILE_FIELD_NAMES])
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

  useEffect(() => {
    if (isPassport) {
      const currentBackId = form.getValues('back_id')
      if (currentBackId) {
        form.setValue('back_id', undefined, { shouldValidate: false })
        form.clearErrors('back_id')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit form to avoid clearing on every keystroke
  }, [isPassport])

  const isSubmitDisabled = useMemo(() => {
    const { formState } = form

    if (checkboxProfileSameAsCorporate) {
      const business = corporateUser?.business_details?.[0]
      const hasCorporateProfile = Boolean(
        corporateUser?.fullname?.trim() &&
          corporateUser?.street_address?.trim() &&
          corporateUser?.dob?.trim() &&
          corporateUser?.id_type?.trim() &&
          corporateUser?.id_number?.trim() &&
          (corporateUser?.phonenumber?.trim() || business?.phone?.trim()) &&
          business?.email?.trim(),
      )
      const hasStaleErrors = PROFILE_FIELD_NAMES.some(
        (name) => !!formState.errors[name],
      )
      return !hasCorporateProfile || hasStaleErrors
    }

    const hasFieldErrors =
      !!formState.errors.first_name ||
      !!formState.errors.last_name ||
      !!formState.errors.dob ||
      !!formState.errors.street_address ||
      !!formState.errors.id_type ||
      !!formState.errors.id_number ||
      !!formState.errors.phone ||
      !!formState.errors.email ||
      !!formState.errors.front_id ||
      (isNationalId && !!formState.errors.back_id)

    const missingRequired =
      !firstName ||
      !lastName ||
      !dob ||
      !streetAddress ||
      !idType ||
      !idNumber ||
      !phone ||
      !email ||
      !frontId ||
      (isNationalId && !backId)

    return missingRequired || hasFieldErrors
  }, [
    form,
    corporateUser,
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
    backId,
    isNationalId,
  ])

  return {
    form,
    countries,
    checkboxProfileSameAsCorporate,
    isSubmitDisabled,
    isPassport,
    isNationalId,
  }
}
