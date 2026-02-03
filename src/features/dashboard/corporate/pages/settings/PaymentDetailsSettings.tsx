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
import { Icon } from '@/libs'
import { usePaymentDetailsSettings } from './usePaymentDetailsSettings'

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
  } = usePaymentDetailsSettings()

  return (
    <>
      <div className="space-y-6">
        {hasPaymentDetails && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text variant="span" className="text-sm text-blue-800">
              You have existing payment details. Update them below or delete to start fresh.
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
                      placeholder="Enter number eg. 5512345678"
                      options={countries}
                      selectedVal={value}
                      maxLength={10}
                      handleChange={onChange}
                      label="Mobile Money Number"
                      error={form.formState.errors.mobile_money_number?.message}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Controller
                  control={form.control}
                  name="bank_name"
                  render={({ field, fieldState: { error } }) => (
                    <Combobox
                      label="Bank Name"
                      options={bankOptions}
                      value={field.value}
                      onChange={(e: unknown) => {
                        const ev = e as { target?: { value?: string }; value?: string }
                        const value = ev?.target?.value ?? ev?.value ?? ''
                        field.onChange(value)
                      }}
                      error={error?.message}
                      placeholder="Select bank"
                      isSearchable={true}
                    />
                  )}
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
                  label="Account Name"
                  placeholder="Enter account holder name"
                  {...form.register('account_name')}
                  error={form.formState.errors.account_name?.message}
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
                  label="Sort Code"
                  placeholder="Enter sort code"
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
              {hasPaymentDetails ? 'Update Payment Details' : 'Add Payment Details'}
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
