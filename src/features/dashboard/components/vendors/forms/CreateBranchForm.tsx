import { Controller } from 'react-hook-form'
import {
  Button,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  Text,
  BasePhoneInput,
} from '@/components'
import { GHANA_BANKS } from '@/assets/data/banks'
import { Icon } from '@/libs'
import type { DropdownOption } from '@/types'
import { useCreateBranchForm } from './useCreateBranchForm'

export default function CreateBranchForm() {
  const {
    form,
    paymentMethod,
    countries,
    phoneCountries,
    mobileMoneyProviders,
    isUserActive,
    isFormDisabled,
    missingVendorId,
    onSubmit,
  } = useCreateBranchForm()

  if (missingVendorId) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Icon icon="bi:building" className="text-3xl text-amber-600" />
        </div>
        <div className="text-center">
          <Text as="h3" className="text-lg font-semibold text-gray-900 mb-2">
            Vendor context required
          </Text>
          <Text as="p" className="text-sm text-gray-600 max-w-md">
            Please open this page from a vendor workspace or ensure you are viewing a vendor account
            so we can create a branch for the correct vendor.
          </Text>
        </div>
      </div>
    )
  }

  if (!isUserActive) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <Icon icon="bi:exclamation-triangle-fill" className="text-3xl text-yellow-600" />
        </div>
        <div className="text-center">
          <Text as="h3" className="text-lg font-semibold text-gray-900 mb-2">
            Account Inactive
          </Text>
          <Text as="p" className="text-sm text-gray-600 max-w-md">
            Your account status is currently <span className="font-semibold">inactive</span>. Please
            contact the administrator to activate your account before creating a branch.
          </Text>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      {/* Branch Information */}
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState: { error } }) => (
            <Combobox
              label="Country"
              options={countries?.map((country: { name: string }) => ({
                label: country.name,
                value: country.name,
              }))}
              value={field.value || undefined}
              error={error?.message}
              placeholder="Select country"
              isDisabled={true}
            />
          )}
        />

        <Input
          label="Branch Name"
          placeholder="Enter branch name"
          {...form.register('branch_name')}
          error={form.formState.errors.branch_name?.message}
          disabled={isFormDisabled}
        />

        <Input
          label="Branch Location"
          placeholder="Enter branch location/address"
          {...form.register('branch_location')}
          error={form.formState.errors.branch_location?.message}
          disabled={isFormDisabled}
        />
      </section>

      {/* Branch Manager Information */}
      <section className="flex flex-col gap-4">
        <Text as="h3" className="text-lg font-semibold text-gray-900">
          Branch Manager Information
        </Text>

        <Input
          label="Branch Manager Name"
          placeholder="Enter manager full name"
          {...form.register('branch_manager_name')}
          error={form.formState.errors.branch_manager_name?.message}
          disabled={isFormDisabled}
        />

        <Input
          label="Branch Manager Email"
          placeholder="Enter manager email"
          type="email"
          {...form.register('branch_manager_email')}
          error={form.formState.errors.branch_manager_email?.message}
          disabled={isFormDisabled}
        />

        <Controller
          control={form.control}
          name="branch_manager_phone"
          render={({ field: { value, onChange } }) => (
            <BasePhoneInput
              placeholder="Enter number eg. 5512345678"
              options={phoneCountries}
              selectedVal={value}
              maxLength={14}
              handleChange={onChange}
              label="Phone Number"
              error={form.formState.errors.branch_manager_phone?.message}
              hint={
                <>
                  Please enter your number in the format:{' '}
                  <span className="font-medium">5512345678</span>
                </>
              }
            />
          )}
        />
      </section>

      {/* Payment Method */}
      <section className="flex flex-col gap-4 border-t border-gray-200 pt-4">
        <Text as="h3" className="text-lg font-semibold text-gray-900">
          Payment Method
        </Text>

        <Controller
          control={form.control}
          name="payment_method"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div className="flex flex-col gap-3">
              <RadioGroup value={value || ''} onValueChange={onChange} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="mobile_money" id="mobile-money" />
                  <Text as="label" htmlFor="mobile-money" className="cursor-pointer">
                    Mobile Money
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Text as="label" htmlFor="bank" className="cursor-pointer">
                    Bank Account
                  </Text>
                </div>
              </RadioGroup>
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          )}
        />

        {paymentMethod === 'mobile_money' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <Controller
              control={form.control}
              name="mobile_money_provider"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Mobile Money Provider"
                  options={mobileMoneyProviders as DropdownOption[]}
                  {...field}
                  error={error?.message}
                  placeholder="Select provider"
                />
              )}
            />

            <Controller
              control={form.control}
              name="mobile_money_number"
              render={({ field: { value, onChange } }) => (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  selectedVal={value}
                  maxLength={14}
                  handleChange={onChange}
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
        )}

        {paymentMethod === 'bank' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <Controller
              control={form.control}
              name="bank_name"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Bank Name"
                  options={GHANA_BANKS.map((bank) => ({ label: bank.name, value: bank.name }))}
                  {...field}
                  error={error?.message}
                  placeholder="Select bank"
                />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Branch"
                placeholder="Enter bank branch"
                {...form.register('branch')}
                error={form.formState.errors.branch?.message}
              />

              <Input
                label="Account Number"
                placeholder="Enter account number"
                {...form.register('account_number')}
                error={form.formState.errors.account_number?.message}
              />

              <Input
                className="col-span-full"
                label="Account Name"
                placeholder="Enter account holder name"
                {...form.register('account_name')}
                error={form.formState.errors.account_name?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort Code"
                placeholder="Enter sort code"
                {...form.register('sort_code')}
                error={form.formState.errors.sort_code?.message}
              />

              <Input
                label="SWIFT Code"
                placeholder="Enter SWIFT code"
                {...form.register('swift_code')}
                error={form.formState.errors.swift_code?.message}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex gap-4 border-t border-gray-200 pt-4">
        <Button
          type="submit"
          variant="secondary"
          disabled={!form.formState.isValid || isFormDisabled}
          className="w-full"
        >
          Create Branch
        </Button>
      </div>
    </form>
  )
}
