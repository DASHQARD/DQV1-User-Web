import { useCallback, useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import { getAssignToSelfContactPrefill } from '@/features/website/utils/assignToSelfContactPrefill'
import { splitPersonName } from '@/utils/personName'
import type { RecipientFieldNames } from './recipientFieldNames'
import { STANDARD_RECIPIENT_FIELDS } from './recipientFieldNames'

type UserProfileShape = {
  fullname?: string
  email?: string
  phonenumber?: string
} | null

type Options = {
  setValue: UseFormSetValue<any>
  isGuestAuth: boolean
  isLocalGuest?: boolean
  user: Record<string, unknown> | null
  userProfileData: UserProfileShape
  initialAssignToSelf?: boolean
  fieldNames?: RecipientFieldNames
}

export function useAssignToSelfToggle(options: Options) {
  const {
    setValue,
    isGuestAuth,
    isLocalGuest = false,
    user,
    userProfileData,
    initialAssignToSelf = true,
    fieldNames = STANDARD_RECIPIENT_FIELDS,
  } = options

  const [assignToSelf, setAssignToSelf] = useState(initialAssignToSelf)
  const usesAccountAssignToSelf = assignToSelf && !isLocalGuest

  const applyContactPrefill = useCallback(() => {
    const contact = getAssignToSelfContactPrefill({
      isGuestAuth,
      isLocalGuest,
      user,
      userProfileData,
    })
    const { first_name, last_name } = splitPersonName(contact.name)
    setValue(fieldNames.firstName, first_name)
    setValue(fieldNames.lastName, last_name)
    setValue(fieldNames.email, contact.email)
    setValue(fieldNames.phone, contact.phone || '')
  }, [fieldNames, isGuestAuth, isLocalGuest, setValue, user, userProfileData])

  const clearRecipientFields = useCallback(() => {
    setValue(fieldNames.firstName, '')
    setValue(fieldNames.lastName, '')
    setValue(fieldNames.email, '')
    setValue(fieldNames.phone, '')
  }, [fieldNames, setValue])

  const handleAssignToSelf = useCallback(() => {
    const newValue = !assignToSelf
    setAssignToSelf(newValue)
    setValue(fieldNames.assignToSelf, newValue)
    if (newValue) {
      applyContactPrefill()
    } else {
      clearRecipientFields()
    }
  }, [
    applyContactPrefill,
    assignToSelf,
    clearRecipientFields,
    fieldNames.assignToSelf,
    setValue,
  ])

  const syncAssignToSelf = useCallback(
    (value: boolean) => {
      setAssignToSelf(value)
      setValue(fieldNames.assignToSelf, value)
    },
    [fieldNames.assignToSelf, setValue],
  )

  return {
    assignToSelf,
    setAssignToSelf,
    usesAccountAssignToSelf,
    handleAssignToSelf,
    applyContactPrefill,
    clearRecipientFields,
    syncAssignToSelf,
  }
}
