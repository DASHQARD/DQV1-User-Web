import React from 'react'
import { Button, Input, Checkbox, Modal } from '@/components'
import { BasePhoneInput, FileUploader } from '@/components'
import { Text } from '@/components'
import { useUserProfile, useToast, useCountriesData, useUploadFiles } from '@/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

const BUSINESS_TYPE_OPTIONS = [
  { value: 'llc', label: 'Limited Liability Company' },
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
] as const

type FieldKey =
  | 'name'
  | 'type'
  | 'phone'
  | 'email'
  | 'street_address'
  | 'digital_address'
  | 'registration_number'
  | 'logo'

const UPDATABLE_FIELDS: { key: FieldKey; label: string }[] = [
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

type Props = Readonly<{
  isOpen: boolean
  onClose: () => void
}>

export function RequestBusinessUpdateModal({ isOpen, onClose }: Props) {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { countries: phoneCountries } = useCountriesData()
  const toast = useToast()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { useRequestBusinessUpdateService } = corporateMutations()
  const { mutateAsync: requestBusinessUpdate } = useRequestBusinessUpdateService()

  const [isRequesting, setIsRequesting] = React.useState(false)
  const [fieldsToUpdate, setFieldsToUpdate] =
    React.useState<Record<FieldKey, boolean>>(INITIAL_FIELDS)
  const [proposed, setProposed] =
    React.useState<Record<FieldKey, string | File | null>>(INITIAL_PROPOSED)
  const [reason, setReason] = React.useState('')

  const business = userProfileData?.business_details?.[0]

  const resetRequestForm = React.useCallback(() => {
    setFieldsToUpdate({ ...INITIAL_FIELDS })
    setProposed({ ...INITIAL_PROPOSED })
    setReason('')
  }, [])

  React.useEffect(() => {
    if (isOpen) resetRequestForm()
  }, [isOpen, resetRequestForm])

  const toggleField = React.useCallback(
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

  const setProposedValue = React.useCallback((key: FieldKey, value: string | File | null) => {
    setProposed((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleClose = React.useCallback(() => {
    resetRequestForm()
    onClose()
  }, [onClose, resetRequestForm])

  const handleSetIsOpen = React.useCallback(
    (o: boolean) => {
      if (!o) {
        resetRequestForm()
        onClose()
      }
    },
    [onClose, resetRequestForm],
  )

  const handleRequestUpdate = React.useCallback(async () => {
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
      // Build fields_to_update object
      const fieldsToUpdatePayload: Record<string, boolean> = {}
      for (const [key] of selected) {
        fieldsToUpdatePayload[key] = true
      }

      // Build proposed_values object
      const proposedValues: Record<string, string> = {}
      let logoFileUrl = ''

      // Upload logo first if it's selected
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

      // Build proposed_values with string values
      for (const [key] of selected) {
        if (key === 'logo') {
          proposedValues[key] = logoFileUrl
        } else {
          const val = proposed[key]
          proposedValues[key] = typeof val === 'string' ? val : ''
        }
      }

      // Call the API
      await requestBusinessUpdate({
        fields_to_update: fieldsToUpdatePayload,
        proposed_values: proposedValues,
        reason_for_change: reason.trim() || undefined,
      })

      handleClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit request. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }, [fieldsToUpdate, proposed, reason, toast, handleClose, uploadFiles, requestBusinessUpdate])

  if (!business) return null

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={handleSetIsOpen}
      showClose
      title="Request business information update"
      panelClass="!w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <header className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-5 pr-14">
        <h2 className="text-lg font-semibold text-gray-900">Request business information update</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Select the fields you want to change and provide the new values. An admin will review your
          request.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <section>
          <Text variant="span" weight="semibold" className="text-gray-900 mb-3 block">
            What would you like to update?
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3">
            {UPDATABLE_FIELDS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center rounded-lg py-2 -mx-1 px-1 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={fieldsToUpdate[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    toggleField(key, e.target.checked)
                  }
                  label={label}
                />
              </div>
            ))}
          </div>
        </section>

        {(Object.entries(fieldsToUpdate) as [FieldKey, boolean][]).some(([, v]) => v) && (
          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Proposed values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fieldsToUpdate.name && (
                <Input
                  label="Business name"
                  value={(proposed.name as string) ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('name', e.target.value)
                  }
                  placeholder="Enter new business name"
                />
              )}
              {fieldsToUpdate.type && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#151819] text-sm font-medium">Business type</label>
                  <select
                    value={(proposed.type as string) ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setProposedValue('type', e.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select type</option>
                    {BUSINESS_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {fieldsToUpdate.phone && (
                <div className="sm:col-span-2">
                  <BasePhoneInput
                    label="Phone number"
                    placeholder="e.g. 5512345678"
                    options={phoneCountries}
                    maxLength={14}
                    handleChange={(v) => setProposedValue('phone', v)}
                    selectedVal={(proposed.phone as string) ?? ''}
                  />
                </div>
              )}
              {fieldsToUpdate.email && (
                <Input
                  label="Email"
                  type="email"
                  value={(proposed.email as string) ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('email', e.target.value)
                  }
                  placeholder="Enter new email"
                />
              )}
              {fieldsToUpdate.street_address && (
                <Input
                  label="Street address"
                  value={(proposed.street_address as string) ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('street_address', e.target.value)
                  }
                  placeholder="Enter new street address"
                  className="sm:col-span-2"
                />
              )}
              {fieldsToUpdate.digital_address && (
                <Input
                  label="Digital address"
                  value={(proposed.digital_address as string) ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('digital_address', e.target.value)
                  }
                  placeholder="Enter new digital address"
                />
              )}
              {fieldsToUpdate.registration_number && (
                <Input
                  label="Registration number"
                  value={(proposed.registration_number as string) ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('registration_number', e.target.value)
                  }
                  placeholder="Enter new registration number"
                />
              )}
              {fieldsToUpdate.logo && (
                <div className="sm:col-span-2">
                  <FileUploader
                    label="New business logo"
                    value={proposed.logo as File | null}
                    onChange={(f) => setProposedValue('logo', f)}
                    accept="image/*"
                    formatHint="Format: .jpeg, .png. Max 25MB."
                    id="request-logo"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <Input
            type="textarea"
            label="Reason for change"
            labelChild={<span className="font-normal text-gray-400">(optional)</span>}
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setReason(e.target.value)
            }
            placeholder="e.g. Legal name change, address correction, new logo"
            rows={3}
            innerClassName="min-h-[88px]"
            inputClassName="resize-none py-2"
          />
        </section>
      </div>

      <footer className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleRequestUpdate}
          loading={isRequesting}
        >
          Submit request
        </Button>
      </footer>
    </Modal>
  )
}
