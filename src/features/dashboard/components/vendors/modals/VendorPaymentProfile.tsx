import React from 'react'
import { Modal, Text, Button } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { useUserProfile } from '@/hooks'

interface PaymentProfile {
  payment_method?: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  bank_branch?: string
  account_name?: string
  account_number?: string
  swift_code?: string
  sort_code?: string
  payment_frequency?: string
}

const formatPaymentMethod = (method: string | undefined): string => {
  switch (method) {
    case 'mobile_money':
      return 'Mobile Money'
    case 'bank':
      return 'Bank Account'
    default:
      return 'Not set'
  }
}

const formatPaymentFrequency = (freq: string | undefined): string => {
  switch (freq?.toLowerCase()) {
    case 'weekly':
      return 'Weekly'
    case 'bi_weekly':
      return 'Bi-Weekly (Every 2 weeks)'
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly (Every 3 months)'
    case 'custom':
      return 'Custom'
    default:
      return 'Not set'
  }
}

export function VendorPaymentProfile() {
  const modal = usePersistedModalState({
    paramName: MODALS.VENDOR_PAYMENT_MANAGEMENT.PARAM_NAME,
  })
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  // Get payment profile from user profile
  const paymentProfile: PaymentProfile = React.useMemo(() => {
    const profile = userProfileData as any

    // Get mobile money account details - API returns array or null
    const momoAccounts = profile?.momo_accounts
    const momoAccount =
      Array.isArray(momoAccounts) && momoAccounts.length > 0 ? momoAccounts[0] : null

    // Get bank account details - API returns array or null
    const bankAccounts = profile?.bank_accounts
    const bankAccount =
      Array.isArray(bankAccounts) && bankAccounts.length > 0 ? bankAccounts[0] : null

    // Determine default payment method
    const defaultPaymentMethod = bankAccount ? 'bank' : momoAccount ? 'mobile_money' : undefined

    // Format provider name (e.g., "mtn" -> "MTN Mobile Money")
    const formatProvider = (provider: string | undefined) => {
      if (!provider) return undefined
      const providerMap: Record<string, string> = {
        mtn: 'MTN Mobile Money',
        vodafone: 'Vodafone Cash',
        airteltigo: 'AirtelTigo Money',
      }
      return providerMap[provider.toLowerCase()] || provider.toUpperCase()
    }

    return {
      payment_frequency: profile?.payment_frequency || profile?.payment_schedule || undefined,
      payment_method:
        profile?.payment_method || profile?.default_payment_option || defaultPaymentMethod,
      mobile_money_provider: formatProvider(momoAccount?.provider),
      mobile_money_number: momoAccount?.number || momoAccount?.momo_number,
      bank_name: bankAccount?.bank_name,
      bank_branch: bankAccount?.bank_branch || bankAccount?.branch,
      account_name: bankAccount?.account_holder_name || bankAccount?.account_name,
      account_number: bankAccount?.account_number,
      swift_code: bankAccount?.swift_code,
      sort_code: bankAccount?.sort_code,
    }
  }, [userProfileData])

  const paymentMethodInfo = React.useMemo(() => {
    if (paymentProfile.payment_method === 'mobile_money') {
      return [
        {
          label: 'Provider',
          value: paymentProfile.mobile_money_provider || 'Not set',
          icon: 'bi:phone',
        },
        {
          label: 'Mobile Money Number',
          value: paymentProfile.mobile_money_number || 'Not set',
          icon: 'bi:telephone',
        },
      ]
    } else if (paymentProfile.payment_method === 'bank') {
      return [
        {
          label: 'Bank Name',
          value: paymentProfile.bank_name || 'Not set',
          icon: 'bi:bank',
        },
        {
          label: 'Branch',
          value: paymentProfile.bank_branch || 'Not set',
          icon: 'bi:building',
        },
        {
          label: 'Account Name',
          value: paymentProfile.account_name || 'Not set',
          icon: 'bi:person',
        },
        {
          label: 'Account Number',
          value: paymentProfile.account_number || 'Not set',
          icon: 'bi:hash',
        },
        {
          label: 'SWIFT Code',
          value: paymentProfile.swift_code || 'Not set',
          icon: 'bi:code-square',
        },
        {
          label: 'Sort Code',
          value: paymentProfile.sort_code || 'Not set',
          icon: 'bi:123',
        },
      ]
    }
    return []
  }, [paymentProfile])

  return (
    <Modal
      title="Payment Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.VENDOR_PAYMENT_MANAGEMENT.CHILDREN.PROFILE)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <div className="h-full px-6 flex flex-col">
        <div className="grow">
          {/* Payment Schedule */}
          {paymentProfile.payment_frequency && (
            <div className="mb-6">
              <Text
                variant="h6"
                weight="semibold"
                className="text-gray-900 mb-4 flex items-center gap-2"
              >
                <Icon icon="bi:calendar-check" className="text-primary-600" />
                Payment Schedule
              </Text>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Text variant="span" weight="medium" className="text-gray-900">
                  {formatPaymentFrequency(paymentProfile.payment_frequency)}
                </Text>
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          {paymentMethodInfo.length > 0 ? (
            <div className="mb-6">
              <Text
                variant="h6"
                weight="semibold"
                className="text-gray-900 mb-4 flex items-center gap-2"
              >
                <Icon icon="bi:wallet2" className="text-primary-600" />
                Payment Method
              </Text>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Text variant="span" weight="medium" className="text-gray-900 block mb-4">
                  {formatPaymentMethod(paymentProfile.payment_method)}
                </Text>
                {paymentMethodInfo.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 py-3 border-t border-gray-200 first:border-0"
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
            </div>
          ) : (
            <div className="mb-6">
              <Text
                variant="h6"
                weight="semibold"
                className="text-gray-900 mb-4 flex items-center gap-2"
              >
                <Icon icon="bi:wallet2" className="text-primary-600" />
                Payment Method
              </Text>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Text variant="span" className="text-gray-600">
                  No payment method configured. Please update your payment preferences to set up a
                  payment method.
                </Text>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon icon="bi:info-circle" className="text-blue-600 text-lg shrink-0 mt-0.5" />
              <div>
                <Text variant="span" weight="medium" className="text-blue-900 block mb-1">
                  Payment Information
                </Text>
                <Text variant="span" className="text-blue-700 text-sm block">
                  This is your current payment configuration. To update your payment method or
                  schedule, use the "Update Payment Preferences" button.
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button variant="outline" onClick={modal.closeModal} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
