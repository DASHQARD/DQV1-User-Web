import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRedemptionMutation } from './redemption/useRedemptionMutation'
import { useRedemptionQueries } from './redemption/useRedemptionQueries'
import { useAuthStore } from '@/stores'
import { convertToInternationalFormat } from '../services/redemptions'
import type { VendorSearchResult } from '../services/redemptions'
import { buildCardsRedemptionPayload } from '@/features/website/utils/cardsRedemption'
import { pickGuestRedemptionCardId } from '@/features/website/utils/guestRedemption'
import { resolveRecipientAmountPreviewImageUrl } from '@/features/website/utils/recipientAmountCardImages'
import { useMobileMoneyAccountLookup } from '@/hooks/useMobileMoneyAccountLookup'

export type CardType = 'DashPro' | 'DashGo' | 'DashX' | 'DashPass'

export function useRedemptionForm() {
  const { user } = useAuthStore()
  const userPhone = (user as any)?.phonenumber || (user as any)?.phone || ''

  const {
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

  const dashProMutation = useProcessDashProRedemptionForUserService()
  const cardsMutation = useProcessUserRedemptionCardsService()

  // Form state
  const [cardType, setCardType] = useState<CardType>('DashPro')
  const [redemptionAmount, setRedemptionAmount] = useState<number | null>(null)

  // DashPro: vendor identified by mobile money phone number
  const [rawVendorPhone, setRawVendorPhone] = useState('')

  const {
    accountName: vendorPhoneName,
    error: vendorPhoneError,
    isResolving: validatingVendor,
    isVerified: isVendorPhoneVerified,
    resolvedProvider,
    reset: resetMomoLookup,
  } = useMobileMoneyAccountLookup({
    enabled: cardType === 'DashPro',
    rawPhone: rawVendorPhone,
  })

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

  const cardPreviewImageUrl = useMemo(
    () => resolveRecipientAmountPreviewImageUrl(activeBalanceQuery.data),
    [activeBalanceQuery.data],
  )

  const handleCardTypeChange = useCallback((newType: CardType) => {
    setCardType(newType)
    setRawVendorPhone('')
    resetMomoLookup()
    setVendorSearch('')
    setDebouncedVendorSearch('')
    setSelectedVendor(null)
    setRedemptionAmount(null)
  }, [resetMomoLookup])

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
      return isVendorPhoneVerified
    }
    return !!selectedVendor
  }, [cardType, redemptionAmount, availableBalance, isVendorPhoneVerified, selectedVendor, userPhone])

  const clearForm = useCallback(() => {
    setRedemptionAmount(null)
    setRawVendorPhone('')
    resetMomoLookup()
    setVendorSearch('')
    setDebouncedVendorSearch('')
    setSelectedVendor(null)
    setRedemptionReferenceId(null)
  }, [resetMomoLookup])

  const submitRedemption = useCallback(async () => {
    if (!isFormValid || !redemptionAmount) return

    try {
      if (cardType === 'DashPro') {
        if (!resolvedProvider) return
        const result = await dashProMutation.mutateAsync({
          vendor_phone_number: convertToInternationalFormat(rawVendorPhone),
          amount: redemptionAmount,
          user_phone_number: convertToInternationalFormat(userPhone),
          provider: resolvedProvider,
        })
        if (result?.data?.reference_id) setRedemptionReferenceId(result.data.reference_id)
        setShowSummaryModal(true)
      } else {
        if (!selectedVendor?.gvid) return
        const branchId = selectedVendor.branches?.[0]?.id
        if (!branchId) return
        if (cardType === 'DashX' || cardType === 'DashPass') return
        const dashGoCards =
          (dashGoQuery.data as { data?: { cards?: unknown[] }; cards?: unknown[] })?.data?.cards ??
          (dashGoQuery.data as { cards?: unknown[] })?.cards ??
          []
        const cardId =
          cardType === 'DashGo' ? pickGuestRedemptionCardId(dashGoCards, redemptionAmount) : ''
        if (cardType === 'DashGo' && !cardId) return
        const payload = buildCardsRedemptionPayload(
          cardType === 'DashGo'
            ? {
                branch_id: String(branchId),
                vendor_gvid: selectedVendor.gvid,
                card_type: 'DashGo',
                card_id: cardId,
                amount: redemptionAmount,
              }
            : {
                branch_id: String(branchId),
                vendor_gvid: selectedVendor.gvid,
                card_type: cardType,
                amount: redemptionAmount,
              },
        )
        const result = await cardsMutation.mutateAsync(payload)
        if (result?.data?.reference_id) setRedemptionReferenceId(result.data.reference_id)
        setShowSummaryModal(true)
      }
    } catch {
      // Errors are surfaced by the mutation's onError toast
    }
  }, [
    isFormValid,
    cardType,
    redemptionAmount,
    rawVendorPhone,
    userPhone,
    resolvedProvider,
    selectedVendor,
    dashProMutation,
    cardsMutation,
    dashGoQuery.data,
  ])

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
    validatingVendor,
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
    cardPreviewImageUrl,
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
