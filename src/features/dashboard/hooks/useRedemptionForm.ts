import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRedemptionQueries } from './useRedemptionQueries'
import { useAuthStore } from '@/stores'

interface RedemptionForm {
  redemptionAmount: number | null
  vendorPhone: string
  cardType?: 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'
}

export function useRedemptionForm() {
  const { user } = useAuthStore()
  const userPhone = (user as any)?.phonenumber || (user as any)?.phone || ''

  const {
    useValidateVendorMobileMoneyService,
    useGetCardBalanceService,
    useProcessDashProRedemptionService,
    useProcessCardsRedemptionService,
  } = useRedemptionQueries()

  const validateVendorMutation = useValidateVendorMobileMoneyService()
  const getBalanceMutation = useGetCardBalanceService()
  const dashProRedemptionMutation = useProcessDashProRedemptionService()
  const cardsRedemptionMutation = useProcessCardsRedemptionService()

  const [form, setForm] = useState<RedemptionForm>({
    redemptionAmount: null,
    vendorPhone: '',
    cardType: undefined,
  })
  const [rawVendor, setRawVendor] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorError, setVendorError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceCheckComplete, setBalanceCheckComplete] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [redemptionReferenceId, setRedemptionReferenceId] = useState<string | null>(null)

  // Validate vendor phone number
  useEffect(() => {
    if (rawVendor && rawVendor.length >= 10) {
      setValidatingVendor(true)
      setVendorError(null)
      setVendorName(null)

      // Extract phone number (remove country code prefix if present)
      const phoneNumber = rawVendor.replace(/^\+?233/, '').replace(/\D/g, '')

      validateVendorMutation.mutate(
        { phone_number: phoneNumber },
        {
          onSuccess: (response: any) => {
            const vendorData = response?.data
            if (vendorData?.vendor_name) {
              setVendorName(vendorData.vendor_name)
              setVendorError(null)
              setForm((prev) => ({ ...prev, vendorPhone: phoneNumber }))
            } else {
              setVendorError(
                response?.message || 'Vendor not found. Please check the phone number.',
              )
              setVendorName(null)
            }
            setValidatingVendor(false)
          },
          onError: (error: any) => {
            setVendorError(error?.message || 'Vendor not found. Please check the phone number.')
            setVendorName(null)
            setValidatingVendor(false)
          },
        },
      )
    } else if (rawVendor && rawVendor.length > 0 && rawVendor.length < 10) {
      setVendorName(null)
      setVendorError(null)
      setValidatingVendor(false)
    } else {
      setVendorName(null)
      setVendorError(null)
      setValidatingVendor(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawVendor])

  // Check balance when amount is entered
  useEffect(() => {
    if (form.redemptionAmount && form.redemptionAmount > 0 && userPhone) {
      setBalanceCheckComplete(false)
      setBalanceError(null)

      // Extract phone number (remove country code prefix if present)
      const phoneNumber = userPhone.replace(/^\+?233/, '').replace(/\D/g, '')

      getBalanceMutation.mutate(
        { phone_number: phoneNumber, card_type: form.cardType },
        {
          onSuccess: (response: any) => {
            const balanceData = response?.data
            if (balanceData?.balance !== undefined) {
              const availableBalance = balanceData.balance
              setBalance(availableBalance)

              if (availableBalance >= form.redemptionAmount!) {
                setBalanceError(null)
              } else {
                setBalanceError('Insufficient balance')
              }
            } else {
              setBalanceError(response?.message || 'Failed to check balance')
            }
            setBalanceCheckComplete(true)
          },
          onError: (error: any) => {
            setBalanceError(error?.message || 'Failed to check balance. Please try again.')
            setBalanceCheckComplete(true)
          },
        },
      )
    } else {
      setBalanceCheckComplete(false)
      setBalanceError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.redemptionAmount, form.cardType, userPhone])

  const isFormValid = useMemo(() => {
    return (
      vendorName !== null &&
      !vendorError &&
      form.redemptionAmount !== null &&
      form.redemptionAmount > 0 &&
      balanceCheckComplete &&
      !balanceError &&
      userPhone
    )
  }, [
    vendorName,
    vendorError,
    form.redemptionAmount,
    balanceCheckComplete,
    balanceError,
    userPhone,
  ])

  const clearForm = useCallback(() => {
    setForm({
      redemptionAmount: null,
      vendorPhone: '',
      cardType: undefined,
    })
    setRawVendor('')
    setVendorName(null)
    setVendorError(null)
    setBalance(null)
    setBalanceCheckComplete(false)
    setBalanceError(null)
    setRedemptionReferenceId(null)
  }, [])

  const submitRedemption = useCallback(async () => {
    if (!isFormValid || !userPhone || !form.vendorPhone) return

    setIsSubmitting(true)
    try {
      // Extract phone numbers (remove country code prefix if present)
      const vendorPhoneNumber = form.vendorPhone.replace(/^\+?233/, '').replace(/\D/g, '')
      const userPhoneNumber = userPhone.replace(/^\+?233/, '').replace(/\D/g, '')

      // Determine redemption type based on card type
      // For now, we'll default to DashPro if no card type is specified
      // In the future, you might want to add a card type selector to the form
      const cardType = form.cardType || 'DashPro'

      if (cardType === 'DashPro') {
        // Process DashPro redemption
        const result = await dashProRedemptionMutation.mutateAsync({
          vendor_phone_number: vendorPhoneNumber,
          amount: form.redemptionAmount!,
          user_phone_number: userPhoneNumber,
        })

        if (result?.data?.reference_id) {
          setRedemptionReferenceId(result.data.reference_id)
          setShowSummaryModal(true)
        }
      } else {
        // Process cards redemption (DashGo, DashX, DashPass)
        const result = await cardsRedemptionMutation.mutateAsync({
          card_type: cardType,
          phone_number: userPhoneNumber,
        })

        if (result?.data?.reference_id) {
          setRedemptionReferenceId(result.data.reference_id)
          setShowSummaryModal(true)
        }
      }
    } catch (error: any) {
      console.error('Redemption submission error:', error)
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isFormValid,
    userPhone,
    form.vendorPhone,
    form.redemptionAmount,
    form.cardType,
    dashProRedemptionMutation,
    cardsRedemptionMutation,
  ])

  return {
    form,
    rawVendor,
    setRawVendor,
    validatingVendor: validatingVendor || validateVendorMutation.isPending,
    vendorError,
    vendorName,
    isFormValid,
    isSubmitting:
      isSubmitting || dashProRedemptionMutation.isPending || cardsRedemptionMutation.isPending,
    submitRedemption,
    clearForm,
    balance,
    balanceCheckComplete: balanceCheckComplete || getBalanceMutation.isPending,
    balanceError,
    showSummaryModal,
    setShowSummaryModal,
    setForm,
    redemptionReferenceId,
  }
}
