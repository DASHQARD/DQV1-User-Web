import React from 'react'
import { Button, Input, Checkbox, Modal, Text, BasePhoneInput, Combobox } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { EXAMPLE_PHONE_LOCAL, MODALS } from '@/utils/constants'
import {
  useRequestCorporateAccountUpdateModal,
  CORPORATE_ACCOUNT_UPDATABLE_FIELDS,
  type CorporateAccountFieldKey,
} from '../hooks/useRequestCorporateAccountUpdateModal'

export function RequestCorporateAccountUpdateModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST_CORPORATE_ACCOUNT_UPDATE.PARAM_NAME,
  })
  const isOpen = modal.isModalOpen(MODALS.REQUEST_CORPORATE_ACCOUNT_UPDATE.ROOT)
  const onClose = modal.closeModal

  const {
    profile,
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
  } = useRequestCorporateAccountUpdateModal(isOpen, onClose)

  if (!profile) return null

  const countryOptions = phoneCountries.map((country) => ({
    label: `${country.label} (${country.countryCode})`,
    value: country.countryCode,
  }))

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={handleSetIsOpen}
      showClose
      title="Request account update"
      panelClass="!w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <header className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-5 pr-14">
        <h2 className="text-lg font-semibold text-gray-900">Request corporate account update</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Select the account fields you want to change and provide the new values. A platform admin
          will review your request before changes are applied.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <section>
          <Text variant="span" weight="semibold" className="text-gray-900 mb-3 block">
            What would you like to update?
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {CORPORATE_ACCOUNT_UPDATABLE_FIELDS.map(({ key, label }) => (
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

        {(Object.entries(fieldsToUpdate) as [CorporateAccountFieldKey, boolean][]).some(
          ([, value]) => value,
        ) && (
          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Proposed values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fieldsToUpdate.fullname && (
                <Input
                  label="Full name"
                  value={proposed.fullname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('fullname', e.target.value)
                  }
                  placeholder="Enter new full name"
                  className="sm:col-span-2"
                />
              )}
              {fieldsToUpdate.email && (
                <Input
                  label="Email"
                  type="email"
                  value={proposed.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('email', e.target.value)
                  }
                  placeholder="Enter new email"
                  className="sm:col-span-2"
                />
              )}
              {fieldsToUpdate.phonenumber && (
                <div className="sm:col-span-2">
                  <BasePhoneInput
                    label="Phone number"
                    placeholder={`e.g. ${EXAMPLE_PHONE_LOCAL}`}
                    options={phoneCountries}
                    handleChange={(value) => setProposedValue('phonenumber', value)}
                    selectedVal={proposed.phonenumber}
                  />
                </div>
              )}
              {fieldsToUpdate.country_code && (
                <Combobox
                  label="Country code"
                  options={countryOptions}
                  value={proposed.country_code}
                  onChange={(e: unknown) => {
                    const ev = e as { target?: { value?: string }; value?: string }
                    const value = ev?.target?.value ?? ev?.value ?? ''
                    setProposedValue('country_code', value)
                  }}
                  placeholder="Select country"
                  isSearchable
                />
              )}
              {fieldsToUpdate.street_address && (
                <Input
                  label="Street address"
                  value={proposed.street_address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('street_address', e.target.value)
                  }
                  placeholder="Enter new street address"
                  className="sm:col-span-2"
                />
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
            placeholder="e.g. Legal entity rename, new HQ address, updated contact email"
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
