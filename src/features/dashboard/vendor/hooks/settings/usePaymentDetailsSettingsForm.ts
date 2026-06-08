import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCountriesData, usePaymentDetailsFormLookups } from '@/hooks'
import { useVendorMutations } from '../useVendorMutations'
import { PaymentDetailsSchema } from '@/utils/schemas/payment'

export type PaymentDetailsFormData = z.infer<typeof PaymentDetailsSchema>

const defaultValues: PaymentDetailsFormData = {
  payment_method: 'mobile_money',
  mobile_money_provider: '',
  mobile_money_number: '',
  bank_name: '',
  branch: '',
  account_name: '',
  account_number: '',
  swift_code: '',
  sort_code: '',
}

export function usePaymentDetailsSettingsForm() {
  const { useAddPaymentDetailsService } = useVendorMutations()
  const { mutateAsync: addPaymentDetails, isPending } = useAddPaymentDetailsService()
  const { countries: phoneCountries } = useCountriesData()

  const form = useForm<PaymentDetailsFormData>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues,
  })

  const watched = useWatch({ control: form.control })
  const paymentMethod = watched.payment_method

  const lookups = usePaymentDetailsFormLookups(form, watched)

  const onSubmit = React.useCallback(
    async (data: PaymentDetailsFormData) => {
      try {
        const payload: Record<string, string | undefined> = {
          payment_method: data.payment_method,
        }

        if (data.payment_method === 'mobile_money') {
          payload.mobile_money_provider = data.mobile_money_provider
          payload.mobile_money_number = data.mobile_money_number ?? ''
        } else if (data.payment_method === 'bank') {
          payload.bank_name = data.bank_name
          payload.branch = data.branch
          payload.account_name = data.account_name
          payload.account_number = data.account_number
          payload.swift_code = data.swift_code
          payload.sort_code = data.sort_code
        }

        await addPaymentDetails(payload as Parameters<typeof addPaymentDetails>[0])
        form.reset(defaultValues)
      } catch (error) {
        console.error('Failed to add payment details:', error)
      }
    },
    [addPaymentDetails, form],
  )

  return {
    form,
    paymentMethod,
    mobileMoneyProviders: lookups.providerOptions,
    bankOptions: lookups.bankOptions.map((bank) => ({
      label: bank.label,
      value: bank.value,
    })),
    phoneCountries,
    onSubmit,
    isPending,
    momoLookup: lookups.momoLookup,
    bankLookup: lookups.bankLookup,
    handleBankSelect: lookups.handleBankSelect,
    selectedBankCode: lookups.selectedBankCode,
  }
}
