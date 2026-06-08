import { Controller } from 'react-hook-form'
import {
  Button,
  Input,
  Text,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  Modal,
} from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { Icon } from '@/libs'
import { usePaymentDetailsSettings } from './usePaymentDetailsSettings'
import { AccountLookupStatus } from '@/components/AccountLookupStatus'

export function PaymentDetailsSettings() {
  const {
    form,
    onSubmit,
    handleDelete,
    isUpdating,
    isDeleting,
    hasPaymentDetails,
    paymentMethod,
    mobileMoneyProviders,
    bankOptions,
    countries,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    momoLookup,
    bankLookup,
    handleBankSelect,
    selectedBankCode,
  } = usePaymentDetailsSettings()

  return (
    <>
      <div className="space-y-6">
        {hasPaymentDetails ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
            <Icon icon="bi:info-circle" className="text-amber-600 text-xl shrink-0 mt-0.5" />
            <div>
              <Text variant="span" weight="semibold" className="text-amber-900 block mb-1">
                Request to update payment details
              </Text>
              <Text variant="p" className="text-amber-800/90 text-sm">
                Corporate accounts cannot change payment details directly. Submit your proposed
                changes here; a platform admin will review and approve them before they take
                effect.
              </Text>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text variant="span" className="text-sm text-blue-800">
              Add your payment details below. Updates after that require admin approval.
            </Text>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Text variant="h6" weight="medium" className="mb-4">
              Payment Method
            </Text>
            <Controller
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="mobile_money" id="mobile-money" />
                      <label htmlFor="mobile-money" className="cursor-pointer text-sm">
                        Mobile Money
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="bank" id="bank" />
                      <label htmlFor="bank" className="cursor-pointer text-sm">
                        Bank Account
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {paymentMethod === 'mobile_money' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Controller
                  control={form.control}
                  name="mobile_money_provider"
                  render={({ field, fieldState: { error } }) => (
                    <Combobox
                      label="Mobile Money Provider"
                      options={[...mobileMoneyProviders]}
                      value={field.value}
                      onChange={(e: unknown) => {
                        const ev = e as { target?: { value?: string }; value?: string }
                        const value = ev?.target?.value ?? ev?.value ?? ''
                        field.onChange(value)
                      }}
                      error={error?.message}
                      placeholder="Select provider"
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={form.control}
                  name="mobile_money_number"
                  render={({ field: { value, onChange } }) => (
                    <BasePhoneInput
                      placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                      options={countries}
                      selectedVal={value}
                      handleChange={onChange}
                      label="Mobile Money Number"
                      error={form.formState.errors.mobile_money_number?.message}
                    />
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <AccountLookupStatus
                  isResolving={momoLookup.isResolving}
                  accountName={momoLookup.accountName}
                  error={momoLookup.error}
                  resolvingLabel="Verifying mobile money account…"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Combobox
                  label="Bank Name"
                  options={bankOptions}
                  value={selectedBankCode}
                  onChange={(e: unknown) => {
                    const ev = e as { target?: { value?: string }; value?: string }
                    const code = ev?.target?.value ?? ev?.value ?? ''
                    handleBankSelect(code)
                  }}
                  error={form.formState.errors.bank_name?.message}
                  placeholder="Select bank"
                  isSearchable={true}
                />
              </div>

              <div>
                <Input
                  label="Branch"
                  placeholder="Enter branch name"
                  {...form.register('branch')}
                  error={form.formState.errors.branch?.message}
                />
              </div>

              <div>
                <Input
                  label="Account Number"
                  placeholder="Enter account number"
                  {...form.register('account_number')}
                  error={form.formState.errors.account_number?.message}
                />
              </div>

              <div>
                <Input
                  label="Account Name"
                  placeholder="Resolved after account verification"
                  readOnly={!!bankLookup.accountName}
                  {...form.register('account_name')}
                  error={form.formState.errors.account_name?.message}
                />
              </div>

              <div className="md:col-span-2">
                <AccountLookupStatus
                  isResolving={bankLookup.isResolving}
                  accountName={bankLookup.accountName}
                  error={bankLookup.error}
                  resolvingLabel="Verifying bank account…"
                />
              </div>

              <div>
                <Input
                  label="GhIPSS Sort Code"
                  placeholder="Set automatically when you select a bank"
                  readOnly
                  {...form.register('sort_code')}
                  error={form.formState.errors.sort_code?.message}
                />
              </div>

              <div>
                <Input
                  label="SWIFT Code"
                  placeholder="Enter SWIFT code"
                  {...form.register('swift_code')}
                  error={form.formState.errors.swift_code?.message}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {hasPaymentDetails && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Delete Payment Details
              </Button>
            )}
            <Button type="submit" variant="secondary" loading={isUpdating}>
              {hasPaymentDetails ? 'Submit update request' : 'Add Payment Details'}
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <Text variant="h3" className="font-semibold">
                Delete Payment Details
              </Text>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete your payment details? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
