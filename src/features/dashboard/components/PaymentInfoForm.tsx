import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Input, Combobox, RadioGroup, RadioGroupItem, Text, BasePhoneInput } from '@/components'
import { PaymentInfoSchema } from '@/utils/schemas/payment'
import { usePaymentInfoService } from '../hooks/usePayment'
import { useCountriesData } from '@/hooks'
import { GHANA_BANKS } from '@/assets/data/banks'
import React from 'react'
import { useUserProfile } from '@/hooks'

export default function PaymentInfoForm() {
  const { data: userProfile } = useUserProfile()
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
    },
  })

  React.useEffect(() => {
    if (!userProfile) return

    // Check if user has mobile money accounts
    if (userProfile.momo_accounts?.length) {
      const momoAccount = userProfile.momo_accounts[0]
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
    else if (userProfile.bank_accounts?.length) {
      const bankAccount = userProfile.bank_accounts[0]
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
  }, [userProfile, form])

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const mobileMoneyProviders = [
    { label: 'MTN Mobile Money', value: 'mtn' },
    { label: 'Vodafone Cash', value: 'vodafone' },
    { label: 'AirtelTigo Money', value: 'airteltigo' },
  ]

  const onSubmit = (data: z.infer<typeof PaymentInfoSchema>) => {
    // Prepare the data based on payment method
    if (data.payment_method === 'mobile_money') {
      // BasePhoneInput returns format: "+233-559617908"
      // Extract the number part (after the dash) and strip any non-digit characters
      const phoneValue = data.mobile_money_number || ''
      const numberPart = phoneValue.includes('-') ? phoneValue.split('-')[1] : phoneValue
      const cleanedMobileMoneyNumber = numberPart.replace(/\D/g, '')

      mutate({
        payment_method: 'mobile_money',
        mobile_money_provider: data.mobile_money_provider!,
        mobile_money_number: cleanedMobileMoneyNumber,
      } as any)
    } else if (data.payment_method === 'bank') {
      mutate({
        payment_method: 'bank',
        bank_name: data.bank_name!,
        account_number: data.account_number!,
        branch: data.branch!,
        account_name: data.account_name!,
        sort_swift_code: data.sort_swift_code!,
      } as any)
    }
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
                  options={mobileMoneyProviders}
                  {...field}
                  error={error?.message}
                  placeholder="Select provider"
                />
              )}
            />

            <Controller
              control={form.control}
              name="mobile_money_number"
              render={({ field: { value, onChange } }) => {
                return (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={countries}
                    selectedVal={value}
                    maxLength={10}
                    handleChange={onChange}
                    label="Mobile Money Number"
                    error={form.formState.errors.mobile_money_number?.message}
                  />
                )
              }}
            />
          </div>
        )}

        {/* Bank Fields */}
        {paymentMethod === 'bank' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Bank Account Details</h3>

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
              placeholder="Enter account name"
              {...form.register('account_name')}
              error={form.formState.errors.account_name?.message}
            />

            <Input
              label="Sort/Swift Code"
              placeholder="Enter sort/swift code"
              {...form.register('sort_swift_code')}
              error={form.formState.errors.sort_swift_code?.message}
            />
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
