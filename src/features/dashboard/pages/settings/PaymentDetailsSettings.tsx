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
  Modal,
} from '@/components'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { GHANA_BANKS } from '@/assets/data/banks'
import React from 'react'
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
  const { useUpdatePaymentDetailsService, useDeletePaymentDetailsService } = corporateMutations()
  const { mutateAsync: updatePaymentDetails, isPending: isUpdating } =
    useUpdatePaymentDetailsService()
  const { mutateAsync: deletePaymentDetails, isPending: isDeleting } =
    useDeletePaymentDetailsService()
  const { useGetPaymentDetailsService } = corporateQueries()
  const { data: paymentDetailsResponse } = useGetPaymentDetailsService()
  const { countries } = useCountriesData()
  const paymentDetailsData = paymentDetailsResponse?.data || paymentDetailsResponse || {}

  // Memoize arrays to prevent unnecessary re-renders
  const bankAccounts = React.useMemo(
    () => paymentDetailsData?.bank_accounts || [],
    [paymentDetailsData?.bank_accounts],
  )
  const mobileMoneyAccounts = React.useMemo(
    () => paymentDetailsData?.mobile_money_accounts || [],
    [paymentDetailsData?.mobile_money_accounts],
  )
  const hasPaymentDetails = bankAccounts.length > 0 || mobileMoneyAccounts.length > 0
  const defaultPaymentOption = paymentDetailsData?.default_payment_option || 'mobile_money'

  const initialValues = React.useMemo(() => {
    // Use default_payment_option to determine which to show
    if (defaultPaymentOption === 'bank' && bankAccounts.length > 0) {
      const bank = bankAccounts[0]
      return {
        payment_method: 'bank' as const,
        bank_name: bank.bank_name || '',
        branch: bank.bank_branch || bank.branch || '',
        account_name: bank.account_holder_name || '',
        account_number: bank.account_number || '',
        swift_code: bank.swift_code || '',
        sort_code: bank.sort_code || '',
        mobile_money_provider: '',
        mobile_money_number: '',
      }
    }
    if (defaultPaymentOption === 'mobile_money' && mobileMoneyAccounts.length > 0) {
      const mobile = mobileMoneyAccounts[0]
      return {
        payment_method: 'mobile_money' as const,
        mobile_money_provider: mobile.provider || '',
        mobile_money_number: mobile.momo_number || '',
        bank_name: '',
        branch: '',
        account_name: '',
        account_number: '',
        swift_code: '',
        sort_code: '',
      }
    }
    // Fallback to bank if available, otherwise mobile_money
    if (bankAccounts.length > 0) {
      const bank = bankAccounts[0]
      return {
        payment_method: 'bank' as const,
        bank_name: bank.bank_name || '',
        branch: bank.bank_branch || bank.branch || '',
        account_name: bank.account_holder_name || '',
        account_number: bank.account_number || '',
        swift_code: bank.swift_code || '',
        sort_code: bank.sort_code || '',
        mobile_money_provider: '',
        mobile_money_number: '',
      }
    }
    if (mobileMoneyAccounts.length > 0) {
      const mobile = mobileMoneyAccounts[0]
      return {
        payment_method: 'mobile_money' as const,
        mobile_money_provider: mobile.provider || '',
        mobile_money_number: mobile.momo_number || '',
        bank_name: '',
        branch: '',
        account_name: '',
        account_number: '',
        swift_code: '',
        sort_code: '',
      }
    }
    return {
      payment_method: 'mobile_money' as const,
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      branch: '',
      account_name: '',
      account_number: '',
      swift_code: '',
      sort_code: '',
    }
  }, [bankAccounts, mobileMoneyAccounts, defaultPaymentOption])

  const form = useForm<z.infer<typeof PaymentDetailsSchema>>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues: initialValues,
  })

  // Create a stable key to detect actual changes in payment details
  const paymentDetailsKey = React.useMemo(() => {
    if (defaultPaymentOption === 'bank' && bankAccounts.length > 0) {
      const bank = bankAccounts[0]
      return JSON.stringify({
        type: 'bank',
        bank_name: bank.bank_name,
        account_number: bank.account_number,
      })
    }
    if (defaultPaymentOption === 'mobile_money' && mobileMoneyAccounts.length > 0) {
      const mobile = mobileMoneyAccounts[0]
      return JSON.stringify({
        type: 'mobile',
        provider: mobile.provider,
        number: mobile.momo_number,
      })
    }
    if (bankAccounts.length > 0) {
      const bank = bankAccounts[0]
      return JSON.stringify({
        type: 'bank',
        bank_name: bank.bank_name,
        account_number: bank.account_number,
      })
    }
    if (mobileMoneyAccounts.length > 0) {
      const mobile = mobileMoneyAccounts[0]
      return JSON.stringify({
        type: 'mobile',
        provider: mobile.provider,
        number: mobile.momo_number,
      })
    }
    return 'empty'
  }, [bankAccounts, mobileMoneyAccounts, defaultPaymentOption])

  // Track previous key to prevent infinite loops
  const prevKeyRef = React.useRef<string>('')

  React.useEffect(() => {
    // Only reset if payment details actually changed
    if (prevKeyRef.current !== paymentDetailsKey) {
      form.reset(initialValues)
      prevKeyRef.current = paymentDetailsKey
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDetailsKey])

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

  const onSubmit = async (data: z.infer<typeof PaymentDetailsSchema>) => {
    try {
      const payload: any = {
        payment_method: data.payment_method,
      }

      if (data.payment_method === 'mobile_money') {
        payload.mobile_money_provider = data.mobile_money_provider
        payload.mobile_money_number = data.mobile_money_number
      } else if (data.payment_method === 'bank') {
        payload.bank_name = data.bank_name
        payload.branch = data.branch
        payload.account_name = data.account_name
        payload.account_number = data.account_number
        payload.swift_code = data.swift_code
        payload.sort_code = data.sort_code
      }

      await updatePaymentDetails(payload)
    } catch (error) {
      console.error('Failed to update payment details:', error)
    }
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  const handleDelete = async () => {
    try {
      await deletePaymentDetails()
      form.reset(initialValues)
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Failed to delete payment details:', error)
    }
  }

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

      {/* Delete Payment Details Confirmation Modal */}
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
