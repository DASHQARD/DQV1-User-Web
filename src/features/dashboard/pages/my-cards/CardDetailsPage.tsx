import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Text, Loader, Modal, Combobox } from '@/components'
import { Icon } from '@/libs'
import { useRedemptionMutation, useCardMetricsDetails } from '@/features/dashboard/hooks'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState, usePresignedURL } from '@/hooks'
import { userProfile } from '@/hooks'
import type { DropdownOption } from '@/types'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/dashpass_bg.svg'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'

type CardType = 'dashx' | 'dashgo' | 'dashpro' | 'dashpass'

const CARD_TYPE_MAP: Record<string, CardType> = {
  dashx: 'dashx',
  dashgo: 'dashgo',
  dashpro: 'dashpro',
  dashpass: 'dashpass',
}

const CARD_DISPLAY_NAMES: Record<CardType, string> = {
  dashx: 'DashX',
  dashgo: 'DashGo',
  dashpro: 'DashPro',
  dashpass: 'DashPass',
}

// Get card background based on type
const getCardBackground = (type: CardType) => {
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

// Helper function to convert card type to API format
const formatCardTypeForAPI = (
  cardType: string,
): 'DashGo' | 'DashPro' | 'DashX' | 'DashPass' | undefined => {
  const normalized = cardType?.toLowerCase()
  if (normalized === 'dashgo') return 'DashGo'
  if (normalized === 'dashpro') return 'DashPro'
  if (normalized === 'dashx') return 'DashX'
  if (normalized === 'dashpass') return 'DashPass'
  return undefined
}

export default function CardDetailsPage() {
  const { cardType } = useParams<{ cardType: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [isProcessingRedemption, setIsProcessingRedemption] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [paginationLimit, setPaginationLimit] = useState(10)
  const [paginationAfter, setPaginationAfter] = useState<string>('')

  const normalizedCardType = cardType?.toLowerCase() as CardType | undefined
  const validCardType = normalizedCardType && CARD_TYPE_MAP[normalizedCardType]

  const { useGetUserProfileService } = userProfile()
  const { data: user } = useGetUserProfileService()

  // Vendor queries - same as RedemptionPage
  const { usePublicVendorsService } = usePublicCatalogQueries()

  // Prepare params for the new endpoint
  const cardMetricsParams = useMemo(() => {
    if (!validCardType) return undefined

    // Convert card type to API format (DashGo, DashPro, DashX, DashPass)
    const cardTypeForAPI = formatCardTypeForAPI(validCardType)
    if (!cardTypeForAPI) return undefined

    return {
      card_type: cardTypeForAPI,
      limit: paginationLimit,
      after: paginationAfter || undefined,
    }
  }, [validCardType, paginationLimit, paginationAfter])

  // Fetch cards using the new endpoint
  const { data: cardMetricsResponse, isLoading: isLoadingCards } =
    useCardMetricsDetails(cardMetricsParams)

  const { useProcessRedemptionCardsService, useInitiateRedemptionService } = useRedemptionMutation()
  const processRedemptionMutation = useProcessRedemptionCardsService()
  const initiateRedemptionMutation = useInitiateRedemptionService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

  // Get pagination info from response
  const pagination = useMemo(() => {
    if (!cardMetricsResponse?.data) {
      return {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: paginationLimit,
        next: null,
        previous: null,
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

  // Vendor search and selection - same as RedemptionPage
  const { value: debouncedVendorSearch } = useDebouncedState({
    initialValue: vendorSearch,
    onChange: setVendorSearch,
    debounceTime: 500,
  })

  // Fetch vendors based on search - same endpoint as RedemptionPage
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    debouncedVendorSearch
      ? {
          search: debouncedVendorSearch,
          limit: 20,
        }
      : undefined,
  )

  // Extract vendors from response - same as RedemptionPage
  const vendors = useMemo(() => {
    if (!vendorsResponse) return []
    if (Array.isArray(vendorsResponse)) return vendorsResponse
    if (vendorsResponse && typeof vendorsResponse === 'object' && 'data' in vendorsResponse) {
      return (vendorsResponse as any).data || []
    }
    return []
  }, [vendorsResponse])

  // Convert vendors to dropdown options
  const vendorOptions: DropdownOption[] = useMemo(() => {
    return vendors.map((vendor: any) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  // Extract unique branches from selected vendor - same as RedemptionPage
  const availableBranches = useMemo(() => {
    if (!selectedVendor || !selectedVendor.branches_with_cards) return []
    const branchMap = new Map<number, any>()
    selectedVendor.branches_with_cards.forEach((branch: any) => {
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

  // Create branch options for dropdown
  const branchOptions: DropdownOption[] = useMemo(() => {
    return availableBranches.map((branch) => {
      const label = branch.branch_location
        ? `${branch.branch_name} - ${branch.branch_location}`
        : `${branch.branch_name}`
      return {
        label,
        value: String(branch.branch_id),
      }
    })
  }, [availableBranches])

  // Extract and filter cards based on card type
  const filteredCards = useMemo(() => {
    if (!validCardType || isLoadingCards) return []

    // Extract cards from response
    const cards = cardMetricsResponse?.data?.data || []

    if (!Array.isArray(cards) || cards.length === 0) {
      return []
    }

    // Map cards to the expected format based on API response structure
    return cards.map((card: any) => {
      // Parse price from string to number
      const price = parseFloat(card.price || card.base_price || '0')
      const balance = price // For user cards, balance equals the card price

      return {
        id: card.id, // Card record ID
        // Use card.card_id (product card_id) for redemption - this is the identifier like "X-0005-01-01-000002"
        card_id: card.card_id || card.id,
        recipient_id: card.recipient_id, // May not be present in this endpoint
        card_name:
          card.product ||
          card.card_name ||
          card.name ||
          `${CARD_DISPLAY_NAMES[validCardType]} Card`,
        card_type: validCardType,
        balance: balance,
        amount: balance,
        card_price: balance, // Card price for redemption
        status: card.status || 'active',
        expiry_date: card.expiry_date,
        branch_id: card.branch_id, // May not be present in this endpoint
        branch_name: card.branch_name, // May not be present in this endpoint
        branch_location: card.branch_location, // May not be present in this endpoint
        vendor_id: card.vendor_id,
        vendor_name: card.vendor_name, // May not be present in this endpoint
        currency: card.currency || 'GHS',
        images: card.images || [], // May not be present in this endpoint
      }
    })
  }, [validCardType, cardMetricsResponse, isLoadingCards])

  const isLoading = isLoadingCards

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasNextPage && pagination.next) {
      setPaginationAfter(pagination.next)
    }
  }

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      // If previous is null, we're going to the first page
      setPaginationAfter(pagination.previous || '')
    }
  }

  const handlePageSizeChange = (newLimit: number) => {
    setPaginationLimit(newLimit)
    setPaginationAfter('') // Reset to first page when changing page size
  }

  // State for card images (DashX cards)
  const [cardImageUrls, setCardImageUrls] = useState<Record<string, string>>({})

  // Fetch presigned URLs for DashX card images
  useEffect(() => {
    if (validCardType !== 'dashx') {
      setCardImageUrls({})
      return
    }

    const fetchCardImages = async () => {
      const imagePromises = filteredCards.map(async (card: any) => {
        if (!card.images || card.images.length === 0) {
          return { cardId: card.id || card.card_id, url: null }
        }

        try {
          const firstImage = card.images[0]
          const response = await fetchPresignedURL(firstImage.file_url)
          const url = typeof response === 'string' ? response : (response as any)?.url || response
          return { cardId: card.id || card.card_id, url }
        } catch (error) {
          console.error('Failed to fetch presigned URL for card image:', error)
          return { cardId: card.id || card.card_id, url: null }
        }
      })

      const results = await Promise.all(imagePromises)
      const urlMap: Record<string, string> = {}
      results.forEach((result) => {
        if (result.url && result.cardId) {
          urlMap[result.cardId] = result.url
        }
      })
      setCardImageUrls(urlMap)
    }

    if (filteredCards.length > 0) {
      fetchCardImages()
    }
  }, [filteredCards, validCardType, fetchPresignedURL])

  // Handle redeem button click - show vendor selection modal first
  const handleRedeemClick = (card: any) => {
    setSelectedCard(card)
    setShowVendorModal(true)
    // Reset vendor selection when opening modal
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedBranchId(null)
    setVendorSearch('')
  }

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find((v: any) => v.vendor_id?.toString() === vendorId)
    if (vendor) {
      setSelectedVendor(vendor)
      setSelectedVendorId(vendorId)
      setSelectedBranchId(null) // Reset branch when vendor changes
    }
  }

  // Handle vendor modal close
  const handleCloseVendorModal = () => {
    setShowVendorModal(false)
    setSelectedCard(null)
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedBranchId(null)
    setVendorSearch('')
  }

  // Handle vendor confirmation - proceed to redemption modal
  const handleConfirmVendor = () => {
    if (!selectedVendor) return

    // For DashX and DashPass, require branch selection if branches are available
    if (
      (validCardType === 'dashx' || validCardType === 'dashpass') &&
      availableBranches.length > 0 &&
      selectedBranchId === null
    ) {
      return
    }

    setShowVendorModal(false)
    setShowRedemptionModal(true)
  }

  // Handle redemption confirmation - initiate redemption and process directly
  const handleConfirmRedemption = async () => {
    if (!selectedCard || !validCardType || !user) return
    if (!agreeToTerms) {
      return
    }

    const userPhone = (user as any)?.phonenumber || (user as any)?.phone || ''
    if (!userPhone) {
      return
    }

    const cardTypeForAPI = formatCardTypeForAPI(validCardType)
    if (!cardTypeForAPI) {
      return
    }

    // Build payload exactly like RedemptionPage
    let payload: any

    if (validCardType === 'dashgo' || validCardType === 'dashpro') {
      // For DashGo and DashPro, amount is required, branch_id and card_id are optional
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: parseFloat(String(selectedCard.balance || selectedCard.amount || 0)),
        branch_id: selectedBranchId !== null ? selectedBranchId : selectedCard?.branch_id || 0,
        card_id: selectedCard?.card_id || 0,
      }
    } else {
      // For DashX and DashPass, card_id and branch_id are required
      if (!selectedCard) {
        console.error('No card selected')
        setIsProcessingRedemption(false)
        return
      }
      payload = {
        card_type: cardTypeForAPI,
        phone_number: userPhone,
        amount: selectedCard.card_price || selectedCard.balance || selectedCard.amount || 0,
        branch_id: selectedBranchId !== null ? selectedBranchId : selectedCard.branch_id || 0,
        card_id: selectedCard.card_id, // This is card.card_id (product card_id) like RedemptionPage
      }
    }

    if (!payload.card_id || payload.amount <= 0) {
      console.error('Invalid card data for redemption')
      return
    }

    setIsProcessingRedemption(true)
    try {
      // Step 1: Initiate redemption first
      await initiateRedemptionMutation.mutateAsync({
        phone_number: userPhone,
      })

      // Step 2: Process the actual redemption - use payload exactly like RedemptionPage
      await processRedemptionMutation.mutateAsync(payload)
      // Invalidate card metrics details query to refresh card list
      queryClient.invalidateQueries({ queryKey: ['card-metrics-details'] })
      // Close modals and reset state on success
      setShowRedemptionModal(false)
      setSelectedCard(null)
      setAgreeToTerms(false)
      setSelectedVendor(null)
      setSelectedVendorId('')
      setSelectedBranchId(null)
    } catch (error) {
      console.error('Redemption error:', error)
      // Error toast is handled by the mutation
    } finally {
      setIsProcessingRedemption(false)
    }
  }

  // Reset terms agreement when modal closes
  const handleCloseRedemptionModal = () => {
    setShowRedemptionModal(false)
    setSelectedCard(null)
    setAgreeToTerms(false)
  }

  if (!validCardType) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon icon="bi:exclamation-triangle" className="text-6xl text-yellow-400 mb-4 mx-auto" />
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            Invalid Card Type
          </Text>
          <Text variant="p" className="text-gray-600 mb-4">
            The card type "{cardType}" is not valid.
          </Text>
          <Button variant="primary" onClick={() => navigate('/dashboard/my-cards')}>
            Back to My Cards
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/my-cards')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <Icon icon="bi:arrow-left" className="text-lg" />
          <span>Back to My Cards</span>
        </button>
        <Text variant="h2" weight="semibold" className="text-primary-900">
          {CARD_DISPLAY_NAMES[validCardType]} Gift Cards
        </Text>
        <Text variant="p" className="text-gray-600 mt-2">
          View and manage your {CARD_DISPLAY_NAMES[validCardType]} gift cards
        </Text>
      </div>

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon icon="bi:credit-card-2-front" className="text-6xl text-gray-300 mb-4 mx-auto" />
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            No {CARD_DISPLAY_NAMES[validCardType]} Cards
          </Text>
          <Text variant="p" className="text-gray-600">
            You don't have any {CARD_DISPLAY_NAMES[validCardType]} gift cards yet.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card: any, index: number) => {
            const cardBackground = getCardBackground(validCardType)
            const displayAmount = card.balance || card.amount || 0
            const canRedeem = card.status === 'active' && displayAmount > 0
            const cardId = card.id || card.card_id || index
            const cardImageUrl = validCardType === 'dashx' ? cardImageUrls[cardId] : null

            return (
              <div
                key={cardId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Visual */}
                <div
                  className="relative overflow-hidden bg-gray-200"
                  style={{ paddingTop: '62.5%' }}
                >
                  {/* Card Background - always shown as fallback */}
                  <img
                    src={cardBackground}
                    alt={`${CARD_DISPLAY_NAMES[validCardType]} card background`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Product Image - shown for DashX if available, falls back to background on error */}
                  {cardImageUrl && validCardType === 'dashx' && (
                    <img
                      src={cardImageUrl}
                      alt={`${card.card_name || CARD_DISPLAY_NAMES[validCardType]} card image`}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        // Hide product image if it fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  )}

                  {/* Card Overlay Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                      {/* Left: Card Type */}
                      <div className="flex items-center gap-2">
                        <Icon icon="bi:gift" className="size-5" />
                        <span className="font-extrabold text-lg tracking-wide">
                          {CARD_DISPLAY_NAMES[validCardType]}
                        </span>
                      </div>

                      {/* Right: Amount */}
                      <div className="text-right">
                        <span className="text-2xl font-extrabold">{displayAmount.toFixed(2)}</span>
                        <span className="text-sm ml-1">GHS</span>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-end justify-between">
                      {/* Left: Vendor/Branch Name */}
                      {(card.vendor_name || card.branch_name) && (
                        <div>
                          <span className="font-bold text-sm tracking-wide uppercase">
                            {card.vendor_name || card.branch_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <Text variant="h4" weight="semibold" className="text-gray-900 mb-3">
                      {card.card_name || card.name || `${CARD_DISPLAY_NAMES[validCardType]} Card`}
                    </Text>
                    <div className="flex flex-col gap-2 mb-4">
                      {card.balance !== undefined && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:wallet2" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            Balance:{' '}
                            <span className="font-semibold text-gray-900">
                              GHS {card.balance?.toFixed(2) || '0.00'}
                            </span>
                          </Text>
                        </div>
                      )}
                      {card.status && (
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              card.status === 'active'
                                ? 'bi:check-circle-fill'
                                : card.status === 'used'
                                  ? 'bi:x-circle-fill'
                                  : 'bi:clock-fill'
                            }
                            className={
                              card.status === 'active'
                                ? 'text-green-500'
                                : card.status === 'used'
                                  ? 'text-red-500'
                                  : 'text-yellow-500'
                            }
                          />
                          <Text variant="span" className="text-gray-600 capitalize">
                            {card.status}
                          </Text>
                        </div>
                      )}
                      {card.expiry_date && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:calendar-event" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            Expires: {new Date(card.expiry_date).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                      {card.branch_name && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:shop" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            {card.branch_name}
                          </Text>
                        </div>
                      )}
                      {card.vendor_name && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:building" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            {card.vendor_name}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Redeem Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      disabled={!canRedeem}
                      onClick={() => handleRedeemClick(card)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Icon icon="bi:arrow-repeat" />
                      <span>Redeem Card</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredCards.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Text variant="span" className="text-gray-600 text-sm">
              Items per page:
            </Text>
            <select
              value={paginationLimit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="small"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="flex items-center gap-2"
            >
              <Icon icon="bi:arrow-left" />
              <span>Previous</span>
            </Button>
            <Text variant="span" className="text-gray-600 text-sm">
              Showing {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
            </Text>
            <Button
              variant="outline"
              size="small"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-2"
            >
              <span>Next</span>
              <Icon icon="bi:arrow-right" />
            </Button>
          </div>
        </div>
      )}

      {/* Vendor Selection Modal */}
      <Modal
        title="Select Vendor & Branch"
        isOpen={showVendorModal}
        setIsOpen={handleCloseVendorModal}
        panelClass="!max-w-[500px] py-8"
      >
        {selectedCard && (
          <div className="px-6 pb-6">
            <Text variant="p" className="text-gray-600 mb-6">
              Please select the vendor and branch where you want to redeem this card.
            </Text>

            {/* Vendor Search */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Icon icon="bi:shop" className="text-primary-600" />
                  Search Vendor by Name <span className="text-red-500">*</span>
                </label>
                {selectedVendor && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Icon icon="bi:check-circle-fill" />
                    Selected
                  </span>
                )}
              </div>
              {!selectedVendor ? (
                <Combobox
                  options={vendorOptions}
                  value={selectedVendorId}
                  onChange={(e: any) => {
                    const vendorId = e.target.value
                    if (vendorId) {
                      handleVendorSelect(vendorId)
                    }
                  }}
                  placeholder="Search for a vendor by name..."
                  isLoading={isLoadingVendors}
                />
              ) : (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Icon icon="bi:shop-window" className="text-white text-lg" />
                      </div>
                      <div>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {selectedVendor.business_name ||
                            selectedVendor.vendor_name ||
                            'Unknown Vendor'}
                        </Text>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVendor(null)
                        setSelectedVendorId('')
                        setSelectedBranchId(null)
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Branch Selection - Show if vendor has branches */}
            {selectedVendor && availableBranches.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={branchOptions}
                  value={selectedBranchId !== null ? String(selectedBranchId) : ''}
                  onChange={(e: any) => {
                    const branchId = e.target.value
                    if (branchId) {
                      setSelectedBranchId(Number(branchId))
                    } else {
                      setSelectedBranchId(null)
                    }
                  }}
                  placeholder="Select a branch..."
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseVendorModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirmVendor}
                disabled={
                  !selectedVendor ||
                  ((validCardType === 'dashx' || validCardType === 'dashpass') &&
                    availableBranches.length > 0 &&
                    selectedBranchId === null)
                }
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Redemption Confirmation Modal */}
      <Modal
        title="Redemption Summary"
        isOpen={showRedemptionModal}
        setIsOpen={handleCloseRedemptionModal}
        panelClass="!max-w-[500px] py-8"
      >
        {selectedCard && (
          <div className="px-6 pb-6">
            {/* Prominent Amount Display */}
            <div className="bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] rounded-xl p-6 mb-6 text-white">
              <Text variant="span" className="text-white/90 text-sm mb-2 block">
                Redemption Amount
              </Text>
              <Text variant="h1" weight="bold" className="text-white text-4xl">
                GHS {(selectedCard.balance || selectedCard.amount || 0).toFixed(2)}
              </Text>
            </div>

            {/* Redemption Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <Text variant="span" className="text-gray-600 text-sm">
                    Card Name
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                    {selectedCard.card_name || selectedCard.name || 'Gift Card'}
                  </Text>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <Text variant="span" className="text-gray-600 text-sm">
                    Card Type
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                    {CARD_DISPLAY_NAMES[validCardType]}
                  </Text>
                </div>
                {(() => {
                  const branchName =
                    selectedBranchId !== null
                      ? availableBranches.find((b) => b.branch_id === selectedBranchId)?.branch_name
                      : selectedCard.branch_name
                  return branchName ? (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <Text variant="span" className="text-gray-600 text-sm">
                        Branch
                      </Text>
                      <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                        {branchName}
                      </Text>
                    </div>
                  ) : null
                })()}
                {selectedVendor && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Vendor
                    </Text>
                    <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                      {selectedVendor.business_name ||
                        selectedVendor.vendor_name ||
                        selectedCard.vendor_name}
                    </Text>
                  </div>
                )}
                {user && (
                  <div className="flex justify-between items-center">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Account
                    </Text>
                    <div className="text-right">
                      <Text
                        variant="span"
                        weight="semibold"
                        className="text-gray-900 text-sm block"
                      >
                        {user.fullname || 'User'}
                      </Text>
                      <Text variant="span" className="text-gray-500 text-xs">
                        {(user as any)?.phonenumber || (user as any)?.phone || 'N/A'}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <Text variant="span" className="text-orange-800 text-xs leading-relaxed">
                <Icon icon="bi:exclamation-triangle-fill" className="inline mr-1" />
                Please ensure all details are correct before proceeding. Once redeemed, this action
                cannot be undone.
              </Text>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <Text variant="span" className="text-gray-700 text-sm">
                  I agree to DashQard's{' '}
                  <span className="text-primary-600 font-semibold">Terms & Conditions</span> for
                  card redemption.
                </Text>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseRedemptionModal}
                disabled={isProcessingRedemption}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirmRedemption}
                disabled={!agreeToTerms || isProcessingRedemption}
                loading={isProcessingRedemption}
                className="flex-1"
              >
                {isProcessingRedemption ? 'Processing...' : 'Redeem Card'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
