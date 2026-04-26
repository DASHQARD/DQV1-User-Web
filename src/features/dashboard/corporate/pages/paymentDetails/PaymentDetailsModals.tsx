import type { Dispatch, SetStateAction } from 'react'
import { BasePhoneInput, Button, Combobox, Input, Modal, Text } from '@/components'
import { MOBILE_MONEY_PROVIDERS } from '@/utils/constants'

type PaymentForm = {
  payment_method: string
  mobile_money_provider: string
  mobile_money_number: string
  bank_name: string
  branch: string
  account_name: string
  account_number: string
  swift_code: string
  sort_code: string
}

type PaymentDetailsModalsProps = {
  countries: any[]
  formatFieldLabel: (value: string) => string
  isAddModalOpen: boolean
  setIsAddModalOpen: (isOpen: boolean) => void
  addForm: PaymentForm
  setAddForm: Dispatch<SetStateAction<PaymentForm>>
  handleSubmitAddPaymentDetails: () => void
  isAdding: boolean
  isEditModalOpen: boolean
  setIsEditModalOpen: (isOpen: boolean) => void
  editForm: PaymentForm
  setEditForm: Dispatch<SetStateAction<PaymentForm>>
  handleSubmitEditPaymentDetails: () => void
  isUpdating: boolean
  isDeleteAllModalOpen: boolean
  setIsDeleteAllModalOpen: (isOpen: boolean) => void
  handleDeleteAll: () => void
  isDeleting: boolean
}

export function PaymentDetailsModals({
  countries,
  formatFieldLabel,
  isAddModalOpen,
  setIsAddModalOpen,
  addForm,
  setAddForm,
  handleSubmitAddPaymentDetails,
  isAdding,
  isEditModalOpen,
  setIsEditModalOpen,
  editForm,
  setEditForm,
  handleSubmitEditPaymentDetails,
  isUpdating,
  isDeleteAllModalOpen,
  setIsDeleteAllModalOpen,
  handleDeleteAll,
  isDeleting,
}: PaymentDetailsModalsProps) {
  return (
    <>
      <Modal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        panelClass="!max-w-2xl"
        position="center"
      >
        <div className="p-6 space-y-4">
          <Text variant="h3" weight="semibold">
            Add Payment Details
          </Text>
          <div>
            <label className="text-sm font-medium block mb-1">Payment Method</label>
            <select
              value={addForm.payment_method}
              onChange={(e: any) =>
                setAddForm((prev) => ({ ...prev, payment_method: e.target.value }))
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          {addForm.payment_method === 'mobile_money' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Combobox
                label={formatFieldLabel('mobile_money_provider')}
                options={[...MOBILE_MONEY_PROVIDERS]}
                value={addForm.mobile_money_provider}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  const value = ev?.target?.value ?? ev?.value ?? ''
                  setAddForm((prev) => ({ ...prev, mobile_money_provider: value }))
                }}
                placeholder="Select provider"
              />
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={countries}
                selectedVal={addForm.mobile_money_number}
                handleChange={(value) =>
                  setAddForm((prev) => ({ ...prev, mobile_money_number: value || '' }))
                }
                label={formatFieldLabel('mobile_money_number')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={formatFieldLabel('bank_name')}
                value={addForm.bank_name}
                onChange={(e: any) =>
                  setAddForm((prev) => ({ ...prev, bank_name: e.target.value }))
                }
              />
              <Input
                label="branch"
                value={addForm.branch}
                onChange={(e: any) => setAddForm((prev) => ({ ...prev, branch: e.target.value }))}
              />
              <Input
                label={formatFieldLabel('account_name')}
                value={addForm.account_name}
                onChange={(e: any) =>
                  setAddForm((prev) => ({ ...prev, account_name: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('account_number')}
                value={addForm.account_number}
                onChange={(e: any) =>
                  setAddForm((prev) => ({ ...prev, account_number: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('swift_code')}
                value={addForm.swift_code}
                onChange={(e: any) =>
                  setAddForm((prev) => ({ ...prev, swift_code: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('sort_code')}
                value={addForm.sort_code}
                onChange={(e: any) =>
                  setAddForm((prev) => ({ ...prev, sort_code: e.target.value }))
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSubmitAddPaymentDetails} loading={isAdding}>
              Save Payment Details
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        panelClass="!max-w-2xl"
        position="center"
      >
        <div className="p-6 space-y-4">
          <Text variant="h3" weight="semibold">
            Update Payment Details
          </Text>
          <div>
            <label className="text-sm font-medium block mb-1">Payment Method</label>
            <select
              value={editForm.payment_method}
              onChange={(e: any) =>
                setEditForm((prev) => ({ ...prev, payment_method: e.target.value }))
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          {editForm.payment_method === 'mobile_money' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Combobox
                label={formatFieldLabel('mobile_money_provider')}
                options={[...MOBILE_MONEY_PROVIDERS]}
                value={editForm.mobile_money_provider}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  const value = ev?.target?.value ?? ev?.value ?? ''
                  setEditForm((prev) => ({ ...prev, mobile_money_provider: value }))
                }}
                placeholder="Select provider"
              />
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={countries}
                selectedVal={editForm.mobile_money_number}
                handleChange={(value) =>
                  setEditForm((prev) => ({ ...prev, mobile_money_number: value || '' }))
                }
                label={formatFieldLabel('mobile_money_number')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={formatFieldLabel('bank_name')}
                value={editForm.bank_name}
                onChange={(e: any) =>
                  setEditForm((prev) => ({ ...prev, bank_name: e.target.value }))
                }
              />
              <Input
                label="Branch"
                value={editForm.branch}
                onChange={(e: any) => setEditForm((prev) => ({ ...prev, branch: e.target.value }))}
              />
              <Input
                label={formatFieldLabel('account_name')}
                value={editForm.account_name}
                onChange={(e: any) =>
                  setEditForm((prev) => ({ ...prev, account_name: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('account_number')}
                value={editForm.account_number}
                onChange={(e: any) =>
                  setEditForm((prev) => ({ ...prev, account_number: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('swift_code')}
                value={editForm.swift_code}
                onChange={(e: any) =>
                  setEditForm((prev) => ({ ...prev, swift_code: e.target.value }))
                }
              />
              <Input
                label={formatFieldLabel('sort_code')}
                value={editForm.sort_code}
                onChange={(e: any) =>
                  setEditForm((prev) => ({ ...prev, sort_code: e.target.value }))
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleSubmitEditPaymentDetails}
              loading={isUpdating}
            >
              Update Payment Details
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteAllModalOpen}
        setIsOpen={setIsDeleteAllModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <div className="p-6 space-y-4">
          <Text variant="h3" weight="semibold">
            Delete All Payment Methods
          </Text>
          <Text variant="span" className="text-sm text-gray-600 block">
            Are you sure you want to delete all payment details for this account? This removes both
            mobile money and bank accounts.
          </Text>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteAllModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAll} loading={isDeleting}>
              Yes, Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
