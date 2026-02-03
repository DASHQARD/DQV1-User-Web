import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { useCountriesData } from '@/hooks'
import { GHANA_BANKS } from '@/assets/data/banks'
import { PaymentDetailsSchema } from '@/utils/schemas/payment'
import { MOBILE_MONEY_PROVIDERS } from '@/utils/constants'

export type PaymentDetailsFormData = z.infer<typeof PaymentDetailsSchema>

export function usePaymentDetailsSettings() {
  const { useUpdatePaymentDetailsService, useDeletePaymentDetailsService } = corporateMutations()
  const { mutateAsync: updatePaymentDetails, isPending: isUpdating } =
    useUpdatePaymentDetailsService()
  const { mutateAsync: deletePaymentDetails, isPending: isDeleting } =
    useDeletePaymentDetailsService()
  const { useGetPaymentDetailsService } = corporateQueries()
  const { data: paymentDetailsResponse } = useGetPaymentDetailsService()
  const { countries } = useCountriesData()
  const paymentDetailsData = paymentDetailsResponse?.data || paymentDetailsResponse || {}

  const bankAccounts = useMemo(
    () => paymentDetailsData?.bank_accounts || [],
    [paymentDetailsData?.bank_accounts],
  )
  const mobileMoneyAccounts = useMemo(
    () => paymentDetailsData?.mobile_money_accounts || [],
    [paymentDetailsData?.mobile_money_accounts],
  )
  const hasPaymentDetails = bankAccounts.length > 0 || mobileMoneyAccounts.length > 0
  const defaultPaymentOption = paymentDetailsData?.default_payment_option || 'mobile_money'

  const initialValues = useMemo(() => {
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

  const form = useForm<PaymentDetailsFormData>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues: initialValues,
  })

  const paymentDetailsKey = useMemo(() => {
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

  const prevKeyRef = useRef<string>('')

  useEffect(() => {
    if (prevKeyRef.current !== paymentDetailsKey) {
      form.reset(initialValues)
      prevKeyRef.current = paymentDetailsKey
    }
    // Only run when payment details source actually changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDetailsKey])

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const bankOptions = useMemo(
    () =>
      GHANA_BANKS.map((bank) => ({
        label: bank.name,
        value: bank.name,
      })),
    [],
  )

  const onSubmit = async (data: PaymentDetailsFormData) => {
    try {
      const payload: Record<string, unknown> = {
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
      await updatePaymentDetails(payload as any)
    } catch (error) {
      console.error('Failed to update payment details:', error)
    }
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deletePaymentDetails()
      form.reset(initialValues)
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Failed to delete payment details:', error)
    }
  }

  return {
    form,
    onSubmit,
    handleDelete,
    isUpdating,
    isDeleting,
    hasPaymentDetails,
    paymentMethod,
    mobileMoneyProviders: MOBILE_MONEY_PROVIDERS,
    bankOptions,
    countries,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
  }
}
