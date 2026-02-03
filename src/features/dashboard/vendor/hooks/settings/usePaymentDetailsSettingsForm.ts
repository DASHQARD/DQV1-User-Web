import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCountriesData } from '@/hooks'
import { useVendorMutations } from '../useVendorMutations'
import { GHANA_BANKS } from '@/assets/data/banks'
import { PaymentDetailsSchema } from '@/utils/schemas/payment'
import { MOBILE_MONEY_PROVIDERS } from '@/utils/constants'

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

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const bankOptions = React.useMemo(
    () => GHANA_BANKS.map((bank) => ({ label: bank.name, value: bank.name })),
    [],
  )

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
    mobileMoneyProviders: [...MOBILE_MONEY_PROVIDERS],
    bankOptions,
    phoneCountries,
    onSubmit,
    isPending,
  }
}
