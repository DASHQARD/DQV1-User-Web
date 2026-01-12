import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRedemptionMutation } from './redemption/useRedemptionMutation'
import { useAuthStore } from '@/stores'
import { detectMobileMoneyProvider, convertToInternationalFormat } from '../services/redemptions'

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
  } = useRedemptionMutation()

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
  const [debouncedVendor, setDebouncedVendor] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorError, setVendorError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceCheckComplete, setBalanceCheckComplete] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [redemptionReferenceId, setRedemptionReferenceId] = useState<string | null>(null)

  // Debounce vendor phone number input - only validate after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVendor(rawVendor)
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timer)
  }, [rawVendor])

  // Validate vendor phone number only after debounce
  useEffect(() => {
    if (debouncedVendor && debouncedVendor.length >= 10) {
      setValidatingVendor(true)
      setVendorError(null)
      setVendorName(null)

      // Extract phone number and detect provider
      const internationalPhone = convertToInternationalFormat(debouncedVendor)
      const provider = detectMobileMoneyProvider(debouncedVendor)

      if (!provider) {
        setVendorError(
          'Unable to detect mobile money provider. Please enter a valid Ghana phone number.',
        )
        setVendorName(null)
        setValidatingVendor(false)
        return
      }

      validateVendorMutation.mutate(
        { phone_number: internationalPhone, provider },
        {
          onSuccess: (response: any) => {
            const vendorData = response?.data
            if (vendorData?.vendor_name) {
              setVendorName(vendorData.vendor_name)
              setVendorError(null)
              setForm((prev) => ({ ...prev, vendorPhone: rawVendor }))
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
    } else if (debouncedVendor && debouncedVendor.length > 0 && debouncedVendor.length < 10) {
      setVendorName(null)
      setVendorError(null)
      setValidatingVendor(false)
    } else if (!debouncedVendor) {
      setVendorName(null)
      setVendorError(null)
      setValidatingVendor(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedVendor])

  // Check balance when amount is entered
  useEffect(() => {
    if (form.redemptionAmount && form.redemptionAmount > 0 && rawVendor) {
      setBalanceCheckComplete(false)
      setBalanceError(null)

      // Extract phone number in international format
      const internationalPhone = convertToInternationalFormat(rawVendor)

      getBalanceMutation.mutate(
        { phone_number: internationalPhone, card_type: form.cardType },
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
  }, [form.redemptionAmount, form.cardType, rawVendor])

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

  const submitRedemption = useCallback(
    async (token?: string) => {
      if (!isFormValid || !userPhone || !form.vendorPhone) return

      setIsSubmitting(true)
      try {
        // Extract phone numbers (remove country code prefix if present)

        // Determine redemption type based on card type
        // For now, we'll default to DashPro if no card type is specified
        // In the future, you might want to add a card type selector to the form
        const cardType = form.cardType || 'DashPro'

        if (cardType === 'DashPro') {
          // Process DashPro redemption
          const vendorInternationalPhone = convertToInternationalFormat(rawVendor)
          const userInternationalPhone = convertToInternationalFormat(userPhone)

          if (!token) {
            throw new Error('OTP token is required for DashPro redemption')
          }

          const result = await dashProRedemptionMutation.mutateAsync({
            vendor_phone_number: vendorInternationalPhone,
            amount: form.redemptionAmount!,
            user_phone_number: userInternationalPhone,
            token: token,
          })

          if (result?.data?.reference_id) {
            setRedemptionReferenceId(result.data.reference_id)
            setShowSummaryModal(true)
          }
        } else {
          // Process cards redemption (DashGo, DashX, DashPass)
          // Note: CardsRedemptionPayload requires branch_id, card_id, and amount
          // This implementation is incomplete - the form needs to collect these fields
          // For now, we'll log an error as this requires additional form fields
          console.error(
            'Cards redemption requires branch_id, card_id, and amount. These fields are not currently collected in the form.',
          )
          throw new Error(
            'Cards redemption is not fully implemented. Missing required fields: branch_id, card_id.',
          )
        }
      } catch (error: any) {
        console.error('Redemption submission error:', error)
        // Error handling is done in the mutation's onError callback
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      isFormValid,
      userPhone,
      form.vendorPhone,
      form.redemptionAmount,
      form.cardType,
      rawVendor,
      dashProRedemptionMutation,
    ],
  )

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
