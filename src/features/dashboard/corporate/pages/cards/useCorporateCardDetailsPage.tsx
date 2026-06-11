import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  CARD_DISPLAY_NAMES,
  formatCardTypeForAPI,
  getValidCardType,
  type CardType,
} from '@/utils/constants/cards'
import type { DropdownOption } from '@/types'
import { formatBranchLabel } from '@/utils/format'
import { useRedemptionMutation, useCardMetricsDetails } from '@/features/dashboard/hooks'
import { buildRedemptionUrlFromCard } from '@/features/website/utils/redemptionDeepLink'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState } from '@/hooks'
import { useUserProfile } from '@/hooks'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { resolveMediaUrl } from '@/utils/cardDisplay'
import {
  getCardMetricsDisplayBalance,
  parseCardMetricsUnredeemedBalance,
  shouldShowCardMetricsBalance,
} from '@/utils/cardMetricsDisplay'

function getCardBackground(type: CardType): string {
  switch (type) {
    case 'dashx':
      return DashxBg
    case 'dashpro':
      return DashproBg
    case 'dashpass':
      return DashpassBg
    case 'dashgo':
      return DashgoBg
    default:
      return DashxBg
  }
}

export interface CardDisplayItem {
  id: string | number
  card_id?: string | number
  recipient_id?: string
  card_name: string
  name?: string
  card_type: CardType
  balance: number
  amount: number
  card_price: number
  status: string
  expiry_date?: string
  branch_id?: string
  branch_name?: string
  branch_location?: string
  vendor_id?: string
  vendor_name?: string
  gvid?: string
  currency: string
  images?: Array<{ file_url: string }>
  isAggregated?: boolean
  showBalance?: boolean
}

export function useCorporateCardDetailsPage() {
  const { cardType } = useParams<{ cardType: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const validCardType = getValidCardType(cardType)

  const [selectedCard, setSelectedCard] = useState<CardDisplayItem | null>(null)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [isProcessingRedemption, setIsProcessingRedemption] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<Record<string, unknown> | null>(null)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [paginationLimit, setPaginationLimit] = useState(10)
  const [paginationAfter, setPaginationAfter] = useState<string>('')

  const { useGetUserProfileService } = useUserProfile()
  const { data: user } = useGetUserProfileService()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { useProcessRedemptionCardsService } = useRedemptionMutation()
  const processRedemptionMutation = useProcessRedemptionCardsService()

  const cardMetricsParams = useMemo(() => {
    if (!validCardType) return undefined
    const cardTypeForAPI = formatCardTypeForAPI(validCardType)
    if (!cardTypeForAPI) return undefined
    return {
      card_type: cardTypeForAPI,
      limit: paginationLimit,
      after: paginationAfter || undefined,
    }
  }, [validCardType, paginationLimit, paginationAfter])

  const { data: cardMetricsResponse, isLoading: isLoadingCards } =
    useCardMetricsDetails(cardMetricsParams)

  const pagination = useMemo(() => {
    if (!cardMetricsResponse?.data) {
      return {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: paginationLimit,
        next: null as string | null,
        previous: null as string | null,
      }
    }
    return {
      hasNextPage: cardMetricsResponse.data.hasNextPage || false,
      hasPreviousPage: cardMetricsResponse.data.hasPreviousPage || false,
      limit: cardMetricsResponse.data.limit || paginationLimit,
      next: cardMetricsResponse.data.next || null,
      previous: cardMetricsResponse.data.previous || null,
    }
  }, [cardMetricsResponse?.data, paginationLimit])

  const { value: debouncedVendorSearch } = useDebouncedState({
    initialValue: vendorSearch,
    onChange: setVendorSearch,
    debounceTime: 500,
  })

  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    debouncedVendorSearch
      ? { search: debouncedVendorSearch, limit: 20 }
      : showVendorModal
        ? { limit: 100 }
        : undefined,
  )

  const vendors = useMemo(() => {
    if (!vendorsResponse) return []
    if (Array.isArray(vendorsResponse)) return vendorsResponse
    if (vendorsResponse && typeof vendorsResponse === 'object' && 'data' in vendorsResponse) {
      return (vendorsResponse as { data?: unknown[] }).data || []
    }
    return []
  }, [vendorsResponse])

  useEffect(() => {
    if (selectedCard?.vendor_id && vendors.length > 0 && !selectedVendor && showVendorModal) {
      const vendor = (vendors as Array<{ vendor_id?: number }>).find(
        (v) => v.vendor_id?.toString() === String(selectedCard.vendor_id),
      )
      if (vendor) {
        setSelectedVendor(vendor as Record<string, unknown>)
        setSelectedVendorId(String((vendor as { vendor_id: number }).vendor_id))
      }
    }
  }, [vendors, selectedCard, selectedVendor, showVendorModal])

  const vendorOptions: DropdownOption[] = useMemo(() => {
    return (
      vendors as Array<{ business_name?: string; vendor_name?: string; vendor_id?: number }>
    ).map((vendor) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  const availableBranches = useMemo(() => {
    if (
      !selectedVendor ||
      !(
        selectedVendor as {
          branches_with_cards?: Array<{
            branch_id: number
            branch_name?: string
            branch_location?: string
          }>
        }
      ).branches_with_cards
    )
      return []
    const branches = (
      selectedVendor as {
        branches_with_cards: Array<{
          branch_id: number
          branch_name?: string
          branch_location?: string
        }>
      }
    ).branches_with_cards
    const branchMap = new Map<
      number,
      { branch_id: number; branch_name?: string; branch_location?: string }
    >()
    branches.forEach((branch) => {
      if (branch.branch_id && !branchMap.has(branch.branch_id)) {
        branchMap.set(branch.branch_id, {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          branch_location: branch.branch_location,
        })
      }
    })
    return Array.from(branchMap.values())
  }, [selectedVendor])

  const branchOptions: DropdownOption[] = useMemo(() => {
    return availableBranches.map((branch) => ({
      label: formatBranchLabel(branch),
      value: String(branch.branch_id),
    }))
  }, [availableBranches])

  const filteredCards = useMemo((): CardDisplayItem[] => {
    if (!validCardType || isLoadingCards) return []
    const cards = cardMetricsResponse?.data?.data || []
    if (!Array.isArray(cards) || cards.length === 0) return []
    if (validCardType === 'dashpro') {
      const totalAmount = (cards as Array<{ unredeemed_amount?: string }>).reduce(
        (sum, c) => sum + parseCardMetricsUnredeemedBalance(c),
        0,
      )
      return [
        {
          id: 'dashpro-wallet',
          card_name: 'DashPro Wallet',
          balance: totalAmount,
          amount: totalAmount,
          card_price: totalAmount,
          status: 'active',
          currency: 'GHS',
          card_type: 'dashpro',
          isAggregated: true,
          showBalance: true,
        },
      ]
    }
    const showBalance = shouldShowCardMetricsBalance(validCardType)
    return (cards as unknown as Array<Record<string, unknown>>).map((card) => {
      const displayBalance = getCardMetricsDisplayBalance(
        {
          type: String(card.type ?? ''),
          unredeemed_amount: card.unredeemed_amount as string | null | undefined,
        },
        validCardType,
      )
      const balance = displayBalance ?? 0
      return {
        id: card.id,
        card_id: (card.card_id as string | number) || card.id,
        recipient_id: card.recipient_id as number | undefined,
        card_name:
          (card.product as string) ||
          (card.card_name as string) ||
          (card.name as string) ||
          `${CARD_DISPLAY_NAMES[validCardType]} Card`,
        card_type: validCardType,
        balance,
        amount: balance,
        card_price: balance,
        status: (card.status as string) || 'active',
        expiry_date: card.expiry_date as string | undefined,
        branch_id: card.branch_id as number | undefined,
        branch_name: card.branch_name as string | undefined,
        branch_location: card.branch_location as string | undefined,
        vendor_id: card.vendor_id as number | undefined,
        vendor_name: card.vendor_name as string | undefined,
        gvid: card.gvid as string | undefined,
        currency: (card.currency as string) || 'GHS',
        images: (card.images as Array<{ file_url: string }>) || [],
        showBalance,
      } as CardDisplayItem
    })
  }, [validCardType, cardMetricsResponse, isLoadingCards])

  const cardImageUrls = useMemo(() => {
    const map: Record<string, string> = {}
    filteredCards.forEach((card) => {
      const fileUrl = card.images?.[0]?.file_url
      if (fileUrl) {
        map[String(card.id ?? card.card_id)] = resolveMediaUrl(fileUrl) ?? fileUrl
      }
    })
    return map
  }, [filteredCards])

  const handleNextPage = useCallback(() => {
    if (pagination.hasNextPage && pagination.next) setPaginationAfter(pagination.next)
  }, [pagination.hasNextPage, pagination.next])

  const handlePreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) setPaginationAfter(pagination.previous || '')
  }, [pagination.hasPreviousPage, pagination.previous])

  const handlePageSizeChange = useCallback((newLimit: number) => {
    setPaginationLimit(newLimit)
    setPaginationAfter('')
  }, [])

  const handleRedeemClick = useCallback(
    (card: CardDisplayItem) => {
      navigate(
        buildRedemptionUrlFromCard({
          card_type: card.card_type,
          vendor_id: card.vendor_id,
          branch_id: card.branch_id,
          card_id: card.card_id ?? card.id,
          gvid: card.gvid,
        }),
      )
    },
    [navigate],
  )

  const handleVendorSelect = useCallback(
    (vendorId: string) => {
      const vendor = (vendors as Array<{ vendor_id?: number }>).find(
        (v) => v.vendor_id?.toString() === vendorId,
      )
      if (vendor) {
        setSelectedVendor(vendor as Record<string, unknown>)
        setSelectedVendorId(vendorId)
        setSelectedBranchId(null)
      }
    },
    [vendors],
  )

  const handleCloseVendorModal = useCallback(() => {
    setShowVendorModal(false)
    setSelectedCard(null)
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedBranchId(null)
    setVendorSearch('')
  }, [])

  const handleConfirmVendor = useCallback(() => {
    if (!selectedVendor) return
    if (
      (validCardType === 'dashx' || validCardType === 'dashpass') &&
      availableBranches.length > 0 &&
      selectedBranchId === null
    ) {
      return
    }
    setShowVendorModal(false)
    setShowRedemptionModal(true)
  }, [selectedVendor, validCardType, availableBranches.length, selectedBranchId])

  const handleConfirmRedemption = useCallback(async () => {
    if (!selectedCard || !validCardType || !user) return
    if (!agreeToTerms) return
    const userPhone =
      (user as { phonenumber?: string; phone?: string })?.phonenumber ??
      (user as { phone?: string })?.phone ??
      ''
    if (!userPhone) return
    const cardTypeForAPI = formatCardTypeForAPI(validCardType)
    if (!cardTypeForAPI) return

    let payload: {
      card_type: string
      phone_number: string
      amount: number
      branch_id: string | number
      card_id: string | number
    }
    if (validCardType === 'dashgo' || validCardType === 'dashpro') {
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: parseFloat(String(selectedCard.balance || selectedCard.amount || 0)),
        branch_id: selectedBranchId !== null ? selectedBranchId : (selectedCard.branch_id ?? ''),
        card_id: selectedCard.id,
      }
    } else {
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: selectedCard.card_price || selectedCard.balance || selectedCard.amount || 0,
        branch_id: selectedBranchId !== null ? selectedBranchId : (selectedCard.branch_id ?? ''),
        card_id: selectedCard.id,
      }
    }
    if (!payload.card_id || payload.amount <= 0) return

    setIsProcessingRedemption(true)
    try {
      const response = await processRedemptionMutation.mutateAsync(payload as any)
      if (
        (response as { status?: string })?.status === 'success' ||
        (response as { statusCode?: number })?.statusCode === 200 ||
        (response as { statusCode?: number })?.statusCode === 201
      ) {
        queryClient.invalidateQueries({ queryKey: ['card-metrics-details'] })
        setShowRedemptionModal(false)
        setSelectedCard(null)
        setAgreeToTerms(false)
        setSelectedVendor(null)
        setSelectedVendorId('')
        setSelectedBranchId(null)
      }
    } catch {
      // Error toast handled by mutation
    } finally {
      setIsProcessingRedemption(false)
    }
  }, [
    selectedCard,
    validCardType,
    user,
    agreeToTerms,
    selectedBranchId,
    processRedemptionMutation,
    queryClient,
  ])

  const handleCloseRedemptionModal = useCallback(() => {
    setShowRedemptionModal(false)
    setSelectedCard(null)
    setAgreeToTerms(false)
  }, [])

  const addAccountParam = useCallback((path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=corporate`
  }, [])

  const clearVendorSelection = useCallback(() => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedBranchId(null)
  }, [])

  const setSelectedBranchIdFromValue = useCallback((value: string) => {
    if (value) setSelectedBranchId(value)
    else setSelectedBranchId(null)
  }, [])

  const canConfirmVendor =
    selectedVendor &&
    !(
      (validCardType === 'dashx' || validCardType === 'dashpass') &&
      availableBranches.length > 0 &&
      selectedBranchId === null
    )

  const branchNameForSummary = useMemo(() => {
    if (selectedBranchId !== null) {
      const branch = availableBranches.find((b) => String(b.branch_id) === String(selectedBranchId))
      return branch ? formatBranchLabel(branch) : null
    }
    if (selectedCard?.branch_name) {
      return formatBranchLabel({ branch_name: selectedCard.branch_name })
    }
    return null
  }, [selectedBranchId, availableBranches, selectedCard])

  return {
    cardType,
    validCardType,
    navigate,
    addAccountParam,
    user,
    isLoading: isLoadingCards,
    filteredCards,
    pagination,
    paginationLimit,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    getCardBackground,
    CARD_DISPLAY_NAMES,
    cardImageUrls,
    handleRedeemClick,
    showVendorModal,
    handleCloseVendorModal,
    selectedCard,
    vendorOptions,
    selectedVendorId,
    handleVendorSelect,
    isLoadingVendors,
    selectedVendor,
    clearVendorSelection,
    availableBranches,
    branchOptions,
    selectedBranchId,
    setSelectedBranchIdFromValue,
    handleConfirmVendor,
    canConfirmVendor,
    showRedemptionModal,
    handleCloseRedemptionModal,
    agreeToTerms,
    setAgreeToTerms,
    handleConfirmRedemption,
    isProcessingRedemption,
    branchNameForSummary,
  }
}
