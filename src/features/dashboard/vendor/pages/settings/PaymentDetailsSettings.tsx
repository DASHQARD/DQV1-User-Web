import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Input,
  Text,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
} from '@/components'
import { useVendorMutations } from '../../hooks/useVendorMutations'
import { GHANA_BANKS } from '@/assets/data/banks'
import { useCountriesData } from '@/hooks'

const PaymentDetailsSchema = z
  .object({
    payment_method: z.enum(['mobile_money', 'bank']),
    mobile_money_provider: z.string().optional(),
    mobile_money_number: z.string().optional(),
    bank_name: z.string().optional(),
    branch: z.string().optional(),
    account_name: z.string().optional(),
    account_number: z.string().optional(),
    swift_code: z.string().optional(),
    sort_code: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_provider'],
    },
  )
  .refine(
    (data) => {
      if (data.payment_method === 'bank') {
        return !!(
          data.bank_name &&
          data.account_number &&
          data.account_name &&
          data.sort_code &&
          data.swift_code
        )
      }
      return true
    },
    {
      message: 'All bank details are required',
      path: ['bank_name'],
    },
  )

export function PaymentDetailsSettings() {
  const { useAddPaymentDetailsService } = useVendorMutations()
  const { mutateAsync: addPaymentDetails, isPending } = useAddPaymentDetailsService()

  const form = useForm<z.infer<typeof PaymentDetailsSchema>>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues: {
      payment_method: 'mobile_money',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      branch: '',
      account_name: '',
      account_number: '',
      swift_code: '',
      sort_code: '',
    },
  })

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const mobileMoneyProviders = [
    { label: 'MTN', value: 'mtn' },
    { label: 'Vodafone', value: 'vodafone' },
    { label: 'AirtelTigo', value: 'airteltigo' },
  ]

  const bankOptions = GHANA_BANKS.map((bank) => ({
    label: bank.name,
    value: bank.name,
  }))

  const { countries: phoneCountries } = useCountriesData()

  // Convert international phone format (+233...) to local format (0...)
  const convertPhoneToLocalFormat = (phoneNumber: string): string => {
    if (!phoneNumber) return ''

    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '')

    // If it starts with 233 (Ghana country code), replace with 0
    if (digitsOnly.startsWith('233')) {
      return '0' + digitsOnly.slice(3)
    }

    // If it already starts with 0, return as is
    if (digitsOnly.startsWith('0')) {
      return digitsOnly
    }

    // Otherwise, assume it's missing the leading 0
    return '0' + digitsOnly
  }

  const onSubmit = async (data: z.infer<typeof PaymentDetailsSchema>) => {
    try {
      // Prepare payload matching API structure
      const payload: any = {
        payment_method: data.payment_method,
      }

      if (data.payment_method === 'mobile_money') {
        payload.mobile_money_provider = data.mobile_money_provider
        // Convert phone number from international format to local format
        payload.mobile_money_number = convertPhoneToLocalFormat(data.mobile_money_number || '')
      } else if (data.payment_method === 'bank') {
        payload.bank_name = data.bank_name
        payload.branch = data.branch
        payload.account_name = data.account_name
        payload.account_number = data.account_number
        payload.swift_code = data.swift_code
        payload.sort_code = data.sort_code
      }

      await addPaymentDetails(payload)
      form.reset()
    } catch (error) {
      console.error('Failed to add payment details:', error)
    }
  }

  return (
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
                  options={mobileMoneyProviders}
                  value={field.value}
                  onChange={(e: any) => {
                    const value = e?.target?.value || e?.value || ''
                    field.onChange(value)
                  }}
                  error={error?.message}
                  placeholder="Select provider"
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="mobile_money_number"
              render={({ field: { onChange } }) => {
                return (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={phoneCountries}
                    maxLength={9}
                    handleChange={onChange}
                    label="Phone Number"
                    error={form.formState.errors.mobile_money_number?.message}
                  />
                )
              }}
            />
            <p className="text-xs text-gray-500">
              Please enter your number in the format:{' '}
              <span className="font-medium">5512345678</span>
            </p>
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
                  onChange={(e: any) => {
                    const value = e?.target?.value || e?.value || ''
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
        <Button type="submit" variant="secondary" loading={isPending}>
          Add Payment Details
        </Button>
      </div>
    </form>
  )
}
