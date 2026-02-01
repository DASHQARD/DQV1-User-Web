import { useCallback, useEffect, useState } from 'react'
import { useUserProfile, useToast, useCountriesData, useUploadFiles } from '@/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export type FieldKey =
  | 'name'
  | 'type'
  | 'phone'
  | 'email'
  | 'street_address'
  | 'digital_address'
  | 'registration_number'
  | 'logo'

export const UPDATABLE_FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'name', label: 'Business name' },
  { key: 'type', label: 'Business type' },
  { key: 'phone', label: 'Phone number' },
  { key: 'email', label: 'Email' },
  { key: 'street_address', label: 'Street address' },
  { key: 'digital_address', label: 'Digital address' },
  { key: 'registration_number', label: 'Registration number' },
  { key: 'logo', label: 'Business logo' },
]

const INITIAL_FIELDS: Record<FieldKey, boolean> = {
  name: false,
  type: false,
  phone: false,
  email: false,
  street_address: false,
  digital_address: false,
  registration_number: false,
  logo: false,
}

const INITIAL_PROPOSED: Record<FieldKey, string | File | null> = {
  name: '',
  type: '',
  phone: '',
  email: '',
  street_address: '',
  digital_address: '',
  registration_number: '',
  logo: null,
}

export function useRequestBusinessUpdateModal(isOpen: boolean, onClose: () => void) {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { countries: phoneCountries } = useCountriesData()
  const toast = useToast()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { useRequestBusinessUpdateService } = corporateMutations()
  const { mutateAsync: requestBusinessUpdate } = useRequestBusinessUpdateService()

  const [isRequesting, setIsRequesting] = useState(false)
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Record<FieldKey, boolean>>(INITIAL_FIELDS)
  const [proposed, setProposed] = useState<Record<FieldKey, string | File | null>>(INITIAL_PROPOSED)
  const [reason, setReason] = useState('')

  const business = userProfileData?.business_details?.[0]

  const resetRequestForm = useCallback(() => {
    setFieldsToUpdate({ ...INITIAL_FIELDS })
    setProposed({ ...INITIAL_PROPOSED })
    setReason('')
  }, [])

  useEffect(() => {
    if (isOpen) resetRequestForm()
  }, [isOpen, resetRequestForm])

  const toggleField = useCallback(
    (key: FieldKey, checked: boolean) => {
      setFieldsToUpdate((prev) => ({ ...prev, [key]: checked }))
      if (checked && business) {
        const current = key === 'logo' ? null : ((business[key] as string) ?? '')
        setProposed((prev) => ({ ...prev, [key]: current }))
      } else {
        setProposed((prev) => ({ ...prev, [key]: key === 'logo' ? null : '' }))
      }
    },
    [business],
  )

  const setProposedValue = useCallback((key: FieldKey, value: string | File | null) => {
    setProposed((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleClose = useCallback(() => {
    resetRequestForm()
    onClose()
  }, [onClose, resetRequestForm])

  const handleSetIsOpen = useCallback(
    (o: boolean) => {
      if (!o) {
        resetRequestForm()
        onClose()
      }
    },
    [onClose, resetRequestForm],
  )

  const handleRequestUpdate = useCallback(async () => {
    const selected = (Object.entries(fieldsToUpdate) as [FieldKey, boolean][]).filter(([, v]) => v)
    if (selected.length === 0) {
      toast.error('Select at least one field you want to update.')
      return
    }

    for (const [key] of selected) {
      const val = proposed[key]
      if (key !== 'logo' && typeof val === 'string' && !val.trim()) {
        toast.error(
          `Please provide a value for ${UPDATABLE_FIELDS.find((f) => f.key === key)?.label}.`,
        )
        return
      }
      if (key === 'logo' && !val) {
        toast.error('Please upload a new logo.')
        return
      }
    }

    setIsRequesting(true)
    try {
      const fieldsToUpdatePayload: Record<string, boolean> = {}
      for (const [key] of selected) {
        fieldsToUpdatePayload[key] = true
      }

      const proposedValues: Record<string, string> = {}
      let logoFileUrl = ''

      if (fieldsToUpdate.logo && proposed.logo instanceof File) {
        const uploadResponse = await uploadFiles([proposed.logo])
        if (uploadResponse && uploadResponse.length > 0) {
          logoFileUrl = uploadResponse[0].file_key
        } else {
          toast.error('Failed to upload logo. Please try again.')
          setIsRequesting(false)
          return
        }
      }

      for (const [key] of selected) {
        if (key === 'logo') {
          proposedValues[key] = logoFileUrl
        } else {
          const val = proposed[key]
          proposedValues[key] = typeof val === 'string' ? val : ''
        }
      }

      await requestBusinessUpdate({
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
  }, [fieldsToUpdate, proposed, reason, toast, handleClose, uploadFiles, requestBusinessUpdate])

  return {
    business,
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
