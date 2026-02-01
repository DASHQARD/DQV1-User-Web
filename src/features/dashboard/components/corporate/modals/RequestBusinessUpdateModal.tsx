import React from 'react'
import { Button, Input, Checkbox, Modal } from '@/components'
import { BasePhoneInput, FileUploader } from '@/components'
import { Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { BUSINESS_TYPE_OPTIONS } from '@/utils/constants'
import {
  useRequestBusinessUpdateModal,
  UPDATABLE_FIELDS,
  type FieldKey,
} from '../hooks/useRequestBusinessUpdateModal'

export function RequestBusinessUpdateModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST_BUSINESS_UPDATE.PARAM_NAME,
  })
  const isOpen = modal.isModalOpen(MODALS.REQUEST_BUSINESS_UPDATE.ROOT)
  const onClose = modal.closeModal

  const {
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
  } = useRequestBusinessUpdateModal(isOpen, onClose)

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
                        {opt.title}
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
