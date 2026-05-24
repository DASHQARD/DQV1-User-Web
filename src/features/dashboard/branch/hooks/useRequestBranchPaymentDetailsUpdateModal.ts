import { useCallback, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast, useCountriesData } from '@/hooks'
import {
  BranchPaymentDetailsSchema,
  type BranchPaymentDetailsFormData,
} from '@/utils/schemas/vendor/branches'
import { GHANA_BANKS } from '@/assets/data/banks'
import { buildBranchPaymentDetailsRequestUpdatePayload } from '@/features/dashboard/utils/buildBranchPaymentDetailsRequestUpdatePayload'
import { useBranchMutations } from './useBranchMutatation'
import type { BranchInfoResponse } from '../services'

const MOBILE_MONEY_PROVIDERS = [
  { label: 'MTN', value: 'mtn' },
  { label: 'Vodafone', value: 'vodafone' },
  { label: 'AirtelTigo', value: 'airteltigo' },
]

function formatMomoNumberForInput(momo_number: string): string {
  if (!momo_number) return ''
  const digitsOnly = momo_number.replace(/\D/g, '')
  let localNumber = digitsOnly
  if (digitsOnly.startsWith('233')) localNumber = digitsOnly.slice(3)
  else if (digitsOnly.startsWith('0')) localNumber = digitsOnly.slice(1)
  return localNumber ? `+233-${localNumber}` : ''
}

function paymentDetailsToFormValues(
  paymentDetails: BranchInfoResponse['data']['payment_details'],
): BranchPaymentDetailsFormData {
  if (paymentDetails?.momo_number) {
    return {
      payment_method: 'mobile_money',
      mobile_money_provider: paymentDetails.provider || '',
      mobile_money_number: formatMomoNumberForInput(paymentDetails.momo_number),
      bank_name: '',
      bank_branch: '',
      account_holder_name: '',
      account_number: '',
      swift_code: '',
      sort_code: '',
    }
  }

  if (paymentDetails?.account_number) {
    return {
      payment_method: 'bank',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: paymentDetails.bank_name || '',
      bank_branch: paymentDetails.bank_branch || '',
      account_holder_name: paymentDetails.account_holder_name || '',
      account_number: paymentDetails.account_number,
      swift_code: paymentDetails.swift_code || '',
      sort_code: paymentDetails.sort_code || '',
    }
  }

  return {
    payment_method: 'mobile_money',
    mobile_money_provider: '',
    mobile_money_number: '',
    bank_name: '',
    bank_branch: '',
    account_holder_name: '',
    account_number: '',
    swift_code: '',
    sort_code: '',
  }
}

export function useRequestBranchPaymentDetailsUpdateModal(
  isOpen: boolean,
  onClose: () => void,
  branchInfo: BranchInfoResponse['data'] | null | undefined,
) {
  const toast = useToast()
  const { countries } = useCountriesData()
  const { useRequestBranchPaymentDetailsUpdateService } = useBranchMutations()
  const { mutateAsync: requestBranchPaymentDetailsUpdate, isPending: isRequesting } =
    useRequestBranchPaymentDetailsUpdateService()

  const initialValues = useMemo(
    () => paymentDetailsToFormValues(branchInfo?.payment_details ?? null),
    [branchInfo?.payment_details],
  )

  const form = useForm<BranchPaymentDetailsFormData>({
    resolver: zodResolver(BranchPaymentDetailsSchema),
    defaultValues: initialValues,
  })

  const paymentMethod = useWatch({ control: form.control, name: 'payment_method' })

  useEffect(() => {
    if (isOpen) {
      form.reset(initialValues)
    }
  }, [isOpen, initialValues, form])

  const bankOptions = useMemo(
    () => GHANA_BANKS.map((bank) => ({ label: bank.name, value: bank.name })),
    [],
  )

  const handleClose = useCallback(() => {
    form.reset(initialValues)
    onClose()
  }, [form, initialValues, onClose])

  const handleSetIsOpen = useCallback(
    (open: boolean) => {
      if (!open) handleClose()
    },
    [handleClose],
  )

  const handleRequestUpdate = useCallback(
    async (data: BranchPaymentDetailsFormData) => {
      if (!branchInfo?.payment_details) {
        toast.error('No payment details on file to update.')
        return
      }

      try {
        await requestBranchPaymentDetailsUpdate({
          proposed_data: buildBranchPaymentDetailsRequestUpdatePayload(data),
        })
        handleClose()
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to submit payment update request. Please try again.'
        toast.error(message)
      }
    },
    [branchInfo?.payment_details, requestBranchPaymentDetailsUpdate, handleClose, toast],
  )

  return {
    form,
    paymentMethod,
    isRequesting,
    countries,
    bankOptions,
    mobileMoneyProviders: MOBILE_MONEY_PROVIDERS,
    hasPaymentDetails: Boolean(branchInfo?.payment_details),
    handleClose,
    handleSetIsOpen,
    handleRequestUpdate,
  }
}
