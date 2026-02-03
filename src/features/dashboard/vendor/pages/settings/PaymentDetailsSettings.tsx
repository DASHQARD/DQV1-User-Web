import { Controller } from 'react-hook-form'
import {
  Button,
  Input,
  Text,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
} from '@/components'
import {
  usePaymentDetailsSettingsForm,
  type PaymentDetailsFormData,
} from '@/features/dashboard/vendor/hooks'

export function PaymentDetailsSettings() {
  const {
    form,
    paymentMethod,
    mobileMoneyProviders,
    bankOptions,
    phoneCountries,
    onSubmit,
    isPending,
  } = usePaymentDetailsSettingsForm()

  const handleSubmit = form.handleSubmit((data: PaymentDetailsFormData) => onSubmit(data))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Controller
            control={form.control}
            name="mobile_money_provider"
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="Mobile Money Provider"
                options={mobileMoneyProviders}
                value={field.value}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  const value = ev?.target?.value ?? ev?.value ?? ''
                  field.onChange(value)
                }}
                error={error?.message}
                placeholder="Select provider"
                isRequired
              />
            )}
          />

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="mobile_money_number"
              render={({ field: { onChange } }) => (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  maxLength={14}
                  handleChange={onChange}
                  isRequired
                  label="Phone Number"
                  error={form.formState.errors.mobile_money_number?.message}
                  hint={
                    <>
                      Please enter your number in the format:{' '}
                      <span className="font-medium">5512345678</span>
                    </>
                  }
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

          <Input
            label="Branch"
            isRequired
            placeholder="Enter branch name"
            {...form.register('branch')}
            error={form.formState.errors.branch?.message}
          />

          <Input
            label="Account Name"
            isRequired
            placeholder="Enter account holder name"
            {...form.register('account_name')}
            error={form.formState.errors.account_name?.message}
          />

          <Input
            label="Account Number"
            isRequired
            placeholder="Enter account number"
            {...form.register('account_number')}
            error={form.formState.errors.account_number?.message}
          />

          <Input
            label="Sort Code"
            isRequired
            placeholder="Enter sort code"
            {...form.register('sort_code')}
            error={form.formState.errors.sort_code?.message}
          />

          <Input
            label="SWIFT Code"
            isRequired
            placeholder="Enter SWIFT code"
            {...form.register('swift_code')}
            error={form.formState.errors.swift_code?.message}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="secondary" loading={isPending}>
          Add Payment Details
        </Button>
      </div>
    </form>
  )
}
