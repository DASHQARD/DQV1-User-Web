import { useMemo, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  CARD_DISPLAY_NAMES,
  formatCardTypeForAPI,
  getValidCardType,
  type CardType,
} from '@/utils/constants/cards'
import type { DropdownOption } from '@/types'
import type { CardMetricsDetail } from '@/types'
import { useRedemptionMutation, useCardMetricsDetails } from '@/features/dashboard/hooks'
import type { CardsRedemptionPayload } from '@/features/dashboard/services/redemptions'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState, usePresignedURL } from '@/hooks'
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
  vendor_id?: number
  business_name?: string
  vendor_name?: string
  branches_with_cards?: Array<{
    branch_id: number
    branch_name?: string
    branch_location?: string
  }>
}

export interface CardDetailsDisplayItem {
  id: string | number
  card_id?: string | number
  recipient_id?: number
  card_name: string
  name?: string
  card_type: CardType
  balance: number
  amount: number
  card_price: number
  status: string
  expiry_date?: string
  branch_id?: number
  branch_name?: string
  branch_location?: string
  vendor_id?: number
  vendor_name?: string
  currency: string
  images?: Array<{ file_url: string }>
}

export function useCardDetailsPage() {
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
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [paginationLimit, setPaginationLimit] = useState(10)
  const [paginationAfter, setPaginationAfter] = useState<string>('')
  const [cardImageUrls, setCardImageUrls] = useState<Record<string, string>>({})

  const { useGetUserProfileService } = useUserProfile()
  const { data: user } = useGetUserProfileService()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { useProcessRedemptionCardsService } = useRedemptionMutation()
  const processRedemptionMutation = useProcessRedemptionCardsService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

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
    return availableBranches.map((branch) => {
      const label = branch.branch_location
        ? `${branch.branch_name} - ${branch.branch_location}`
        : `${branch.branch_name}`
      return { label, value: String(branch.branch_id) }
    })
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
        recipient_id: card.recipient_id != null ? Number(card.recipient_id) : undefined,
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

  useEffect(() => {
    if (validCardType !== 'dashx') {
      setCardImageUrls({})
      return
    }
    const fetchCardImages = async () => {
      const imagePromises = filteredCards.map(async (card) => {
        if (!card.images || card.images.length === 0) {
          return { cardId: card.id ?? card.card_id, url: null as string | null }
        }
        try {
          const firstImage = card.images[0]
          const response = await fetchPresignedURL(firstImage.file_url)
          const url =
            typeof response === 'string'
              ? response
              : ((response as { url?: string })?.url ?? response)
          return { cardId: card.id ?? card.card_id, url }
        } catch (error) {
          console.error('Failed to fetch presigned URL for card image:', error)
          return { cardId: card.id ?? card.card_id, url: null as string | null }
        }
      })
      const results = await Promise.all(imagePromises)
      const urlMap: Record<string, string> = {}
      results.forEach((result) => {
        if (result.url && result.cardId != null) {
          urlMap[String(result.cardId)] = result.url
        }
      })
      setCardImageUrls(urlMap)
    }
    if (filteredCards.length > 0) fetchCardImages()
  }, [filteredCards, validCardType, fetchPresignedURL])

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

  const handleRedeemClick = useCallback((card: CardDetailsDisplayItem) => {
    setSelectedCard(card)
    setShowVendorModal(true)
    setSelectedBranchId(card.branch_id ?? null)
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorSearch('')
  }, [])

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

    let payload: CardsRedemptionPayload

    if (validCardType === 'dashgo' || validCardType === 'dashpro') {
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: parseFloat(String(selectedCard.balance || selectedCard.amount || 0)),
        branch_id: selectedBranchId !== null ? selectedBranchId : (selectedCard?.branch_id ?? 0),
        card_id: Number(selectedCard?.id ?? 0),
      }
    } else {
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: selectedCard.card_price || selectedCard.balance || selectedCard.amount || 0,
        branch_id: selectedBranchId !== null ? selectedBranchId : (selectedCard.branch_id ?? 0),
        card_id: Number(selectedCard.id),
      }
    }

    if (!payload.card_id || payload.amount <= 0) return

    setIsProcessingRedemption(true)
    try {
      const response = await processRedemptionMutation.mutateAsync(payload)
      if (
        response?.status === 'success' ||
        response?.statusCode === 200 ||
        response?.statusCode === 201
      ) {
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
    processRedemptionMutation,
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
  }
}
