import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import type { Branch } from '@/utils/schemas'
import {
  BranchPaymentDetailsSchema,
  type BranchPaymentDetailsFormData,
} from '@/utils/schemas/vendor/branches'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { vendorQueries } from '@/features/dashboard/vendor/hooks/useVendorQueries'
import { GHANA_BANKS } from '@/assets/data/banks'
import { useCountriesData } from '@/hooks'
import type { UpdateBranchPaymentDetailsPayload, AddBranchPaymentDetailsPayload } from '@/types'

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

const DEFAULT_PAYMENT_VALUES: BranchPaymentDetailsFormData = {
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

export function useBranchDetailsModal() {
  const modal = usePersistedModalState<Branch>({ paramName: MODALS.BRANCH.VIEW })

  const branch = modal.modalData ?? null

  const { useUpdateBranchPaymentDetailsService, useAddBranchPaymentDetailsService } =
    useVendorMutations()
  const { mutateAsync: updateBranchPaymentDetails, isPending: isUpdatingPaymentDetails } =
    useUpdateBranchPaymentDetailsService()
  const { mutateAsync: addBranchPaymentDetails, isPending: isAddingPaymentDetails } =
    useAddBranchPaymentDetailsService()

  const { useGetBranchPaymentDetailsService } = vendorQueries()
  const { data: paymentDetailsResponse, isLoading: isLoadingPaymentDetails } =
    useGetBranchPaymentDetailsService(branch?.id || null)

  const { countries } = useCountriesData()

  const mobileMoneyAccounts = React.useMemo(
    () => paymentDetailsResponse?.mobile_money_accounts || [],
    [paymentDetailsResponse],
  )
  const bankAccounts = React.useMemo(
    () => paymentDetailsResponse?.bank_accounts || [],
    [paymentDetailsResponse],
  )

  const [isEditing, setIsEditing] = React.useState(false)
  const [editedBranch, setEditedBranch] = React.useState(branch)
  const [isEditingPayment, setIsEditingPayment] = React.useState(false)

  const initialPaymentValues = React.useMemo((): BranchPaymentDetailsFormData => {
    if (mobileMoneyAccounts.length > 0) {
      const account = mobileMoneyAccounts[0]
      return {
        payment_method: 'mobile_money',
        mobile_money_provider: account.provider || '',
        mobile_money_number: formatMomoNumberForInput(account.momo_number || ''),
        bank_name: '',
        bank_branch: '',
        account_holder_name: '',
        account_number: '',
        swift_code: '',
        sort_code: '',
      }
    }
    if (bankAccounts.length > 0) {
      const account = bankAccounts[0]
      return {
        payment_method: 'bank',
        mobile_money_provider: '',
        mobile_money_number: '',
        bank_name: account.bank_name || '',
        bank_branch: account.bank_branch || '',
        account_holder_name: account.account_holder_name || '',
        account_number: account.account_number || '',
        swift_code: account.swift_code || '',
        sort_code: account.sort_code || '',
      }
    }
    return { ...DEFAULT_PAYMENT_VALUES }
  }, [mobileMoneyAccounts, bankAccounts])

  const paymentForm = useForm<BranchPaymentDetailsFormData>({
    resolver: zodResolver(BranchPaymentDetailsSchema),
    defaultValues: initialPaymentValues,
  })

  const paymentMethod = useWatch({ control: paymentForm.control, name: 'payment_method' })

  React.useEffect(() => {
    setEditedBranch(branch)
  }, [branch])

  const isModalOpen = modal.isModalOpen(MODALS.BRANCH.VIEW)
  const prevModalOpenRef = React.useRef(false)
  const initialPaymentValuesRef = React.useRef(initialPaymentValues)

  React.useEffect(() => {
    initialPaymentValuesRef.current = initialPaymentValues
  }, [initialPaymentValues])

  React.useEffect(() => {
    if (isModalOpen && !prevModalOpenRef.current) {
      paymentForm.reset(initialPaymentValuesRef.current)
    }
    prevModalOpenRef.current = isModalOpen
  }, [isModalOpen, paymentForm])

  const prevIsEditingPaymentRef = React.useRef(isEditingPayment)
  React.useEffect(() => {
    if (prevIsEditingPaymentRef.current && !isEditingPayment) {
      paymentForm.reset(initialPaymentValuesRef.current)
    }
    prevIsEditingPaymentRef.current = isEditingPayment
  }, [isEditingPayment, paymentForm])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    setIsEditing(false)
    setIsEditingPayment(false)
    paymentForm.reset(initialPaymentValuesRef.current)
  }, [modal, paymentForm])

  const openDeletePaymentDetailsModal = React.useCallback(() => {
    if (branch) modal.openModal(MODALS.BRANCH.DELETE_PAYMENT_DETAILS, branch)
  }, [branch, modal])

  const handleSavePaymentDetails = React.useCallback(
    async (data: BranchPaymentDetailsFormData) => {
      if (!branch?.id) return
      try {
        const hasExistingPaymentDetails = mobileMoneyAccounts.length > 0 || bankAccounts.length > 0

        if (!hasExistingPaymentDetails) {
          const payload: AddBranchPaymentDetailsPayload = {
            branch_id: Number(branch.id),
            payment_method: data.payment_method || 'mobile_money',
          }
          if (
            data.payment_method === 'mobile_money' &&
            data.mobile_money_provider &&
            data.mobile_money_number
          ) {
            payload.mobile_money_provider = data.mobile_money_provider
            payload.mobile_money_number = data.mobile_money_number
          } else if (data.payment_method === 'bank') {
            payload.bank_name = data.bank_name || ''
            payload.branch = data.bank_branch || ''
            payload.account_name = data.account_holder_name || ''
            payload.account_number = data.account_number || ''
            payload.sort_code = data.sort_code || ''
            payload.swift_code = data.swift_code || ''
          }
          await addBranchPaymentDetails(payload)
        } else {
          if (!data.payment_method) throw new Error('Payment method is required')
          const payload: UpdateBranchPaymentDetailsPayload = {
            branch_id: Number(branch.id),
            payment_method: data.payment_method,
          }
          if (data.payment_method === 'mobile_money') {
            payload.mobile_money_provider = data.mobile_money_provider
            payload.mobile_money_number = data.mobile_money_number
          } else if (data.payment_method === 'bank') {
            payload.bank_name = data.bank_name
            payload.branch = data.bank_branch
            payload.account_name = data.account_holder_name
            payload.account_number = data.account_number
            payload.sort_code = data.sort_code
            payload.swift_code = data.swift_code
          }
          await updateBranchPaymentDetails(payload)
        }
        setIsEditingPayment(false)
        paymentForm.reset(initialPaymentValuesRef.current)
      } catch (error) {
        console.error('Failed to save branch payment details:', error)
      }
    },
    [
      branch?.id,
      mobileMoneyAccounts.length,
      bankAccounts.length,
      addBranchPaymentDetails,
      updateBranchPaymentDetails,
      paymentForm,
    ],
  )

  const cancelPaymentEdit = React.useCallback(() => {
    setIsEditingPayment(false)
    paymentForm.reset(initialPaymentValuesRef.current)
  }, [paymentForm])

  const bankOptions = React.useMemo(
    () => GHANA_BANKS.map((bank) => ({ label: bank.name, value: bank.name })),
    [],
  )

  return {
    modal,
    branch,
    isEditing,
    editedBranch,
    setEditedBranch,
    setIsEditing,
    isEditingPayment,
    setIsEditingPayment,
    openDeletePaymentDetailsModal,
    paymentForm,
    paymentMethod,
    mobileMoneyAccounts,
    bankAccounts,
    isLoadingPaymentDetails,
    isUpdatingPaymentDetails,
    isAddingPaymentDetails,
    handleCloseModal,
    handleSavePaymentDetails,
    cancelPaymentEdit,
    mobileMoneyProviders: MOBILE_MONEY_PROVIDERS,
    bankOptions,
    countries,
  }
}
