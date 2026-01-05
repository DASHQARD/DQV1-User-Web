import React from 'react'
import { Modal, Text, PrintView, Button, RadioGroup, RadioGroupItem } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { userProfile } from '@/hooks'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const PaymentPreferencesSchema = z.object({
  payment_frequency: z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly', 'custom']),
  auto_payout: z.boolean(),
  minimum_payout_amount: z.number().min(0, 'Minimum amount must be 0 or greater').optional(),
})

type PaymentPreferencesFormData = z.infer<typeof PaymentPreferencesSchema>

interface PaymentPreferences {
  payment_frequency?: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'custom'
  payment_method?: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  bank_branch?: string
  account_name?: string
  account_number?: string
  swift_code?: string
  sort_code?: string
  minimum_payout_amount?: number
  auto_payout?: boolean
}

export function VendorPaymentPreferences() {
  const modal = usePersistedModalState({
    paramName: MODALS.VENDOR_PAYMENT_MANAGEMENT.PARAM_NAME,
  })
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useUpdatePaymentPreferencesService } = useVendorMutations()
  const { mutateAsync: updatePreferences, isPending } = useUpdatePaymentPreferencesService()

  // Get payment preferences from user profile with fallback to defaults
  const paymentPreferences: PaymentPreferences = React.useMemo(() => {
    const profile = userProfileData as any

    // Get mobile money account details
    const momoAccount = profile?.momo_accounts?.[0]
    // Get bank account details
    const bankAccount = profile?.bank_accounts?.[0]

    // Determine default payment method
    const defaultPaymentMethod = bankAccount
      ? 'bank'
      : momoAccount
        ? 'mobile_money'
        : 'mobile_money'

    return {
      payment_frequency: profile?.payment_frequency || profile?.payment_schedule || 'monthly',
      payment_method:
        profile?.payment_method || profile?.default_payment_option || defaultPaymentMethod,
      mobile_money_provider: momoAccount?.provider || 'MTN Mobile Money',
      mobile_money_number: momoAccount?.momo_number || '+233 XX XXX XXXX',
      bank_name: bankAccount?.bank_name || 'Not configured',
      bank_branch: bankAccount?.bank_branch || bankAccount?.branch || 'Not configured',
      account_name:
        bankAccount?.account_holder_name || bankAccount?.account_name || 'Not configured',
      account_number: bankAccount?.account_number || 'Not configured',
      swift_code: bankAccount?.swift_code || 'Not configured',
      sort_code: bankAccount?.sort_code || 'Not configured',
      minimum_payout_amount: profile?.minimum_payout_amount || 100,
      auto_payout: profile?.auto_payout ?? true,
    }
  }, [userProfileData])

  // Form for payment preferences
  const form = useForm<PaymentPreferencesFormData>({
    resolver: zodResolver(PaymentPreferencesSchema),
    defaultValues: {
      payment_frequency: (paymentPreferences.payment_frequency as any) || 'monthly',
      auto_payout: paymentPreferences.auto_payout ?? true,
      minimum_payout_amount: paymentPreferences.minimum_payout_amount || 0,
    },
  })

  // Update form when user profile data changes
  React.useEffect(() => {
    if (userProfileData) {
      const profile = userProfileData as any
      form.reset({
        payment_frequency: (profile?.payment_frequency ||
          profile?.payment_schedule ||
          'monthly') as any,
        auto_payout: profile?.auto_payout ?? true,
        minimum_payout_amount: profile?.minimum_payout_amount || 0,
      })
    }
  }, [userProfileData, form])

  const onSubmit = async (data: PaymentPreferencesFormData) => {
    try {
      await updatePreferences({
        payment_frequency: data.payment_frequency,
        auto_payout: data.auto_payout,
        minimum_payout_amount: data.minimum_payout_amount,
      })
      modal.closeModal()
    } catch (error) {
      console.error('Failed to update payment preferences:', error)
    }
  }

  const formatPaymentMethod = (method: string | undefined) => {
    switch (method) {
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank':
        return 'Bank Account'
      default:
        return 'Not set'
    }
  }

  const paymentMethodInfo = React.useMemo(() => {
    if (paymentPreferences.payment_method === 'mobile_money') {
      return [
        {
          label: 'Provider',
          value: paymentPreferences.mobile_money_provider || 'Not set',
          icon: 'bi:phone',
        },
        {
          label: 'Mobile Money Number',
          value: paymentPreferences.mobile_money_number || 'Not set',
          icon: 'bi:telephone',
        },
      ]
    } else if (paymentPreferences.payment_method === 'bank') {
      return [
        {
          label: 'Bank Name',
          value: paymentPreferences.bank_name || 'Not set',
          icon: 'bi:bank',
        },
        {
          label: 'Branch',
          value: paymentPreferences.bank_branch || 'Not set',
          icon: 'bi:building',
        },
        {
          label: 'Account Name',
          value: paymentPreferences.account_name || 'Not set',
          icon: 'bi:person',
        },
        {
          label: 'Account Number',
          value: paymentPreferences.account_number || 'Not set',
          icon: 'bi:hash',
        },
        {
          label: 'SWIFT Code',
          value: paymentPreferences.swift_code || 'Not set',
          icon: 'bi:code-square',
        },
        {
          label: 'Sort Code',
          value: paymentPreferences.sort_code || 'Not set',
          icon: 'bi:123',
        },
      ]
    }
    return []
  }, [paymentPreferences])

  return (
    <Modal
      title="Payment Preferences"
      position="side"
      isOpen={modal.isModalOpen(MODALS.VENDOR_PAYMENT_MANAGEMENT.CHILDREN.PREFERENCES)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <PrintView>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-6 flex flex-col">
          <div className="grow">
            {/* Payment Frequency Section */}
            <div className="mb-6">
              <Text
                variant="h6"
                weight="semibold"
                className="text-gray-900 mb-4 flex items-center gap-2"
              >
                <Icon icon="bi:calendar-check" className="text-primary-600" />
                Payment Schedule
              </Text>
              <Controller
                control={form.control}
                name="payment_frequency"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <label htmlFor="weekly" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">Weekly</div>
                          <div className="text-sm text-gray-600">Receive payments every week</div>
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                        <RadioGroupItem value="bi_weekly" id="bi_weekly" />
                        <label htmlFor="bi_weekly" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">Bi-Weekly</div>
                          <div className="text-sm text-gray-600">
                            Receive payments every 2 weeks
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <label htmlFor="monthly" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">Monthly</div>
                          <div className="text-sm text-gray-600">
                            Receive payments once per month
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-all">
                        <RadioGroupItem value="quarterly" id="quarterly" />
                        <label htmlFor="quarterly" className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">Quarterly</div>
                          <div className="text-sm text-gray-600">
                            Receive payments every 3 months
                          </div>
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {/* Current Payment Method Display (Read-only) */}
            {paymentMethodInfo.length > 0 && (
              <div className="mb-6">
                <Text
                  variant="h6"
                  weight="semibold"
                  className="text-gray-900 mb-4 flex items-center gap-2"
                >
                  <Icon icon="bi:wallet2" className="text-primary-600" />
                  Current Payment Method
                </Text>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Text variant="span" weight="medium" className="text-gray-900 block mb-2">
                    {formatPaymentMethod(paymentPreferences.payment_method)}
                  </Text>
                  {paymentMethodInfo.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-2 border-t border-gray-200 first:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon icon={item.icon} className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  To update your payment method, visit{' '}
                  <a
                    href="/dashboard/vendor/payment-methods"
                    className="text-primary-600 underline font-medium hover:text-primary-700"
                  >
                    Payment Methods
                  </a>{' '}
                  in settings.
                </p>
              </div>
            )}
            {/* Info Message */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon icon="bi:info-circle" className="text-blue-600 text-lg shrink-0 mt-0.5" />
                <div>
                  <Text variant="span" weight="medium" className="text-blue-900 block mb-1">
                    Payment Schedule Information
                  </Text>
                  <Text variant="span" className="text-blue-700 text-sm block">
                    Your payment schedule determines how often you receive payouts. Payments are
                    processed according to your selected frequency, and will be sent to your
                    configured payment method.
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={modal.closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" loading={isPending} disabled={isPending}>
              Save Preferences
            </Button>
          </div>
        </form>
      </PrintView>
    </Modal>
  )
}
