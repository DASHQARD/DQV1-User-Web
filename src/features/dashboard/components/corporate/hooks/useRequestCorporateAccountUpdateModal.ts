import { useCallback, useEffect, useState } from 'react'
import { useUserProfile, useToast, useCountriesData } from '@/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export type CorporateAccountFieldKey =
  | 'fullname'
  | 'email'
  | 'phonenumber'
  | 'country_code'
  | 'street_address'

export const CORPORATE_ACCOUNT_UPDATABLE_FIELDS: { key: CorporateAccountFieldKey; label: string }[] =
  [
    { key: 'fullname', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'phonenumber', label: 'Phone number' },
    { key: 'country_code', label: 'Country code' },
    { key: 'street_address', label: 'Street address' },
  ]

const INITIAL_FIELDS: Record<CorporateAccountFieldKey, boolean> = {
  fullname: false,
  email: false,
  phonenumber: false,
  country_code: false,
  street_address: false,
}

const INITIAL_PROPOSED: Record<CorporateAccountFieldKey, string> = {
  fullname: '',
  email: '',
  phonenumber: '',
  country_code: '',
  street_address: '',
}

function getProfileCountryCode(profile: Record<string, unknown> | undefined): string {
  if (!profile) return ''
  const code = profile.country_code
  return typeof code === 'string' ? code : ''
}

export function useRequestCorporateAccountUpdateModal(isOpen: boolean, onClose: () => void) {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { countries: phoneCountries } = useCountriesData()
  const toast = useToast()
  const { useRequestCorporateAccountUpdateService } = corporateMutations()
  const { mutateAsync: requestCorporateAccountUpdate } = useRequestCorporateAccountUpdateService()

  const [isRequesting, setIsRequesting] = useState(false)
  const [fieldsToUpdate, setFieldsToUpdate] =
    useState<Record<CorporateAccountFieldKey, boolean>>(INITIAL_FIELDS)
  const [proposed, setProposed] =
    useState<Record<CorporateAccountFieldKey, string>>(INITIAL_PROPOSED)
  const [reason, setReason] = useState('')

  const profile = userProfileData as Record<string, unknown> | undefined

  const resetRequestForm = useCallback(() => {
    setFieldsToUpdate({ ...INITIAL_FIELDS })
    setProposed({ ...INITIAL_PROPOSED })
    setReason('')
  }, [])

  useEffect(() => {
    if (isOpen) resetRequestForm()
  }, [isOpen, resetRequestForm])

  const toggleField = useCallback(
    (key: CorporateAccountFieldKey, checked: boolean) => {
      setFieldsToUpdate((prev) => ({ ...prev, [key]: checked }))
      if (checked && profile) {
        const currentByKey: Record<CorporateAccountFieldKey, string> = {
          fullname: String(profile.fullname ?? ''),
          email: String(profile.email ?? ''),
          phonenumber: String(profile.phonenumber ?? ''),
          country_code: getProfileCountryCode(profile),
          street_address: String(profile.street_address ?? ''),
        }
        setProposed((prev) => ({ ...prev, [key]: currentByKey[key] }))
      } else {
        setProposed((prev) => ({ ...prev, [key]: '' }))
      }
    },
    [profile],
  )

  const setProposedValue = useCallback((key: CorporateAccountFieldKey, value: string) => {
    setProposed((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleClose = useCallback(() => {
    resetRequestForm()
    onClose()
  }, [onClose, resetRequestForm])

  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        resetRequestForm()
        onClose()
      }
    },
    [onClose, resetRequestForm],
  )

  const handleRequestUpdate = useCallback(async () => {
    const selected = (
      Object.entries(fieldsToUpdate) as [CorporateAccountFieldKey, boolean][]
    ).filter(([, value]) => value)

    if (selected.length === 0) {
      toast.error('Select at least one field you want to update.')
      return
    }

    for (const [key] of selected) {
      if (!proposed[key]?.trim()) {
        toast.error(
          `Please provide a value for ${CORPORATE_ACCOUNT_UPDATABLE_FIELDS.find((f) => f.key === key)?.label}.`,
        )
        return
      }
    }

    if (reason.length > 1000) {
      toast.error('Reason for change must be 1000 characters or fewer.')
      return
    }

    setIsRequesting(true)
    try {
      const fieldsToUpdatePayload: Record<string, boolean> = {}
      const proposedValues: Record<string, string> = {}

      for (const [key] of selected) {
        fieldsToUpdatePayload[key] = true
        proposedValues[key] = proposed[key].trim()
      }

      await requestCorporateAccountUpdate({
        fields_to_update: fieldsToUpdatePayload,
        proposed_values: proposedValues,
        reason_for_change: reason.trim() || undefined,
      })

      handleClose()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to submit request. Please try again.'
      toast.error(message)
    } finally {
      setIsRequesting(false)
    }
  }, [fieldsToUpdate, proposed, reason, toast, handleClose, requestCorporateAccountUpdate])

  return {
    profile: userProfileData,
    isRequesting,
    fieldsToUpdate,
    proposed,
    reason,
    setReason,
    toggleField,
    setProposedValue,
    handleClose,
    handleSetIsOpen,
    handleRequestUpdate,
    phoneCountries,
  }
}
