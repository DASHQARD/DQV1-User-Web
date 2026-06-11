import { Controller } from 'react-hook-form'
import {
  Button,
  Input,
  Text,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  PhoneFormatHint,
} from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import {
  usePaymentDetailsSettingsForm,
  type PaymentDetailsFormData,
} from '@/features/dashboard/vendor/hooks'
import { AccountLookupStatus } from '@/components/AccountLookupStatus'

export function PaymentDetailsSettings() {
  const {
    canManagePayment,
    form,
    paymentMethod,
    mobileMoneyProviders,
    bankOptions,
    phoneCountries,
    onSubmit,
    isPending,
    momoLookup,
    bankLookup,
    handleBankSelect,
    selectedBankCode,
  } = usePaymentDetailsSettingsForm()

  const handleSubmit = form.handleSubmit((data: PaymentDetailsFormData) => onSubmit(data))

  if (!canManagePayment) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Payment details can be added after DashQard verifies your vendor account.
      </div>
    )
  }

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
                  placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                  options={phoneCountries}
                  handleChange={onChange}
                  isRequired
                  label="Phone Number"
                  error={form.formState.errors.mobile_money_number?.message} hint={<PhoneFormatHint />}
                />
              )}
            />
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

          <Input
            label="Branch"
            isRequired
            placeholder="Enter branch name"
            {...form.register('branch')}
            error={form.formState.errors.branch?.message}
          />

          <Input
            label="Account Number"
            isRequired
            placeholder="Enter account number"
            {...form.register('account_number')}
            error={form.formState.errors.account_number?.message}
          />

          <Input
            label="Account Name"
            isRequired
            placeholder="Resolved after account verification"
            readOnly={!!bankLookup.accountName}
            {...form.register('account_name')}
            error={form.formState.errors.account_name?.message}
          />

          <div className="md:col-span-2">
            <AccountLookupStatus
              isResolving={bankLookup.isResolving}
              accountName={bankLookup.accountName}
              error={bankLookup.error}
              resolvingLabel="Verifying bank account…"
            />
          </div>

          <Input
            label="GhIPSS Sort Code"
            isRequired
            placeholder="Set automatically when you select a bank"
            readOnly
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
