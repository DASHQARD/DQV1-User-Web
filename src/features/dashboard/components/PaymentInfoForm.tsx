import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/Button'
import {
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  Text,
  BasePhoneInput,
  Checkbox,
  PhoneFormatHint,
} from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { PaymentInfoSchema } from '@/utils/schemas/payment'
import { usePaymentInfoService } from '../hooks/usePayment'
import { useCountriesData, usePaymentDetailsFormLookups, useUserProfile } from '@/hooks'
import React from 'react'
import { Icon } from '@/libs'
import { AccountLookupStatus } from '@/components/AccountLookupStatus'

export default function PaymentInfoForm() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdatePaymentInfoService } = usePaymentInfoService()
  const { mutate, isPending } = useUpdatePaymentInfoService()
  const { countries } = useCountriesData()

  const form = useForm<z.infer<typeof PaymentInfoSchema>>({
    resolver: zodResolver(PaymentInfoSchema),
    defaultValues: {
      payment_method: '',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      account_number: '',
      branch: '',
      account_name: '',
      sort_swift_code: '',
      become_vendor: false,
    },
  })

  const userType = userProfileData?.user_type
  const isCorporate = userType === 'corporate'
  const isCorporateVendor = userType === 'corporate_vendor'

  React.useEffect(() => {
    if (!userProfileData) return

    // Check if user has mobile money accounts
    if (userProfileData.momo_accounts?.length) {
      const momoAccount = userProfileData.momo_accounts[0]
      // Extract only digits from momo_number
      const digitsOnly = momoAccount.momo_number ? momoAccount.momo_number.replace(/\D/g, '') : ''

      // Remove country code prefix if present (233 for Ghana)
      let localNumber = digitsOnly
      if (digitsOnly.startsWith('233')) {
        localNumber = digitsOnly.slice(3) // Remove '233' prefix
      }

      // Format for BasePhoneInput: "+233-{local_number}"
      // BasePhoneInput will display "+233" in country selector and local number in input
      const formattedNumber = localNumber ? `+233-${localNumber}` : ''

      form.reset({
        payment_method: 'mobile_money',
        mobile_money_provider: momoAccount.provider || '',
        mobile_money_number: formattedNumber,
        bank_name: '',
        account_number: '',
        branch: '',
        account_name: '',
        sort_swift_code: '',
      })
    }
    // Check if user has bank accounts
    else if (userProfileData.bank_accounts?.length) {
      const bankAccount = userProfileData.bank_accounts[0]
      form.reset({
        payment_method: 'bank',
        mobile_money_provider: '',
        mobile_money_number: '',
        bank_name: bankAccount.bank_name || '',
        account_number: bankAccount.account_number || '',
        branch: bankAccount.bank_branch || '',
        account_name: bankAccount.account_holder_name || '',
        sort_swift_code: bankAccount.swift_code || '',
      })
    }
  }, [userProfileData, form])

  const watched = useWatch({ control: form.control })
  const paymentMethod = watched.payment_method

  const {
    bankOptions,
    providerOptions,
    momoLookup,
    bankLookup,
    handleBankSelect,
    selectedBankCode,
  } = usePaymentDetailsFormLookups(form, watched)

  const onSubmit = (data: z.infer<typeof PaymentInfoSchema>) => {
    // Prepare the data based on payment method
    const basePayload: any = {}

    if (data.payment_method === 'mobile_money') {
      // BasePhoneInput returns E.164 e.g. "+2335512345678"
      // Extract the number part (after the dash) and strip any non-digit characters
      const phoneValue = data.mobile_money_number || ''
      const numberPart = phoneValue.includes('-') ? phoneValue.split('-')[1] : phoneValue
      const cleanedMobileMoneyNumber = '0' + numberPart.replace(/\D/g, '')

      Object.assign(basePayload, {
        payment_method: 'mobile_money',
        mobile_money_provider: data.mobile_money_provider!,
        mobile_money_number: cleanedMobileMoneyNumber,
      })
    } else if (data.payment_method === 'bank') {
      Object.assign(basePayload, {
        payment_method: 'bank',
        bank_name: data.bank_name!,
        account_number: data.account_number!,
        branch: data.branch!,
        account_name: data.account_name!,
        sort_swift_code: data.sort_swift_code!,
      })
    }

    // Add become_vendor flag for corporate users
    if (isCorporate && data.become_vendor) {
      basePayload.become_vendor = true
    }

    mutate(basePayload)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      <section className="flex flex-col gap-6">
        {/* Payment Method Selection */}
        <Controller
          control={form.control}
          name="payment_method"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div className="flex flex-col gap-3">
              <Text as="h3" className="text-lg font-semibold text-gray-900">
                Payment Method
              </Text>
              <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
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

        {/* Mobile Money Fields */}
        {paymentMethod === 'mobile_money' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Mobile Money Details</h3>

            <Controller
              control={form.control}
              name="mobile_money_provider"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Mobile Money Provider"
                  options={providerOptions}
                  {...field}
                  error={error?.message}
                  placeholder="Select provider"
                />
              )}
            />

            <div className="flex flex-col gap-1">
              <Controller
                control={form.control}
                name="mobile_money_number"
                render={({ field: { value, onChange } }) => {
                  return (
                    <BasePhoneInput
                      placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                      options={countries}
                      selectedVal={value}
                      handleChange={onChange}
                      label="Mobile Money Number"
                      error={form.formState.errors.mobile_money_number?.message}
                    />
                  )
                }}
              />
              <PhoneFormatHint variant="hint" />
              <AccountLookupStatus
                isResolving={momoLookup.isResolving}
                accountName={momoLookup.accountName}
                error={momoLookup.error}
                resolvingLabel="Verifying mobile money account…"
              />
            </div>
          </div>
        )}

        {/* Bank Fields */}
        {paymentMethod === 'bank' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Bank Account Details</h3>

            <Combobox
              label="Bank Name"
              options={bankOptions.map((bank) => ({ label: bank.label, value: bank.value }))}
              value={selectedBankCode}
              onChange={(e: unknown) => {
                const ev = e as { target?: { value?: string }; value?: string }
                const code = ev?.target?.value ?? ev?.value ?? ''
                handleBankSelect(code)
              }}
              error={form.formState.errors.bank_name?.message}
              placeholder="Select bank"
              isSearchable
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Account Number"
                placeholder="Enter account number"
                {...form.register('account_number')}
                error={form.formState.errors.account_number?.message}
              />

              <Input
                label="Branch"
                placeholder="Enter branch"
                {...form.register('branch')}
                error={form.formState.errors.branch?.message}
              />
            </div>

            <Input
              label="Account Name"
              placeholder="Resolved after account verification"
              readOnly={!!bankLookup.accountName}
              {...form.register('account_name')}
              error={form.formState.errors.account_name?.message}
            />

            <AccountLookupStatus
              isResolving={bankLookup.isResolving}
              accountName={bankLookup.accountName}
              error={bankLookup.error}
              resolvingLabel="Verifying bank account…"
            />

            <Input
              label="GhIPSS Sort Code"
              placeholder="Set automatically when you select a bank"
              readOnly
              {...form.register('sort_swift_code')}
              error={form.formState.errors.sort_swift_code?.message}
            />
          </div>
        )}

        {/* Become Vendor Opt-in for Corporate Users */}
        {isCorporate && !isCorporateVendor && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="bg-linear-to-br from-[#f5f1ff] to-[#fdf9ff] border border-[#e9d5ff] rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#402D87] flex items-center justify-center text-white shrink-0">
                  <Icon icon="bi:shop-window" className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Become a Vendor</h3>
                    <span className="px-2 py-1 text-xs font-semibold text-[#402D87] bg-[#ede9fe] rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Enable vendor features to accept redemptions and switch between corporate and
                    vendor profiles. You'll be able to manage branches and receive vendor
                    settlements.
                  </p>
                  <Controller
                    control={form.control}
                    name="become_vendor"
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={value || false}
                          onChange={(e) => onChange(e.target.checked)}
                          label="Enable vendor features"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show info for corporate_vendor users */}
        {isCorporateVendor && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon icon="bi:check-circle-fill" className="text-[#059669] text-xl" />
                <div>
                  <p className="text-sm font-semibold text-[#059669]">Vendor features enabled</p>
                  <p className="text-xs text-gray-600 mt-1">
                    You can switch between corporate and vendor profiles from the sidebar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="secondary"
          className="w-full mt-4"
          loading={isPending}
          disabled={!paymentMethod || isPending}
        >
          Save Payment Information
        </Button>
      </section>
    </form>
  )
}
