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
import type { CardMetricsDetail } from '@/types'
import { useRedemptionMutation, useCardMetricsDetails } from '@/features/dashboard/hooks'
import {
  buildCardsRedemptionPayload,
  isRedemptionApiSuccess,
} from '@/features/website/utils/cardsRedemption'
import { buildRedemptionUrlFromCard } from '@/features/website/utils/redemptionDeepLink'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState } from '@/hooks'
import { useUserProfile } from '@/hooks'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'

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

interface VendorItem {
  vendor_id?: string | number
  business_name?: string
  vendor_name?: string
  branches_with_cards?: Array<{
    branch_id: string | number
    branch_name?: string
    branch_location?: string
  }>
}

export interface CardDetailsDisplayItem {
  id: string | number
  card_id?: string | number
  recipient_id?: string | number
  card_name: string
  name?: string
  card_type: CardType
  balance: number
  amount: number
  card_price: number
  status: string
  expiry_date?: string
  branch_id?: string | number
  branch_name?: string
  branch_location?: string
  vendor_id?: string | number
  vendor_name?: string
  currency: string
  images?: Array<{ file_url: string }>
}

export function useCardDetailsPage() {
  const navigate = useNavigate()
  const { cardType } = useParams<{ cardType: string }>()
  const queryClient = useQueryClient()
  const validCardType = getValidCardType(cardType)

  const [selectedCard, setSelectedCard] = useState<CardDetailsDisplayItem | null>(null)
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
  const { useProcessUserRedemptionCardsService } = useRedemptionMutation()
  const processUserRedemptionCardsMutation = useProcessUserRedemptionCardsService()

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

  const vendors = useMemo((): VendorItem[] => {
    if (!vendorsResponse) return []
    if (Array.isArray(vendorsResponse)) return vendorsResponse as VendorItem[]
    if (vendorsResponse && typeof vendorsResponse === 'object' && 'data' in vendorsResponse) {
      return ((vendorsResponse as { data: VendorItem[] }).data || []) as VendorItem[]
    }
    return []
  }, [vendorsResponse])

  useEffect(() => {
    if (selectedCard?.vendor_id && vendors.length > 0 && !selectedVendor && showVendorModal) {
      const vendor = vendors.find((v) => v.vendor_id?.toString() === String(selectedCard.vendor_id))
      if (vendor) {
        setSelectedVendor(vendor as Record<string, unknown>)
        setSelectedVendorId(String(vendor.vendor_id))
      }
    }
  }, [vendors, selectedCard, selectedVendor, showVendorModal])

  const vendorOptions: DropdownOption[] = useMemo(() => {
    return vendors.map((vendor) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  const availableBranches = useMemo(() => {
    const vendor = selectedVendor as VendorItem | null
    if (!vendor?.branches_with_cards) return []
    const branches = vendor.branches_with_cards
    const branchMap = new Map<
      string,
      { branch_id: string; branch_name?: string; branch_location?: string }
    >()
    branches.forEach((branch) => {
      const branchId = String(branch.branch_id)
      if (branch.branch_id && !branchMap.has(branchId)) {
        branchMap.set(branchId, {
          branch_id: branchId,
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

  const filteredCards = useMemo((): CardDetailsDisplayItem[] => {
    if (!validCardType || isLoadingCards) return []
    const cards: CardMetricsDetail[] = cardMetricsResponse?.data?.data || []
    if (!Array.isArray(cards) || cards.length === 0) return []
    return cards.map((card) => {
      const raw = card as CardMetricsDetail & { unredeemed_amount?: string }
      const balance =
        validCardType === 'dashpro'
          ? parseFloat(raw.unredeemed_amount || '0')
          : parseFloat(card.price || card.base_price || '0')
      return {
        id: card.id,
        card_id: card.card_id ?? card.id,
        recipient_id: card.recipient_id != null ? String(card.recipient_id) : undefined,
        card_name: card.product || `${CARD_DISPLAY_NAMES[validCardType]} Card`,
        card_type: validCardType,
        balance,
        amount: balance,
        card_price: balance,
        status: card.status || 'active',
        expiry_date: card.expiry_date,
        branch_id: card.branch_id,
        branch_name: card.branch_name,
        branch_location: card.branch_location,
        vendor_id: card.vendor_id,
        vendor_name: card.vendor_name,
        currency: card.currency || 'GHS',
        images: card.images || [],
      }
    })
  }, [validCardType, cardMetricsResponse, isLoadingCards])

  const isLoading = isLoadingCards

  const cardImageUrls = useMemo(() => {
    const map: Record<string, string> = {}
    filteredCards.forEach((card) => {
      if (card.images && card.images.length > 0 && card.images[0].file_url) {
        map[String(card.id ?? card.card_id)] = card.images[0].file_url
      }
    })
    return map
  }, [filteredCards])

  const handleNextPage = useCallback(() => {
    if (pagination.hasNextPage && pagination.next) {
      setPaginationAfter(pagination.next)
    }
  }, [pagination.hasNextPage, pagination.next])

  const handlePreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      setPaginationAfter(pagination.previous || '')
    }
  }, [pagination.hasPreviousPage, pagination.previous])

  const handlePageSizeChange = useCallback((newLimit: number) => {
    setPaginationLimit(newLimit)
    setPaginationAfter('')
  }, [])

  const handleRedeemClick = useCallback(
    (card: CardDetailsDisplayItem) => {
      navigate(
        buildRedemptionUrlFromCard({
          card_type: card.card_type,
          vendor_id: card.vendor_id,
          branch_id: card.branch_id,
          card_id: card.card_id ?? card.id,
        }),
      )
    },
    [navigate],
  )

  const handleVendorSelect = useCallback(
    (vendorId: string) => {
      const vendor = vendors.find((v) => v.vendor_id?.toString() === vendorId)
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

    const vendorGvid = String((selectedVendor as { gvid?: string })?.gvid ?? '').trim()
    if (!vendorGvid) return

    const branchId =
      selectedBranchId !== null
        ? selectedBranchId
        : String(selectedCard?.branch_id ?? '').trim()
    if (!branchId) return

    let payload
    if (cardTypeForAPI === 'DashGo') {
      const cardId = String(
        (selectedCard as { id?: string; card_id?: string; gift_card_id?: string }).gift_card_id ??
          (selectedCard as { id?: string; card_id?: string }).id ??
          (selectedCard as { card_id?: string }).card_id ??
          '',
      ).trim()
      if (!cardId) return
      payload = buildCardsRedemptionPayload({
        branch_id: branchId,
        vendor_gvid: vendorGvid,
        card_type: 'DashGo',
        card_id: cardId,
        amount: parseFloat(String(selectedCard.balance || selectedCard.amount || 0)),
      })
    } else if (cardTypeForAPI === 'DashPro') {
      payload = buildCardsRedemptionPayload({
        branch_id: branchId,
        vendor_gvid: vendorGvid,
        card_type: 'DashPro',
        amount: parseFloat(String(selectedCard.balance || selectedCard.amount || 0)),
      })
    } else {
      payload = buildCardsRedemptionPayload({
        branch_id: branchId,
        vendor_gvid: vendorGvid,
        card_type: cardTypeForAPI,
        card_id: String(selectedCard.id),
      })
    }

    if (
      (validCardType === 'dashgo' || validCardType === 'dashpro') &&
      ('amount' in payload ? payload.amount <= 0 : true)
    ) {
      return
    }

    setIsProcessingRedemption(true)
    try {
      const response = await processUserRedemptionCardsMutation.mutateAsync(payload)
      if (isRedemptionApiSuccess(response)) {
        queryClient.invalidateQueries({ queryKey: ['card-metrics-details'] })
        setShowRedemptionModal(false)
        setSelectedCard(null)
        setAgreeToTerms(false)
        setSelectedVendor(null)
        setSelectedVendorId('')
        setSelectedBranchId(null)
      }
    } catch (error) {
      console.error('Redemption error:', error)
    } finally {
      setIsProcessingRedemption(false)
    }
  }, [
    selectedCard,
    validCardType,
    user,
    agreeToTerms,
    selectedBranchId,
    processUserRedemptionCardsMutation,
    selectedVendor,
    queryClient,
  ])

  const handleCloseRedemptionModal = useCallback(() => {
    setShowRedemptionModal(false)
    setSelectedCard(null)
    setAgreeToTerms(false)
  }, [])

  const clearVendorSelection = useCallback(() => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedBranchId(null)
  }, [])

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
    cardTypeParam: cardType,
    validCardType,
    isLoading,
    filteredCards,
    cardImageUrls,
    pagination,
    paginationLimit,
    selectedCard,
    showVendorModal,
    showRedemptionModal,
    isProcessingRedemption,
    agreeToTerms,
    setAgreeToTerms,
    selectedVendor,
    selectedVendorId,
    selectedBranchId,
    setSelectedBranchId,
    vendorOptions,
    branchOptions,
    availableBranches,
    isLoadingVendors,
    user,
    CARD_DISPLAY_NAMES,
    getCardBackground,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleRedeemClick,
    handleVendorSelect,
    handleCloseVendorModal,
    handleConfirmVendor,
    handleConfirmRedemption,
    handleCloseRedemptionModal,
    clearVendorSelection,
    branchNameForSummary,
  }
}
