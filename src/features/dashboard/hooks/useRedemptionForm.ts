import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRedemptionMutation } from './redemption/useRedemptionMutation'
import { useRedemptionQueries } from './redemption/useRedemptionQueries'
import { useAuthStore } from '@/stores'
import { detectMobileMoneyProvider, convertToInternationalFormat } from '../services/redemptions'
import type { VendorSearchResult } from '../services/redemptions'

export type CardType = 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'

export function useRedemptionForm() {
  const { user } = useAuthStore()
  const userPhone = (user as any)?.phonenumber || (user as any)?.phone || ''

  const {
    useValidateVendorMobileMoneyService,
    useProcessDashProRedemptionForUserService,
    useProcessUserRedemptionCardsService,
  } = useRedemptionMutation()

  const {
    useSearchVendorsService,
    useGetRedemptionsAmountDashProService,
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashXService,
    useGetRedemptionsAmountDashPassService,
  } = useRedemptionQueries()

  const validateVendorMutation = useValidateVendorMobileMoneyService()
  const dashProMutation = useProcessDashProRedemptionForUserService()
  const cardsMutation = useProcessUserRedemptionCardsService()

  // Stable mutate reference for use in effects
  const { mutate: validateMutate } = validateVendorMutation

  // Form state
  const [cardType, setCardType] = useState<CardType>('DashPro')
  const [redemptionAmount, setRedemptionAmount] = useState<number | null>(null)

  // DashPro: vendor identified by mobile money phone number
  const [rawVendorPhone, setRawVendorPhone] = useState('')
  const [debouncedVendorPhone, setDebouncedVendorPhone] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorPhoneError, setVendorPhoneError] = useState<string | null>(null)
  const [vendorPhoneName, setVendorPhoneName] = useState<string | null>(null)

  // Vendor-scoped cards: vendor identified via search
  const [vendorSearch, setVendorSearch] = useState('')
  const [debouncedVendorSearch, setDebouncedVendorSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null)

  // UI state
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [redemptionReferenceId, setRedemptionReferenceId] = useState<string | null>(null)

  const isVendorScoped = cardType !== 'DashPro'

  // Vendor search query (enabled when search term is present and card is vendor-scoped)
  const vendorSearchQuery = useSearchVendorsService(
    isVendorScoped && debouncedVendorSearch.length >= 2
      ? { search: debouncedVendorSearch }
      : undefined,
  )

  // Scope params for vendor-scoped balance queries
  const scopeParams = selectedVendor ? { vendor_id: selectedVendor.vendor_id } : undefined

  // All four balance queries called unconditionally (React hooks rules)
  const dashProQuery = useGetRedemptionsAmountDashProService()
  const dashGoQuery = useGetRedemptionsAmountDashGoService(
    cardType === 'DashGo' ? scopeParams : undefined,
  )
  const dashXQuery = useGetRedemptionsAmountDashXService(
    cardType === 'DashX' ? scopeParams : undefined,
  )
  const dashPassQuery = useGetRedemptionsAmountDashPassService(
    cardType === 'DashPass' ? scopeParams : undefined,
  )

  const activeBalanceQuery = {
    DashPro: dashProQuery,
    DashGo: dashGoQuery,
    DashX: dashXQuery,
    DashPass: dashPassQuery,
  }[cardType]

  const availableBalance: number | null = (activeBalanceQuery.data as any)?.balance ?? null
  const balanceLoading = activeBalanceQuery.isLoading || activeBalanceQuery.isFetching
  const balanceError: string | null = activeBalanceQuery.isError
    ? ((activeBalanceQuery.error as any)?.message ?? 'Failed to fetch balance')
    : null

  // Reset vendor/amount state when card type changes — handled in setCardType wrapper
  // so we don't need a useEffect that lists cardType as a trigger-only dependency.
  const handleCardTypeChange = useCallback((newType: CardType) => {
    setCardType(newType)
    setRawVendorPhone('')
    setDebouncedVendorPhone('')
    setVendorPhoneName(null)
    setVendorPhoneError(null)
    setVendorSearch('')
    setDebouncedVendorSearch('')
    setSelectedVendor(null)
    setRedemptionAmount(null)
  }, [])

  // Debounce vendor phone (DashPro)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVendorPhone(rawVendorPhone), 800)
    return () => clearTimeout(timer)
  }, [rawVendorPhone])

  // Validate vendor mobile money (DashPro only)
  useEffect(() => {
    if (cardType !== 'DashPro') return

    if (!debouncedVendorPhone || debouncedVendorPhone.length < 10) {
      setVendorPhoneName(null)
      setVendorPhoneError(null)
      setValidatingVendor(false)
      return
    }

    const provider = detectMobileMoneyProvider(debouncedVendorPhone)
    if (!provider) {
      setVendorPhoneError(
        'Unable to detect mobile money provider. Please enter a valid Ghana phone number.',
      )
      setVendorPhoneName(null)
      setValidatingVendor(false)
      return
    }

    setValidatingVendor(true)
    setVendorPhoneError(null)
    setVendorPhoneName(null)

    validateMutate(
      { phone_number: convertToInternationalFormat(debouncedVendorPhone), provider },
      {
        onSuccess: (response: any) => {
          const data = response?.data
          const name = data?.vendor_name || data?.account_name
          if (name) {
            setVendorPhoneName(name)
            setVendorPhoneError(null)
          } else {
            setVendorPhoneError(
              response?.message || 'Vendor not found. Please check the phone number.',
            )
            setVendorPhoneName(null)
          }
          setValidatingVendor(false)
        },
        onError: (err: any) => {
          setVendorPhoneError(err?.message || 'Vendor not found. Please check the phone number.')
          setVendorPhoneName(null)
          setValidatingVendor(false)
        },
      },
    )
  }, [debouncedVendorPhone, cardType, validateMutate])

  // Debounce vendor search (vendor-scoped cards)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedVendorSearch(vendorSearch), 500)
    return () => clearTimeout(timer)
  }, [vendorSearch])

  const handleSelectVendor = useCallback((vendor: VendorSearchResult) => {
    setSelectedVendor(vendor)
    setVendorSearch(vendor.vendor_name)
  }, [])

  const isFormValid = useMemo(() => {
    if (!redemptionAmount || redemptionAmount <= 0) return false
    if (availableBalance === null || redemptionAmount > availableBalance) return false
    if (!userPhone) return false

    if (cardType === 'DashPro') {
      return !!(vendorPhoneName && !vendorPhoneError)
    }
    return !!selectedVendor
  }, [cardType, redemptionAmount, availableBalance, vendorPhoneName, vendorPhoneError, selectedVendor, userPhone])

  const clearForm = useCallback(() => {
    setRedemptionAmount(null)
    setRawVendorPhone('')
    setDebouncedVendorPhone('')
    setVendorPhoneName(null)
    setVendorPhoneError(null)
    setVendorSearch('')
    setDebouncedVendorSearch('')
    setSelectedVendor(null)
    setRedemptionReferenceId(null)
  }, [])

  const submitRedemption = useCallback(async () => {
    if (!isFormValid || !redemptionAmount) return

    try {
      if (cardType === 'DashPro') {
        const result = await dashProMutation.mutateAsync({
          vendor_phone_number: convertToInternationalFormat(rawVendorPhone),
          amount: redemptionAmount,
          user_phone_number: convertToInternationalFormat(userPhone),
        })
        if (result?.data?.reference_id) setRedemptionReferenceId(result.data.reference_id)
        setShowSummaryModal(true)
      } else {
        if (!selectedVendor) return
        const result = await cardsMutation.mutateAsync({
          vendor_id: selectedVendor.vendor_id,
          card_type: cardType,
          amount: redemptionAmount,
        })
        if (result?.data?.reference_id) setRedemptionReferenceId(result.data.reference_id)
        setShowSummaryModal(true)
      }
    } catch {
      // Errors are surfaced by the mutation's onError toast
    }
  }, [isFormValid, cardType, redemptionAmount, rawVendorPhone, userPhone, selectedVendor, dashProMutation, cardsMutation])

  return {
    // Card type
    cardType,
    setCardType: handleCardTypeChange,
    // Amount
    redemptionAmount,
    setRedemptionAmount,
    // DashPro vendor
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor: validatingVendor || validateVendorMutation.isPending,
    vendorPhoneError,
    vendorPhoneName,
    // Vendor-scoped
    vendorSearch,
    setVendorSearch,
    vendorSearchResults: ((vendorSearchQuery.data as any)?.data ?? []) as VendorSearchResult[],
    isSearchingVendors: vendorSearchQuery.isFetching,
    selectedVendor,
    handleSelectVendor,
    // Balance (from recipient-amounts)
    availableBalance,
    balanceLoading,
    balanceError,
    // Submission
    isFormValid,
    isSubmitting: dashProMutation.isPending || cardsMutation.isPending,
    submitRedemption,
    clearForm,
    // Summary modal
    showSummaryModal,
    setShowSummaryModal,
    redemptionReferenceId,
  }
}
