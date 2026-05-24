import React from 'react'
import { Button, Input, Checkbox, Modal, Text, BasePhoneInput } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { EXAMPLE_PHONE_PLACEHOLDER, MODALS } from '@/utils/constants'
import {
  useRequestBranchDetailsUpdateModal,
  BRANCH_DETAILS_UPDATABLE_FIELDS,
  type BranchDetailsFieldKey,
} from '../hooks/useRequestBranchDetailsUpdateModal'
import { branchQueries } from '../hooks/useBranchQueries'
import type { BranchInfoResponse } from '../services'

export function RequestBranchDetailsUpdateModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST_BRANCH_DETAILS_UPDATE.PARAM_NAME,
  })
  const isOpen = modal.isModalOpen(MODALS.REQUEST_BRANCH_DETAILS_UPDATE.ROOT)
  const onClose = modal.closeModal

  const { useGetBranchInfoService } = branchQueries()
  const { data: branchInfoData } = useGetBranchInfoService()
  const branchInfo =
    (branchInfoData as { data?: BranchInfoResponse['data'] } | undefined)?.data ??
    (branchInfoData as BranchInfoResponse['data'] | undefined)

  const {
    branch,
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
  } = useRequestBranchDetailsUpdateModal(isOpen, onClose, branchInfo)

  if (!branch) return null

  const hasSelectedFields = (
    Object.entries(fieldsToUpdate) as [BranchDetailsFieldKey, boolean][]
  ).some(([, value]) => value)

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={handleSetIsOpen}
      showClose
      title="Request branch details update"
      panelClass="!w-[800px] p-0 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <header className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-5 pr-14">
        <h2 className="text-lg font-semibold text-gray-900">Request branch details update</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Select the branch fields you want to change. Your vendor admin and platform admin will
          review the request before changes are applied.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <section>
          <Text variant="span" weight="semibold" className="text-gray-900 mb-3 block">
            What would you like to update?
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {BRANCH_DETAILS_UPDATABLE_FIELDS.map(({ key, label }) => (
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

        {hasSelectedFields && (
          <section className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Proposed values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fieldsToUpdate.branch_name && (
                <Input
                  label="Branch name"
                  value={proposed.branch_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('branch_name', e.target.value)
                  }
                  placeholder="Enter new branch name"
                  className="sm:col-span-2"
                />
              )}
              {fieldsToUpdate.branch_location && (
                <Input
                  label="Branch location"
                  value={proposed.branch_location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('branch_location', e.target.value)
                  }
                  placeholder="Enter new branch location"
                  className="sm:col-span-2"
                />
              )}
              {fieldsToUpdate.branch_phone && (
                <div className="sm:col-span-2">
                  <BasePhoneInput
                    label="Branch phone"
                    placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                    options={phoneCountries}
                    handleChange={(value) => setProposedValue('branch_phone', value)}
                    selectedVal={proposed.branch_phone}
                  />
                </div>
              )}
              {fieldsToUpdate.branch_email && (
                <Input
                  label="Branch email"
                  type="email"
                  value={proposed.branch_email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProposedValue('branch_email', e.target.value)
                  }
                  placeholder="Enter new branch email"
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
            placeholder="e.g. Relocated branch, updated contact number"
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
