import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from 'react'
import { BasePhoneInput, Button, Input, Modal, Text } from '@/components'
import { Select } from '@/components/Select'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { EXAMPLE_PHONE_PLACEHOLDER, MOBILE_MONEY_PROVIDERS } from '@/utils/constants'

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

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank Account', value: 'bank' },
] as const

type PaymentFormFieldsProps = {
  form: PaymentForm
  setForm: Dispatch<SetStateAction<PaymentForm>>
  countries: any[]
  formatFieldLabel: (value: string) => string
}

function PaymentFormFields({ form, setForm, countries, formatFieldLabel }: PaymentFormFieldsProps) {
  const updateField = <K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Payment Method"
        placeholder="Select payment method"
        options={[...PAYMENT_METHOD_OPTIONS]}
        value={form.payment_method}
        onValueChange={(value: string) => updateField('payment_method', value)}
      />

      {form.payment_method === 'mobile_money' ? (
        <div className="rounded-xl border border-[#e8eaef] bg-[#faf9fc] p-5 space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#402D87]/10">
              <Icon icon="bi:phone" className="text-base text-[#402D87]" />
            </span>
            <Text variant="span" className="text-sm text-gray-600 leading-relaxed">
              Enter the mobile money account where you would like to receive vendor payouts.
            </Text>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Mobile Money Provider"
              placeholder="Select provider"
              options={[...MOBILE_MONEY_PROVIDERS]}
              value={form.mobile_money_provider}
              onValueChange={(value: string) => updateField('mobile_money_provider', value)}
            />
            <BasePhoneInput
              placeholder={EXAMPLE_PHONE_PLACEHOLDER}
              options={countries}
              selectedVal={form.mobile_money_number}
              handleChange={(value) => updateField('mobile_money_number', value || '')}
              label="Mobile Money Number"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#e8eaef] bg-[#faf9fc] p-5 space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#402D87]/10">
              <Icon icon="bi:bank" className="text-base text-[#402D87]" />
            </span>
            <Text variant="span" className="text-sm text-gray-600 leading-relaxed">
              Enter your bank account details for receiving vendor payouts.
            </Text>
          </div>
          <div className="space-y-4">
            <Input
              label={formatFieldLabel('bank_name')}
              placeholder="e.g. GCB Bank"
              value={form.bank_name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('bank_name', e.target.value)
              }
            />
            <Input
              label={formatFieldLabel('account_number')}
              placeholder="Enter account number"
              value={form.account_number}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField('account_number', e.target.value)
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Branch"
                placeholder="Branch name"
                value={form.branch}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('branch', e.target.value)
                }
              />
              <Input
                label={formatFieldLabel('account_name')}
                placeholder="Account holder name"
                value={form.account_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('account_name', e.target.value)
                }
              />
              <Input
                label={formatFieldLabel('swift_code')}
                placeholder="SWIFT / BIC"
                value={form.swift_code}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('swift_code', e.target.value)
                }
              />
              <Input
                label={formatFieldLabel('sort_code')}
                placeholder="Sort code"
                value={form.sort_code}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateField('sort_code', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type PaymentModalShellProps = {
  title: string
  description: string
  children: ReactNode
  onCancel: () => void
  onSubmit: () => void
  submitLabel: string
  isLoading: boolean
}

function PaymentModalShell({
  title,
  description,
  children,
  onCancel,
  onSubmit,
  submitLabel,
  isLoading,
}: PaymentModalShellProps) {
  return (
    <>
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start gap-3 pr-8">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#402D87]/10">
            <Icon icon="bi:credit-card-2-front" className="text-xl text-[#402D87]" />
          </span>
          <div className="min-w-0">
            <Text variant="h3" weight="semibold" className="text-gray-900">
              {title}
            </Text>
            <Text variant="span" className="mt-1 block text-sm text-gray-500 leading-relaxed">
              {description}
            </Text>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">{children}</div>

      <div
        className={cn(
          'flex flex-col-reverse gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50',
          'sm:flex-row sm:justify-end',
        )}
      >
        <Button variant="outline" onClick={onCancel} className="sm:min-w-[108px]">
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={onSubmit}
          loading={isLoading}
          className="sm:min-w-[180px]"
        >
          {submitLabel}
        </Button>
      </div>
    </>
  )
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
        panelClass="!w-[560px] !max-w-[95vw] p-0 overflow-hidden"
        position="center"
        showClose
        title="Add Payment Details"
      >
        <PaymentModalShell
          title="Add Payment Details"
          description="Add a payout account so we can send your vendor earnings."
          onCancel={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitAddPaymentDetails}
          submitLabel="Save Payment Details"
          isLoading={isAdding}
        >
          <PaymentFormFields
            form={addForm}
            setForm={setAddForm}
            countries={countries}
            formatFieldLabel={formatFieldLabel}
          />
        </PaymentModalShell>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        panelClass="!w-[560px] !max-w-[95vw] p-0 overflow-hidden"
        position="center"
        showClose
        title="Update Payment Details"
      >
        <PaymentModalShell
          title="Update Payment Details"
          description="Update your payout account information."
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={handleSubmitEditPaymentDetails}
          submitLabel="Update Payment Details"
          isLoading={isUpdating}
        >
          <PaymentFormFields
            form={editForm}
            setForm={setEditForm}
            countries={countries}
            formatFieldLabel={formatFieldLabel}
          />
        </PaymentModalShell>
      </Modal>

      <Modal
        isOpen={isDeleteAllModalOpen}
        setIsOpen={setIsDeleteAllModalOpen}
        panelClass="!max-w-md p-0 overflow-hidden"
        position="center"
        showClose
        title="Delete All Payment Methods"
      >
        <div className="px-6 pt-6 pb-4">
          <Text variant="h3" weight="semibold" className="text-gray-900">
            Delete All Payment Methods
          </Text>
          <Text variant="span" className="mt-2 block text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete all payment details for this account? This removes both
            mobile money and bank accounts.
          </Text>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" onClick={() => setIsDeleteAllModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAll} loading={isDeleting}>
            Yes, Delete All
          </Button>
        </div>
      </Modal>
    </>
  )
}
