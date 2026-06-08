import { useEffect } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { useMobileMoneyAccountLookup } from '@/hooks/useMobileMoneyAccountLookup'
import { useBankAccountLookup } from '@/hooks/useBankAccountLookup'
import { usePaymentBanksQuery, useMobileMoneyProvidersQuery } from '@/hooks/usePaymentLookupQueries'

type PaymentFormFields = {
  payment_method?: string
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  account_number?: string
  account_name?: string
  sort_swift_code?: string
  sort_code?: string
}

/**
 * Wires GET /payments/banks, GET /payments/mobile-money-providers, and account lookup
 * into payment detail forms (onboarding + settings).
 */
export function usePaymentDetailsFormLookups<T extends PaymentFormFields & FieldValues>(
  form: UseFormReturn<T>,
  watched: PaymentFormFields,
) {
  const set = (name: keyof PaymentFormFields, value: string) => {
    form.setValue(name as Path<T>, value as T[Path<T>], {
      shouldValidate: true,
      shouldDirty: true,
    })
  }
  const { bankOptions, isLoading: banksLoading } = usePaymentBanksQuery()
  const { providerOptions, isLoading: providersLoading } = useMobileMoneyProvidersQuery()

  const isMobileMoney = watched.payment_method === 'mobile_money'
  const isBank = watched.payment_method === 'bank'

  const bankCode = (watched.sort_swift_code || watched.sort_code || '').trim()

  const momoLookup = useMobileMoneyAccountLookup({
    enabled: isMobileMoney,
    rawPhone: watched.mobile_money_number || '',
    provider: watched.mobile_money_provider,
  })

  const bankLookup = useBankAccountLookup({
    enabled: isBank,
    accountNumber: watched.account_number || '',
    bankCode,
  })

  useEffect(() => {
    if (!isMobileMoney || !momoLookup.accountName) return
    set('account_name', momoLookup.accountName)
  }, [form, isMobileMoney, momoLookup.accountName])

  useEffect(() => {
    if (!isBank || !bankLookup.accountName) return
    set('account_name', bankLookup.accountName)
  }, [form, isBank, bankLookup.accountName])

  const handleBankSelect = (bankCodeValue: string) => {
    const match = bankOptions.find((b) => b.code === bankCodeValue)
    if (!match) return
    form.setValue('bank_name' as Path<T>, match.name as T[Path<T>], { shouldDirty: true })
    const values = form.getValues() as PaymentFormFields
    if ('sort_swift_code' in values) {
      set('sort_swift_code', match.code)
    }
    if ('sort_code' in values) {
      set('sort_code', match.code)
    }
  }

  return {
    bankOptions,
    providerOptions,
    banksLoading,
    providersLoading,
    momoLookup,
    bankLookup,
    handleBankSelect,
    selectedBankCode: bankCode,
  }
}
