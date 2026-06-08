import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Input,
  Text,
  RadioGroup,
  RadioGroupItem,
  Combobox,
  Loader,
  Modal,
} from '@/components'
import { Icon } from '@/libs'
import { useAuthStore, useGuestAddToCartModalStore } from '@/stores'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useUserProfile, useCountriesData, useToast } from '@/hooks'
import { convertToInternationalFormat } from '@/features/dashboard/services/redemptions'
import type { DropdownOption } from '@/types'
import { BasePhoneInput } from '@/components/BasePhoneNumber/BasePhoneNumber'
import { useRedemptionVendorMobileMoney } from '@/features/website/hooks/useRedemptionVendorMobileMoney'
import { useRedemptionVendorLookup } from '@/features/website/hooks/useRedemptionVendorLookup'
import {
  useRedemptionMutation,
  useRedemptionQueries,
  useRateCard,
} from '@/features/dashboard/hooks'
import { ROUTES } from '@/utils/constants'
import { getImageUrl } from '@/utils/cardDisplay'
import { getGuestPhoneFromAuth } from '@/features/website/utils/guestAuth'
import {
  buildCardsRedemptionPayload,
  isRedemptionApiSuccess,
  redeemableCardTypeToUi,
} from '@/features/website/utils/cardsRedemption'
import {
  buildGuestCardTypeAvailability,
  buildGuestCardsRedemptionPayload,
  filterGuestAssignedByType,
  filterGuestAssignedByVendorAndBranch,
  formatBranchLabel,
  isGuestAssignedCardRedeemable,
  isGuestRedemptionSuccess,
  isValidRedemptionAmountInput,
  mapGuestAssignedCardToVendorCard,
  parseGuestRecipientAmountTotalBalance,
  pickGuestRedemptionCardId,
  resolveRedemptionCardId,
  roundRedemptionAmount,
} from '@/features/website/utils/guestRedemption'
import { parseGuestAssignedCardsResponse } from '@/features/website/utils/guestAssignedCards'
import { parseGuestRedemptionsResponse } from '@/features/website/utils/guestRedemptionsHistory'
import { GuestGiftCardTile } from '@/features/website/pages/guest/GuestGiftCardTile'
import type { GuestCardsRedemptionData, VendorSearchResult } from '@/types/redemptions'
import { CARD_EXPIRED_MESSAGE, isAssignedCardRedeemable, isCatalogCardPurchasable } from '@/utils/cardExpiry'
import {
  parseRedemptionSearchParams,
  vendorIdFlowRequiresBranch,
} from '@/features/website/utils/redemptionDeepLink'
import { findRedemptionCardInList } from '@/features/website/utils/guestCardRedemptionNavigation'
import { isExactGvidPathLookup } from '@/features/website/utils/cardsRedemption'

type RedemptionMethod = 'vendor_mobile_money' | 'vendor_id'
type CardType = 'dashpro' | 'dashgo' | 'dashx' | 'dashpass'

interface VendorCard {
  card_id: string
  card_name: string
  card_type: string
  card_price: number
  currency: string
  status: string
  branch_id?: string
  branch_name?: string
  branch_location?: string
  vendor_id?: string
  vendor_name?: string
  recipient_id?: string
  /** Unique per assignment; use for selection when multiple cards share card_id+branch_id+recipient_id */
  cart_item_id?: string
  image_url?: string
  expiry_date?: string
  description?: string
}

// Helper function to convert card type to API format
const formatCardTypeForAPI = (
  cardType: string,
): 'DashPro' | 'DashGo' | 'DashX' | 'DashPass' | undefined => {
  const normalized = cardType?.toLowerCase()
  if (normalized === 'dashpro') return 'DashPro'
  if (normalized === 'dashgo') return 'DashGo'
  if (normalized === 'dashx') return 'DashX'
  if (normalized === 'dashpass') return 'DashPass'
  return undefined
}

export default function RedemptionPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { isAuthenticated, user: jwtUser } = useAuthStore()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const openGuestVerifyModal = useGuestAddToCartModalStore((s) => s.open)
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfile } = useGetUserProfileService()

  // State management
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod | ''>('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [cardType, setCardType] = useState<CardType | ''>('')
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [dashGoBalance, setDashGoBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [, setBalanceError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [selectedCard, setSelectedCard] = useState<VendorCard | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [step, setStep] = useState<'method' | 'details' | 'success' | 'rating'>('method')
  const [isProcessingRedemption, setIsProcessingRedemption] = useState(false)
  const [redeemedCardId, setRedeemedCardId] = useState<string | null>(null)
  const [redemptionSuccess, setRedemptionSuccess] = useState<GuestCardsRedemptionData | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [showActionChoiceModal, setShowActionChoiceModal] = useState(false)
  const toast = useToast()

  const normalizeToLocalPhone = (value: string) => {
    const digitsOnly = (value || '').replace(/[^0-9]/g, '')
    if (!digitsOnly) return ''
    if (digitsOnly.startsWith('233')) return digitsOnly.slice(3)
    return digitsOnly
  }

  const deepLinkApplied = useRef(false)
  const pendingDeepLinkCardIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (searchParams.get('redeem') === 'true') {
      setShowActionChoiceModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (deepLinkApplied.current) return
    const parsed = parseRedemptionSearchParams(searchParams)
    if (!parsed.method) return
    deepLinkApplied.current = true
    setRedemptionMethod(parsed.method)
    setStep('details')
    const normalizedType = parsed.card_type?.toLowerCase()
    if (
      normalizedType === 'dashgo' ||
      normalizedType === 'dashpro' ||
      normalizedType === 'dashx' ||
      normalizedType === 'dashpass'
    ) {
      setCardType(normalizedType)
    }
    if (parsed.vendor_gvid) {
      setVendorIdInput(parsed.vendor_gvid)
    } else if (parsed.vendor_id) {
      setVendorIdInput(parsed.vendor_id)
    }
    if (parsed.branch_id) {
      setSelectedBranchId(parsed.branch_id)
    }
    if (parsed.card_id?.trim()) {
      pendingDeepLinkCardIdRef.current = parsed.card_id.trim()
    }
  }, [searchParams])

  useEffect(() => {
    if (isAuthenticated || phoneNumber) return
    const prefillPhone = normalizeToLocalPhone(getGuestPhoneFromAuth(jwtUser))
    if (prefillPhone) {
      setPhoneNumber(prefillPhone)
    }
  }, [isAuthenticated, phoneNumber, jwtUser])

  const clearRedeemQueryParam = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('redeem')
    setSearchParams(params, { replace: true })
  }

  const handleChooseRedeem = () => {
    setShowActionChoiceModal(false)
    clearRedeemQueryParam()
  }

  const handleChoosePurchase = () => {
    setShowActionChoiceModal(false)
    clearRedeemQueryParam()
    navigate(ROUTES.IN_APP.DASHQARDS)
  }

  const invalidateRedemptionGuestQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['guest-assigned-cards'] })
    queryClient.invalidateQueries({ queryKey: ['redeemable-cards'] })
    queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-pro'] })
    queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-go'] })
  }, [queryClient])

  // Get redemption queries hooks
  const {
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashProService,
    useGetRedemptionsAmountDashXService,
    useGetRedemptionsAmountDashPassService,
    useGetGuestAssignedCardsService,
    useGetGuestRedemptionsService,
    useGetRedeemableCardsService,
  } = useRedemptionQueries()
  const {
    useProcessUserRedemptionCardsService,
    useProcessGuestCardsRedemptionService,
    useProcessDashProRedemptionForUserService,
    useProcessDashProRedemptionService,
  } = useRedemptionMutation()
  const processUserRedemptionCardsMutation = useProcessUserRedemptionCardsService()
  const processGuestCardsRedemptionMutation = useProcessGuestCardsRedemptionService()
  const processDashProForUserMutation = useProcessDashProRedemptionForUserService()
  const processDashProPublicMutation = useProcessDashProRedemptionService()
  const rateCardMutation = useRateCard()
  const { countries } = useCountriesData()

  const vendorMobileMoney = useRedemptionVendorMobileMoney(
    redemptionMethod === 'vendor_mobile_money',
    isGuestAuth,
  )
  const vendorLookup = useRedemptionVendorLookup(
    redemptionMethod === 'vendor_id' && step === 'details' && isAuthenticated,
  )
  const {
    vendorIdInput,
    setVendorIdInput,
    debouncedVendorId,
    searchResults: vendorIdSearchResults,
    exactIdMatch: vendorIdExactMatch,
    isSearchingById,
    resetVendorLookup,
  } = vendorLookup
  const {
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor,
    vendorPhoneError,
    vendorPhoneName,
    momoResolveWarning,
    isVendorPhoneVerified,
    resolvedProvider,
    resetVendorMobileMoney,
  } = vendorMobileMoney

  const selectedVendorGvid = useMemo(() => {
    const gvid = selectedVendor?.gvid || vendorIdExactMatch?.gvid
    return gvid ? String(gvid).trim() : ''
  }, [selectedVendor, vendorIdExactMatch])

  const redeemableCardsParams = useMemo(() => {
    if (!isAuthenticated || isGuestAuth || redemptionMethod === '') return undefined
    if (redemptionMethod === 'vendor_mobile_money') {
      return { method: 'vendor_mobile_money' as const }
    }
    if (redemptionMethod === 'vendor_id' && (selectedBranchId || selectedVendorGvid)) {
      return {
        method: 'vendor_id' as const,
        branch_id: selectedBranchId ?? undefined,
        vendor_gvid: selectedVendorGvid || undefined,
      }
    }
    return undefined
  }, [isAuthenticated, isGuestAuth, redemptionMethod, selectedBranchId, selectedVendorGvid])

  const { data: redeemableCardsResponse } = useGetRedeemableCardsService(
    redeemableCardsParams,
    step === 'details' && !!redeemableCardsParams,
  )

  // Get phone number for balance queries
  const userPhoneNumber = isAuthenticated
    ? isGuestAuth
      ? getGuestPhoneFromAuth(jwtUser)
      : (userProfile as any)?.phonenumber || (userProfile as any)?.phone || ''
    : phoneNumber

  // Prepare params for DashGo hook
  const dashGoParams = useMemo(() => {
    if (!isAuthenticated && (!userPhoneNumber || userPhoneNumber.length < 9)) {
      return undefined
    }
    const branchId = selectedBranchId !== null ? selectedBranchId : selectedCard?.branch_id
    if (!isAuthenticated && !branchId && !selectedVendorId) {
      return undefined
    }
    const params: any = {}
    if (!isAuthenticated) {
      params.phone_number = convertToInternationalFormat(userPhoneNumber)
    }
    if (branchId !== null && branchId !== undefined) {
      params.branch_id = branchId
    }
    if (selectedVendorId) {
      params.vendor_id = selectedVendorId
    }
    return params
  }, [userPhoneNumber, selectedBranchId, selectedVendorId, selectedCard, isAuthenticated])

  // Prepare params for DashX hook
  const dashXParams = useMemo(() => {
    if (!isAuthenticated && (!userPhoneNumber || userPhoneNumber.length < 9)) {
      return undefined
    }
    const params: any = {}
    if (!isAuthenticated) {
      params.phone_number = convertToInternationalFormat(userPhoneNumber)
    }
    const branchId = selectedBranchId !== null ? selectedBranchId : selectedCard?.branch_id
    if (branchId !== null && branchId !== undefined) {
      params.branch_id = branchId
    }
    if (selectedVendorId) {
      params.vendor_id = selectedVendorId
    }
    return params
  }, [userPhoneNumber, selectedBranchId, selectedVendorId, selectedCard, isAuthenticated])

  // Prepare params for DashPass hook
  const dashPassParams = useMemo(() => {
    if (!isAuthenticated && (!userPhoneNumber || userPhoneNumber.length < 9)) {
      return undefined
    }
    const params: any = {}
    if (!isAuthenticated) {
      params.phone_number = convertToInternationalFormat(userPhoneNumber)
    }
    const branchId = selectedBranchId !== null ? selectedBranchId : selectedCard?.branch_id
    if (branchId !== null && branchId !== undefined) {
      params.branch_id = branchId
    }
    if (selectedVendorId) {
      params.vendor_id = selectedVendorId
    }
    return params
  }, [userPhoneNumber, selectedBranchId, selectedVendorId, selectedCard, isAuthenticated])

  const { data: redemptionsAmountDashGo, isLoading: isLoadingRedemptionsAmountDashGo } =
    useGetRedemptionsAmountDashGoService(dashGoParams)

  const dashProAmountsEnabled =
    redemptionMethod === 'vendor_mobile_money' && isAuthenticated
      ? true
      : (isAuthenticated && !isGuestAuth) ||
        (isGuestAuth && !!(selectedVendorId || selectedBranchId || selectedCard?.branch_id)) ||
        (redemptionMethod === 'vendor_id' &&
          !!dashGoParams?.phone_number &&
          !!(dashGoParams?.vendor_id || dashGoParams?.branch_id))

  const { data: redemptionsAmountDashPro, isLoading: isLoadingRedemptionsAmountDashPro } =
    useGetRedemptionsAmountDashProService(dashProAmountsEnabled)
  const { data: redemptionsAmountDashX, isLoading: isLoadingRedemptionsAmountDashX } =
    useGetRedemptionsAmountDashXService(dashXParams)
  const { data: redemptionsAmountDashPass, isLoading: isLoadingRedemptionsAmountDashPass } =
    useGetRedemptionsAmountDashPassService(dashPassParams)
  const { data: guestAssignedCardsResponse } = useGetGuestAssignedCardsService(
    isGuestAuth && step === 'details',
    { redemption_status: 'unredeemed' },
  )
  const { data: guestRedemptionsHistory } = useGetGuestRedemptionsService(
    isGuestAuth && step === 'success',
    { limit: 5 },
  )

  const recentGuestRedemptions = useMemo(() => {
    return parseGuestRedemptionsResponse(guestRedemptionsHistory).items.slice(0, 5)
  }, [guestRedemptionsHistory])

  // Fetch vendors same as Vendors/DashQards: limit 100 when on vendor_id flow
  const { data: vendorsResponse } = usePublicVendorsService(
    redemptionMethod === 'vendor_id' ? { limit: 100 } : undefined,
    redemptionMethod === 'vendor_id' && isAuthenticated,
  )

  const guestAssignedPayload = useMemo(
    () => parseGuestAssignedCardsResponse(guestAssignedCardsResponse),
    [guestAssignedCardsResponse],
  )

  const guestAssignedCards = useMemo(() => {
    if (!isGuestAuth) return []
    return guestAssignedPayload.cards
  }, [isGuestAuth, guestAssignedPayload.cards])

  const cardTypeAvailability = useMemo(() => {
    if (isGuestAuth) {
      return buildGuestCardTypeAvailability({
        assignedCards: guestAssignedCards,
        dashProBalance: parseGuestRecipientAmountTotalBalance(redemptionsAmountDashPro),
        dashGoBalance: parseGuestRecipientAmountTotalBalance(redemptionsAmountDashGo),
      })
    }
    const cards = redeemableCardsResponse?.data?.cards
    if (!Array.isArray(cards)) return null
    const map: Partial<Record<CardType, boolean>> = {}
    for (const summary of cards) {
      const uiType = redeemableCardTypeToUi(summary.card_type)
      if (uiType) map[uiType] = summary.available
    }
    return map
  }, [
    isGuestAuth,
    guestAssignedCards,
    redemptionsAmountDashPro,
    redemptionsAmountDashGo,
    redeemableCardsResponse,
  ])

  const isCardTypeAvailable = useCallback(
    (type: CardType) => {
      if (cardTypeAvailability && type in cardTypeAvailability) {
        return cardTypeAvailability[type] !== false
      }
      return true
    },
    [cardTypeAvailability],
  )

  const publicVendorsWithCards = useMemo(() => {
    if (!vendorsResponse) return []
    const raw = Array.isArray(vendorsResponse)
      ? vendorsResponse
      : (vendorsResponse as any)?.data || []
    const list = Array.isArray(raw) ? raw : []
    return list.filter((v: any) =>
      (v.branches_with_cards ?? []).some((b: any) =>
        (b.cards ?? []).some((card: any) =>
          isCatalogCardPurchasable({
            card_status: card.card_status ?? card.status,
            expiry_date: card.expiry_date,
          }),
        ),
      ),
    )
  }, [vendorsResponse])

  // Extract vendors and filter same as Vendors/DashQards: only vendors with branches that have cards
  const vendors = useMemo(() => {
    if (isGuestAuth) {
      const vendorMap = new Map<
        string,
        { vendor_id: string; business_name: string; vendor_name: string }
      >()
      guestAssignedCards.forEach((card: any) => {
        if (!isGuestAssignedCardRedeemable(card)) return
        const id = String(card.vendor_id ?? '')
        if (!id) return
        if (!vendorMap.has(id)) {
          vendorMap.set(id, {
            vendor_id: id,
            business_name: card.vendor_name || 'Unknown Vendor',
            vendor_name: card.vendor_name || 'Unknown Vendor',
          })
        }
      })
      const fromAssigned = Array.from(vendorMap.values())
      if (fromAssigned.length > 0) return fromAssigned
      return publicVendorsWithCards
    }
    return publicVendorsWithCards
  }, [isGuestAuth, guestAssignedCards, publicVendorsWithCards])

  // Extract cards from selected vendor with branch information
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []

    if (isGuestAuth) {
      return guestAssignedCards
        .filter(
          (card: any) =>
            isGuestAssignedCardRedeemable(card) &&
            String(card.vendor_id ?? '') === String(selectedVendorId),
        )
        .map((card: any) => ({
          card_id: resolveRedemptionCardId(card),
          card_name: card.product || 'Unknown Card',
          card_type: String(card.card_type || '').toLowerCase(),
          card_price: Number(card.price || card.amount || 0),
          currency: card.currency || guestAssignedPayload.currency || 'GHS',
          status: 'active',
          branch_id: card.branch_id ? String(card.branch_id) : undefined,
          branch_name: card.branch_name || card.branch?.name,
          branch_location: card.branch_location || card.branch?.location,
          vendor_id: card.vendor_id ? String(card.vendor_id) : undefined,
          vendor_name: card.vendor_name,
          recipient_id: card.guest_recipient_id ? String(card.guest_recipient_id) : undefined,
          image_url: card.images?.[0]?.file_url ? getImageUrl(card.images[0].file_url) : undefined,
          expiry_date: card.expiry_date,
          description: card.description,
        })) as VendorCard[]
    }
    const cards: VendorCard[] = []

    // Extract cards from branches_with_cards (includes branch info)
    if (selectedVendor.branches_with_cards && Array.isArray(selectedVendor.branches_with_cards)) {
      selectedVendor.branches_with_cards.forEach((branch: any) => {
        if (branch.cards && Array.isArray(branch.cards)) {
          branch.cards.forEach((card: any) => {
            cards.push({
              card_id: resolveRedemptionCardId(card),
              card_name: card.card_name || card.product || 'Unknown Card',
              card_type: card.card_type?.toLowerCase() || '',
              card_price: card.card_price || 0,
              currency: card.currency || 'GHS',
              status: card.status || 'active',
              branch_id: branch.branch_id ? String(branch.branch_id) : undefined,
              branch_name: branch.branch_name || branch.name,
              branch_location: branch.branch_location,
            })
          })
        }
      })
    }

    // Extract cards from vendor_cards if available (no branch info)
    if (selectedVendor.vendor_cards && Array.isArray(selectedVendor.vendor_cards)) {
      selectedVendor.vendor_cards.forEach((card: any) => {
        cards.push({
          card_id: card.card_id || card.id,
          card_name: card.card_name || card.product || 'Unknown Card',
          card_type: card.card_type?.toLowerCase() || card.type?.toLowerCase() || '',
          card_price: card.card_price || card.price || 0,
          currency: card.currency || 'GHS',
          status: card.status || 'active',
        })
      })
    }

    return cards
  }, [
    isGuestAuth,
    guestAssignedCards,
    guestAssignedPayload.currency,
    selectedVendor,
    selectedVendorId,
  ])

  // Extract unique branches from vendor
  const availableBranches = useMemo(() => {
    if (isGuestAuth) {
      const branchMap = new Map<string, any>()
      vendorCards.forEach((card) => {
        if (!card.branch_id) return
        if (!branchMap.has(card.branch_id)) {
          branchMap.set(card.branch_id, {
            branch_id: card.branch_id,
            branch_name: formatBranchLabel({
              branch_id: card.branch_id,
              branch_name: card.branch_name,
              branch_location: card.branch_location,
            }),
            branch_location: card.branch_location || '',
          })
        }
      })
      return Array.from(branchMap.values())
    }
    if (selectedVendor?.branches?.length) {
      return selectedVendor.branches.map(
        (branch: { id: string; branch_name?: string; branch_location?: string }) => ({
        branch_id: String(branch.id),
        branch_name: formatBranchLabel({
          branch_id: branch.id,
          branch_name: branch.branch_name,
          branch_location: branch.branch_location,
        }),
        branch_location: branch.branch_location || '',
      }))
    }
    if (!selectedVendor || !selectedVendor.branches_with_cards) return []
    const branchMap = new Map<string, any>()
    selectedVendor.branches_with_cards.forEach((branch: any) => {
      const hasCards = Array.isArray(branch.cards) && branch.cards.length > 0
      if (!branch.branch_id || !hasCards) return
      const branchKey = String(branch.branch_id)
      if (!branchMap.has(branchKey)) {
        branchMap.set(branchKey, {
          branch_id: branchKey,
          branch_name: formatBranchLabel(branch),
          branch_location: branch.branch_location || '',
        })
      }
    })
    return Array.from(branchMap.values())
  }, [isGuestAuth, selectedVendor, vendorCards])

  // Create branch options for dropdown
  const branchOptions: DropdownOption[] = useMemo(() => {
    return availableBranches.map((branch: { branch_id: string; branch_name?: string }) => ({
      label: formatBranchLabel(branch),
      value: String(branch.branch_id),
    }))
  }, [availableBranches])

  // Auto-select when only one branch applies
  useEffect(() => {
    if (availableBranches.length === 1 && selectedBranchId === null) {
      setSelectedBranchId(String(availableBranches[0].branch_id))
    }
  }, [availableBranches, selectedBranchId])

  const guestAssignedCurrency = guestAssignedPayload.currency || 'GHS'

  // DashX / DashPass: guests use assigned-cards (no balance API per guest spec)
  const dashXCards = useMemo(() => {
    if (isGuestAuth) {
      const scoped = filterGuestAssignedByVendorAndBranch(
        filterGuestAssignedByType(guestAssignedCards, 'dashx'),
        { vendorId: selectedVendorId, branchId: selectedBranchId },
      )
      return scoped.map((card) =>
        mapGuestAssignedCardToVendorCard(card, 'dashx', guestAssignedCurrency),
      )
    }
    const cards = redemptionsAmountDashX?.data?.cards || redemptionsAmountDashX?.cards
    if (!cards || !Array.isArray(cards)) {
      return []
    }
    const currency =
      redemptionsAmountDashX?.data?.currency || redemptionsAmountDashX?.currency || 'GHS'
    return cards
      .filter((card: any) => isAssignedCardRedeemable(card))
      .map((card: any) => ({
        card_id: card.card_id || card.id,
        card_name: card.product || card.card_name || card.name || 'Unknown Card',
        card_type: 'dashx',
        card_price: card.amount || card.price || 0,
        currency: currency,
        status: card.status || 'active',
        branch_id: card.branch_id,
        branch_name: card.branch_name,
        branch_location: card.branch_location,
        vendor_id: card.vendor_id,
        vendor_name: card.vendor_name,
        recipient_id: card.recipient_id,
        cart_item_id: card.cart_item_id,
        image_url: card.images?.[0]?.file_url ? getImageUrl(card.images[0].file_url) : undefined,
        expiry_date: card.expiry_date,
        description: card.description,
      }))
  }, [
    isGuestAuth,
    guestAssignedCards,
    guestAssignedCurrency,
    redemptionsAmountDashX,
    selectedVendorId,
    selectedBranchId,
  ])

  const dashPassCards = useMemo(() => {
    if (isGuestAuth) {
      const scoped = filterGuestAssignedByVendorAndBranch(
        filterGuestAssignedByType(guestAssignedCards, 'dashpass'),
        { vendorId: selectedVendorId, branchId: selectedBranchId },
      )
      return scoped.map((card) =>
        mapGuestAssignedCardToVendorCard(card, 'dashpass', guestAssignedCurrency),
      )
    }
    const cards = redemptionsAmountDashPass?.data?.cards || redemptionsAmountDashPass?.cards
    if (!cards || !Array.isArray(cards)) {
      return []
    }
    const currency =
      redemptionsAmountDashPass?.data?.currency || redemptionsAmountDashPass?.currency || 'GHS'
    return cards
      .filter((card: any) => isAssignedCardRedeemable(card))
      .map((card: any) => ({
        card_id: card.card_id || card.id,
        card_name: card.product || card.card_name || card.name || 'Unknown Card',
        card_type: 'dashpass',
        card_price: card.amount || card.price || 0,
        currency: currency,
        status: card.status || 'active',
        branch_id: card.branch_id,
        branch_name: card.branch_name,
        branch_location: card.branch_location,
        vendor_id: card.vendor_id,
        vendor_name: card.vendor_name,
        recipient_id: card.recipient_id,
        cart_item_id: card.cart_item_id,
        image_url: card.images?.[0]?.file_url ? getImageUrl(card.images[0].file_url) : undefined,
        expiry_date: card.expiry_date,
        description: card.description,
      }))
  }, [
    isGuestAuth,
    guestAssignedCards,
    guestAssignedCurrency,
    redemptionsAmountDashPass,
    selectedVendorId,
    selectedBranchId,
  ])

  // Filter cards by selected card type and branch
  const filteredCards = useMemo(() => {
    // For DashX and DashPass, use cards from API response
    if (cardType === 'dashx') {
      return dashXCards
    }
    if (cardType === 'dashpass') {
      return dashPassCards
    }

    // For DashGo and DashPro, use vendor cards
    let cards = vendorCards
    if (cardType) {
      cards = cards.filter((card) => card.card_type === cardType)
    }
    if (selectedBranchId !== null) {
      cards = cards.filter((card) => card.branch_id === selectedBranchId)
    }
    return cards
  }, [vendorCards, cardType, selectedBranchId, dashXCards, dashPassCards])

  // Fetch balance when phone number, selected card, or vendor changes
  useEffect(() => {
    const fetchBalance = async () => {
      // Get phone number - from user if authenticated, otherwise session + local (guest verify)
      const resolvedPhone = isAuthenticated
        ? isGuestAuth
          ? getGuestPhoneFromAuth(jwtUser)
          : (userProfile as any)?.phonenumber || (userProfile as any)?.phone || ''
        : phoneNumber

      if (!resolvedPhone) {
        setBalance(null)
        setDashGoBalance(null)
        return
      }

      if (resolvedPhone.length < 9) {
        setBalance(null)
        setDashGoBalance(null)
        return
      }

      // Only fetch balance if we have the required info
      if (redemptionMethod === 'vendor_id') {
        // For vendor ID, fetch balance based on selected card
        if (selectedCard?.card_type) {
          const cardTypeLower = selectedCard.card_type.toLowerCase()

          if (
            isGuestAuth &&
            (cardTypeLower === 'dashx' || cardTypeLower === 'dashpass') &&
            selectedCard.card_price != null
          ) {
            setBalanceLoading(false)
            setBalanceError(null)
            setBalance(Number(selectedCard.card_price) || 0)
            return
          }

          // Use hooks for DashGo and DashPro
          if (cardTypeLower === 'dashgo') {
            setBalanceLoading(isLoadingRedemptionsAmountDashGo)
            setBalanceError(null)

            if (isLoadingRedemptionsAmountDashGo) {
              // Loading state is already set
            } else if (redemptionsAmountDashGo) {
              // Check for total_balance first (even if 0, it's a valid value)
              let balanceValue: number | undefined
              if (
                redemptionsAmountDashGo?.total_balance !== undefined &&
                redemptionsAmountDashGo?.total_balance !== null
              ) {
                balanceValue = redemptionsAmountDashGo.total_balance
              }

              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setDashGoBalance(numericBalance)
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setDashGoBalance(null)
                  setBalance(null)
                }
              } else {
                setDashGoBalance(null)
                setBalance(null)
              }
            } else {
              setDashGoBalance(null)
              setBalance(null)
            }
          } else if (cardTypeLower === 'dashpro') {
            setBalanceLoading(isLoadingRedemptionsAmountDashPro)
            setBalanceError(null)

            if (isLoadingRedemptionsAmountDashPro) {
              // Loading state is already set
            } else if (redemptionsAmountDashPro) {
              // Check for total_balance first (even if 0, it's a valid value)
              let balanceValue: number | undefined
              if (
                redemptionsAmountDashPro?.total_balance !== undefined &&
                redemptionsAmountDashPro?.total_balance !== null
              ) {
                balanceValue = redemptionsAmountDashPro.total_balance
              }

              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            } else {
              setBalance(null)
            }
          } else {
            // For DashX and DashPass, use recipient-amount endpoints (supports guest flow)
            if (cardTypeLower === 'dashx') {
              setBalanceLoading(isLoadingRedemptionsAmountDashX || false)
              setBalanceError(null)

              if (redemptionsAmountDashX) {
                const balanceValue =
                  redemptionsAmountDashX?.data?.total_balance !== undefined
                    ? redemptionsAmountDashX.data.total_balance
                    : redemptionsAmountDashX.total_balance
                if (balanceValue !== undefined && balanceValue !== null) {
                  const numericBalance =
                    typeof balanceValue === 'number'
                      ? balanceValue
                      : parseFloat(String(balanceValue))
                  if (!isNaN(numericBalance)) {
                    setBalance(numericBalance)
                    setBalanceError(null)
                  } else {
                    setBalance(null)
                  }
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            } else if (cardTypeLower === 'dashpass') {
              setBalanceLoading(isLoadingRedemptionsAmountDashPass || false)
              setBalanceError(null)

              if (redemptionsAmountDashPass) {
                const balanceValue =
                  redemptionsAmountDashPass?.data?.total_balance !== undefined
                    ? redemptionsAmountDashPass.data.total_balance
                    : redemptionsAmountDashPass.total_balance
                if (balanceValue !== undefined && balanceValue !== null) {
                  const numericBalance =
                    typeof balanceValue === 'number'
                      ? balanceValue
                      : parseFloat(String(balanceValue))
                  if (!isNaN(numericBalance)) {
                    setBalance(numericBalance)
                    setBalanceError(null)
                  } else {
                    setBalance(null)
                  }
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            }
          }
        } else {
          // If no card selected, use hooks to fetch DashGo or DashPro balance based on card type
          setBalanceLoading(isLoadingRedemptionsAmountDashGo || isLoadingRedemptionsAmountDashPro)
          setBalanceError(null)

          if (cardType === 'dashgo') {
            // Use DashGo redemption amount hook
            if (isLoadingRedemptionsAmountDashGo) {
              // Loading state is already set above
            } else if (redemptionsAmountDashGo) {
              // Extract balance from the response
              // Check for total_balance first (even if 0, it's a valid value)
              let balanceValue: number | undefined
              if (
                redemptionsAmountDashGo?.data?.total_balance !== undefined &&
                redemptionsAmountDashGo?.data?.total_balance !== null
              ) {
                balanceValue = redemptionsAmountDashGo.data.total_balance
              } else if (
                redemptionsAmountDashGo?.total_balance !== undefined &&
                redemptionsAmountDashGo?.total_balance !== null
              ) {
                balanceValue = redemptionsAmountDashGo.total_balance
              } else if (
                redemptionsAmountDashGo?.data?.balance !== undefined &&
                redemptionsAmountDashGo?.data?.balance !== null
              ) {
                balanceValue = redemptionsAmountDashGo.data.balance
              } else if (
                redemptionsAmountDashGo?.balance !== undefined &&
                redemptionsAmountDashGo?.balance !== null
              ) {
                balanceValue = redemptionsAmountDashGo.balance
              } else if (
                redemptionsAmountDashGo?.data?.amount !== undefined &&
                redemptionsAmountDashGo?.data?.amount !== null
              ) {
                balanceValue = redemptionsAmountDashGo.data.amount
              } else if (
                redemptionsAmountDashGo?.amount !== undefined &&
                redemptionsAmountDashGo?.amount !== null
              ) {
                balanceValue = redemptionsAmountDashGo.amount
              }

              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setDashGoBalance(numericBalance)
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setDashGoBalance(null)
                  setBalance(null)
                }
              } else {
                setDashGoBalance(null)
                setBalance(null)
              }
            } else {
              setDashGoBalance(null)
              setBalance(null)
            }
          } else if (cardType === 'dashpro') {
            // Use DashPro redemption amount hook
            if (isLoadingRedemptionsAmountDashPro) {
              // Loading state is already set above
            } else if (redemptionsAmountDashPro) {
              // Extract balance from the response
              // Check for total_balance first (even if 0, it's a valid value)
              let balanceValue: number | undefined
              if (
                redemptionsAmountDashPro?.total_balance !== undefined &&
                redemptionsAmountDashPro?.total_balance !== null
              ) {
                balanceValue = redemptionsAmountDashPro.total_balance
              } else if (
                redemptionsAmountDashPro?.balance !== undefined &&
                redemptionsAmountDashPro?.balance !== null
              ) {
                balanceValue = redemptionsAmountDashPro.balance
              } else if (
                redemptionsAmountDashPro?.amount !== undefined &&
                redemptionsAmountDashPro?.amount !== null
              ) {
                balanceValue = redemptionsAmountDashPro.amount
              }

              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            } else {
              setBalance(null)
            }
          } else if (cardType === 'dashx') {
            // Use DashX redemption amount hook
            setBalanceLoading(isLoadingRedemptionsAmountDashX || false)
            setBalanceError(null)

            if (redemptionsAmountDashX) {
              const balanceValue =
                redemptionsAmountDashX?.data?.total_balance !== undefined
                  ? redemptionsAmountDashX.data.total_balance
                  : redemptionsAmountDashX.total_balance
              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            } else {
              setBalance(null)
            }
          } else if (cardType === 'dashpass') {
            // Use DashPass redemption amount hook
            setBalanceLoading(isLoadingRedemptionsAmountDashPass || false)
            setBalanceError(null)

            if (redemptionsAmountDashPass) {
              const balanceValue =
                redemptionsAmountDashPass?.data?.total_balance !== undefined
                  ? redemptionsAmountDashPass.data.total_balance
                  : redemptionsAmountDashPass.total_balance
              if (balanceValue !== undefined && balanceValue !== null) {
                const numericBalance =
                  typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
                if (!isNaN(numericBalance)) {
                  setBalance(numericBalance)
                  setBalanceError(null)
                } else {
                  setBalance(null)
                }
              } else {
                setBalance(null)
              }
            } else {
              setBalance(null)
            }
          } else {
            setBalance(null)
          }
        }
      } else if (redemptionMethod === 'vendor_mobile_money' && isAuthenticated) {
        setBalanceLoading(isLoadingRedemptionsAmountDashPro)
        setBalanceError(null)

        if (isLoadingRedemptionsAmountDashPro) {
          return
        }

        if (redemptionsAmountDashPro) {
          const balanceValue =
            redemptionsAmountDashPro?.total_balance !== undefined &&
            redemptionsAmountDashPro?.total_balance !== null
              ? redemptionsAmountDashPro.total_balance
              : redemptionsAmountDashPro?.data?.total_balance

          if (balanceValue !== undefined && balanceValue !== null) {
            const numericBalance =
              typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
            setBalance(!isNaN(numericBalance) ? numericBalance : null)
            setBalanceError(null)
          } else {
            setBalance(null)
          }
        } else {
          setBalance(null)
        }
      }
    }

    fetchBalance()
  }, [
    phoneNumber,
    selectedCard,
    selectedVendor,
    cardType,
    isAuthenticated,
    isGuestAuth,
    jwtUser,
    userProfile,
    redemptionMethod,
    redemptionsAmountDashGo,
    redemptionsAmountDashPro,
    redemptionsAmountDashX,
    redemptionsAmountDashPass,
    isLoadingRedemptionsAmountDashGo,
    isLoadingRedemptionsAmountDashPro,
    isLoadingRedemptionsAmountDashX,
    isLoadingRedemptionsAmountDashPass,
  ])

  // Handle vendor selection
  const applyVendorSelection = useCallback(
    (
      vendorId: string,
      displayName: string,
      gvid?: string,
      searchVendor?: VendorSearchResult | null,
      options?: { preserveCardType?: boolean; preserveBranch?: boolean },
    ) => {
      const vendor = vendors.find((v: { vendor_id?: string | number }) => {
        return String(v.vendor_id ?? '') === String(vendorId)
      })

      if (vendor) {
        setSelectedVendor({
          ...vendor,
          gvid: gvid || vendor.gvid || searchVendor?.gvid,
          branches: searchVendor?.branches ?? vendor.branches,
        })
        setSelectedVendorId(String(vendorId))
        setVendorName(vendor.business_name || vendor.vendor_name || displayName || 'Unknown Vendor')
      } else {
        setSelectedVendor({
          vendor_id: vendorId,
          id: searchVendor?.id || vendorId,
          business_name: displayName,
          vendor_name: displayName,
          gvid: gvid || searchVendor?.gvid,
          branches: searchVendor?.branches,
          branches_with_cards: [],
        })
        setSelectedVendorId(String(vendorId))
        setVendorName(displayName || 'Unknown Vendor')
      }

      if (gvid) {
        setVendorIdInput(gvid)
      }

      setSelectedCard(null)
      if (!options?.preserveBranch) {
        setSelectedBranchId(null)
      }
      if (!options?.preserveCardType) {
        setCardType('')
      }
      setAmount('')
    },
    [vendors, setVendorIdInput],
  )

  useEffect(() => {
    if (redemptionMethod !== 'vendor_id' || !vendorIdExactMatch) return
    if (vendorIdSearchResults.length > 1 && !isExactGvidPathLookup(debouncedVendorId)) return
    if (String(selectedVendorId) === String(vendorIdExactMatch.vendor_id)) return
    const parsed = parseRedemptionSearchParams(searchParams)
    applyVendorSelection(
      vendorIdExactMatch.vendor_id,
      vendorIdExactMatch.vendor_name || vendorIdExactMatch.business_name || '',
      vendorIdExactMatch.gvid,
      vendorIdExactMatch,
      {
        preserveCardType: Boolean(parsed.card_type),
        preserveBranch: Boolean(parsed.branch_id),
      },
    )
  }, [
    redemptionMethod,
    vendorIdExactMatch,
    vendorIdSearchResults.length,
    debouncedVendorId,
    selectedVendorId,
    applyVendorSelection,
    searchParams,
  ])

  useEffect(() => {
    if (redemptionMethod !== 'vendor_id') return
    const parsed = parseRedemptionSearchParams(searchParams)
    const vendorId = parsed.vendor_id?.trim()
    if (!vendorId || parsed.vendor_gvid) return
    if (String(selectedVendorId) === vendorId) return

    const vendor = vendors.find(
      (v: { vendor_id?: string | number }) => String(v.vendor_id ?? '') === vendorId,
    )
    if (!vendor) return

    applyVendorSelection(
      vendorId,
      vendor.business_name || vendor.vendor_name || '',
      vendor.gvid,
      null,
      {
        preserveCardType: Boolean(parsed.card_type),
        preserveBranch: Boolean(parsed.branch_id),
      },
    )
  }, [vendors, searchParams, redemptionMethod, selectedVendorId, applyVendorSelection])

  useEffect(() => {
    const targetId = pendingDeepLinkCardIdRef.current
    if (!targetId || step !== 'details') return

    const parsed = parseRedemptionSearchParams(searchParams)
    const match = findRedemptionCardInList(filteredCards, targetId, {
      branchId: parsed.branch_id ?? selectedBranchId,
    })
    if (!match) return

    setSelectedCard(match)
    pendingDeepLinkCardIdRef.current = null
  }, [filteredCards, searchParams, selectedBranchId, step])

  const handleMethodSelect = (method: RedemptionMethod) => {
    setRedemptionMethod(method)
    setStep('details')
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setCardType(method === 'vendor_mobile_money' ? 'dashpro' : '')
    setAmount('')
    setBalance(null)
    setDashGoBalance(null)
    setSelectedCard(null)
    setSelectedBranchId(null)
    setRedemptionSuccess(null)
    resetVendorMobileMoney()
    resetVendorLookup()
  }

  // Handle amount validation (positive, max 2 decimal places)
  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmount('')
      return
    }
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
    }
  }

  // Handle redemption submission
  const handleRedeem = async () => {
    if (redemptionMethod === 'vendor_mobile_money') {
      if (!isAuthenticated) {
        toast.error('Please verify your phone to continue as a guest.')
        return
      }
      if (!isVendorPhoneVerified) {
        toast.error('Please enter a valid vendor mobile money number')
        return
      }
      if (!isValidRedemptionAmountInput(amount)) {
        toast.error('Please enter a valid amount (up to 2 decimal places)')
        return
      }
      const redeemAmount = roundRedemptionAmount(parseFloat(amount))
      if (balance !== null && redeemAmount > balance) {
        toast.error('Insufficient DashPro balance')
        return
      }
      const dashProCards =
        redemptionsAmountDashPro?.data?.cards || redemptionsAmountDashPro?.cards || []
      if (dashProCards.length === 0) {
        toast.error('You have no DashPro balance to redeem')
        return
      }
    }

    // Validate before processing redemption
    if (redemptionMethod === 'vendor_id') {
      if (
        !selectedCard &&
        cardType !== 'dashgo' &&
        cardType !== 'dashpro' &&
        (cardType === 'dashx' || cardType === 'dashpass')
      ) {
        toast.error('Please select a card')
        return
      }

      if (
        !cardType ||
        (cardType !== 'dashgo' &&
          cardType !== 'dashpro' &&
          cardType !== 'dashx' &&
          cardType !== 'dashpass')
      ) {
        toast.error('Please select a valid card type')
        return
      }

      if (vendorIdFlowRequiresBranch(availableBranches.length, selectedBranchId)) {
        toast.error('Please select a branch')
        return
      }

      if (!selectedVendorGvid) {
        toast.error('Please select a vendor')
        return
      }

      if (cardType === 'dashgo' || cardType === 'dashpro') {
        if (!isValidRedemptionAmountInput(amount)) {
          toast.error('Please enter a valid amount (up to 2 decimal places)')
          return
        }
        const redeemAmount = roundRedemptionAmount(parseFloat(amount))
        const cap = cardType === 'dashgo' ? dashGoBalance : balance
        if (cap !== null && redeemAmount > cap) {
          toast.error(`Insufficient ${cardType === 'dashgo' ? 'DashGo' : 'DashPro'} balance`)
          return
        }
        const dashGoCards =
          redemptionsAmountDashGo?.data?.cards || redemptionsAmountDashGo?.cards || []
        const dashProCards =
          redemptionsAmountDashPro?.data?.cards || redemptionsAmountDashPro?.cards || []
        const activeCards = cardType === 'dashgo' ? dashGoCards : dashProCards
        if (activeCards.length === 0) {
          const label = cardType === 'dashgo' ? 'DashGo' : 'DashPro'
          toast.error(`You have no ${label} balance to redeem`)
          return
        }
      }

      const guestOrPhone = isGuestAuth
        ? getGuestPhoneFromAuth(jwtUser)
        : isAuthenticated
          ? (userProfile as any)?.phonenumber || (userProfile as any)?.phone || ''
          : phoneNumber

      if (!guestOrPhone) {
        toast.error('Phone number is required')
        return
      }
    }

    await processRedemption()
  }

  // Process redemption after OTP verification
  const processRedemption = async () => {
    if (redemptionMethod === 'vendor_mobile_money') {
      if (!isAuthenticated) {
        toast.error('Please verify your phone to continue.')
        return
      }
      if (!isVendorPhoneVerified) {
        toast.error('Please enter a valid vendor mobile money number')
        return
      }
      if (!isValidRedemptionAmountInput(amount)) {
        toast.error('Please enter a valid amount (up to 2 decimal places)')
        return
      }

      const userPhoneNumber = isGuestAuth
        ? getGuestPhoneFromAuth(jwtUser)
        : (userProfile as { phonenumber?: string; phone?: string })?.phonenumber ||
          (userProfile as { phonenumber?: string; phone?: string })?.phone ||
          ''

      if (!userPhoneNumber) {
        toast.error('Phone number is required')
        return
      }

      setIsProcessingRedemption(true)
      try {
        const redeemAmount = roundRedemptionAmount(parseFloat(amount))
        const vendorPhone = convertToInternationalFormat(rawVendorPhone)

        if (isGuestAuth) {
          if (!resolvedProvider) {
            toast.error('Unable to detect mobile money provider. Please check the number.')
            return
          }

          const guestPayload = buildGuestCardsRedemptionPayload({
            card_type: 'DashPro',
            amount: redeemAmount,
            vendor_phone_number: vendorPhone,
            provider: resolvedProvider,
          })
          const response = await processGuestCardsRedemptionMutation.mutateAsync(guestPayload)

          if (isGuestRedemptionSuccess(response)) {
            setVendorName(vendorPhoneName || 'Mobile money')
            setRedemptionSuccess({
              amount: response?.data?.amount ?? redeemAmount,
              transaction_reference: response?.data?.transaction_reference,
              redemption_code: response?.data?.redemption_code,
              status: response?.data?.status,
            })
            setStep('success')
            invalidateRedemptionGuestQueries()
          }
        } else if (isAuthenticated) {
          const response = await processDashProForUserMutation.mutateAsync({
            vendor_phone_number: vendorPhone,
            amount: redeemAmount,
          })

          if (isRedemptionApiSuccess(response)) {
            setVendorName(vendorPhoneName || 'Mobile money')
            setRedemptionSuccess({
              amount: redeemAmount,
              transaction_reference: response?.data?.transaction_reference,
              redemption_code: response?.data?.redemption_code,
              status: response?.data?.status,
            })
            setStep('success')
          }
        } else {
          const response = await processDashProPublicMutation.mutateAsync({
            vendor_phone_number: vendorPhone,
            amount: redeemAmount,
            user_phone_number: convertToInternationalFormat(userPhoneNumber),
          })

          if (isRedemptionApiSuccess(response)) {
            setVendorName(vendorPhoneName || 'Mobile money')
            setRedemptionSuccess({
              amount: response?.data?.amount ?? redeemAmount,
              transaction_reference: response?.data?.transaction_reference,
              redemption_code: response?.data?.redemption_code,
              status: response?.data?.status,
            })
            setStep('success')
          }
        }
      } catch (error: unknown) {
        console.error('DashPro mobile money redemption error:', error)
      } finally {
        setIsProcessingRedemption(false)
      }
      return
    }

    if (redemptionMethod === 'vendor_id') {
      // For vendor_id method, DashGo, DashPro, DashX, and DashPass are allowed
      if (
        !selectedCard &&
        cardType !== 'dashgo' &&
        cardType !== 'dashpro' &&
        (cardType === 'dashx' || cardType === 'dashpass')
      ) {
        // For DashX and DashPass, a card must be selected
        toast.error('Please select a card')
        return
      }

      if (
        !cardType ||
        (cardType !== 'dashgo' &&
          cardType !== 'dashpro' &&
          cardType !== 'dashx' &&
          cardType !== 'dashpass')
      ) {
        toast.error('Please select a valid card type')
        return
      }

      if (vendorIdFlowRequiresBranch(availableBranches.length, selectedBranchId)) {
        toast.error('Please select a branch')
        return
      }

      // For DashGo and DashPro, amount is required
      if (cardType === 'dashgo' || cardType === 'dashpro') {
        if (!isValidRedemptionAmountInput(amount)) {
          toast.error('Please enter a valid amount (up to 2 decimal places)')
          return
        }
      }

      if (
        selectedCard &&
        (cardType === 'dashx' || cardType === 'dashpass') &&
        !isAssignedCardRedeemable({
          status: selectedCard.status,
          expiry_date: selectedCard.expiry_date,
        })
      ) {
        toast.error(CARD_EXPIRED_MESSAGE)
        return
      }

      const userPhoneNumber = isAuthenticated
        ? isGuestAuth
          ? getGuestPhoneFromAuth(jwtUser)
          : (userProfile as any)?.phonenumber || (userProfile as any)?.phone || ''
        : phoneNumber

      if (!userPhoneNumber) {
        toast.error('Phone number is required')
        return
      }

      // Convert card type to API format
      const cardTypeForAPI = formatCardTypeForAPI(cardType)
      if (
        !cardTypeForAPI ||
        (cardTypeForAPI !== 'DashGo' &&
          cardTypeForAPI !== 'DashPro' &&
          cardTypeForAPI !== 'DashX' &&
          cardTypeForAPI !== 'DashPass')
      ) {
        toast.error('Invalid card type')
        return
      }

      setIsProcessingRedemption(true)
      try {
        if (!isAuthenticated) {
          toast.error('Please verify your phone and email to continue as a guest.')
          setIsProcessingRedemption(false)
          return
        }

        const branchId = String(selectedBranchId ?? selectedCard?.branch_id ?? '').trim()
        if (!branchId) {
          toast.error('Please select a branch')
          setIsProcessingRedemption(false)
          return
        }

        if (cardType === 'dashgo' || cardType === 'dashpro') {
          const dashGoCards =
            redemptionsAmountDashGo?.data?.cards || redemptionsAmountDashGo?.cards || []
          const dashProCards =
            redemptionsAmountDashPro?.data?.cards || redemptionsAmountDashPro?.cards || []
          const activeCards = cardType === 'dashgo' ? dashGoCards : dashProCards
          if (activeCards.length === 0 && !isCardTypeAvailable(cardType)) {
            toast.error(`You have no ${cardTypeForAPI} balance to redeem`)
            setIsProcessingRedemption(false)
            return
          }
        }

        if (isGuestAuth) {
          if (cardTypeForAPI === 'DashPro') {
            toast.error('DashPro redemption uses mobile money payout. Please select that method.')
            setIsProcessingRedemption(false)
            return
          }

          let guestPayload
          if (cardTypeForAPI === 'DashGo') {
            const dashGoCards =
              redemptionsAmountDashGo?.data?.cards || redemptionsAmountDashGo?.cards || []
            const redeemAmount = roundRedemptionAmount(parseFloat(amount))
            const cardId =
              String(selectedCard?.card_id ?? '').trim() ||
              pickGuestRedemptionCardId(dashGoCards, redeemAmount)
            if (!cardId) {
              toast.error('Please select a card')
              setIsProcessingRedemption(false)
              return
            }
            guestPayload = buildGuestCardsRedemptionPayload({
              card_type: 'DashGo',
              card_id: cardId,
              branch_id: branchId,
              amount: redeemAmount,
            })
          } else if (cardTypeForAPI === 'DashX' || cardTypeForAPI === 'DashPass') {
            const cardId = String(selectedCard?.card_id ?? '').trim()
            if (!cardId) {
              toast.error('Please select a card')
              setIsProcessingRedemption(false)
              return
            }
            guestPayload = buildGuestCardsRedemptionPayload({
              card_type: cardTypeForAPI,
              branch_id: branchId,
              card_id: cardId,
            })
          } else {
            toast.error('Invalid card type')
            setIsProcessingRedemption(false)
            return
          }

          const response = await processGuestCardsRedemptionMutation.mutateAsync(guestPayload)

          if (isGuestRedemptionSuccess(response)) {
            setRedemptionSuccess(response?.data ?? null)
            if ('card_id' in guestPayload) {
              setRedeemedCardId(guestPayload.card_id)
            } else if (selectedCard?.card_id) {
              setRedeemedCardId(selectedCard.card_id)
            }
            setStep('success')
            invalidateRedemptionGuestQueries()
          }
          return
        }

        const vendorGvid = selectedVendorGvid
        if (!vendorGvid) {
          toast.error('Vendor ID (GVID) is required for redemption')
          setIsProcessingRedemption(false)
          return
        }

        let payload
        if (cardTypeForAPI === 'DashGo' || cardTypeForAPI === 'DashPro') {
          payload = buildCardsRedemptionPayload({
            branch_id: branchId,
            vendor_gvid: vendorGvid,
            card_type: cardTypeForAPI,
            amount: roundRedemptionAmount(parseFloat(amount)),
          })
        } else {
          const cardId = String(selectedCard?.card_id ?? '').trim()
          if (!cardId) {
            toast.error('Please select a card')
            setIsProcessingRedemption(false)
            return
          }
          payload = buildCardsRedemptionPayload({
            branch_id: branchId,
            vendor_gvid: vendorGvid,
            card_type: cardTypeForAPI,
            card_id: cardId,
          })
        }

        const response = await processUserRedemptionCardsMutation.mutateAsync(payload)

        if (isRedemptionApiSuccess(response)) {
          setRedemptionSuccess(response?.data ?? null)
          if ('card_id' in payload) {
            setRedeemedCardId(payload.card_id)
          } else if (selectedCard?.card_id) {
            setRedeemedCardId(selectedCard.card_id)
          }
          setStep('success')
        }
      } catch (error: any) {
        console.error('Redemption error:', error)
      } finally {
        setIsProcessingRedemption(false)
      }
    }
  }

  const handleResetVendor = useCallback(() => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setCardType('')
    setSelectedCard(null)
    setSelectedBranchId(null)
    setAmount('')
    setBalance(null)
    setDashGoBalance(null)
    setRedemptionSuccess(null)
    resetVendorLookup()
  }, [resetVendorLookup])

  useEffect(() => {
    if (redemptionMethod !== 'vendor_id' || isAuthenticated) return
    if (!selectedVendorId) return
    handleResetVendor()
  }, [redemptionMethod, isAuthenticated, selectedVendorId, handleResetVendor])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      <div className="flex min-h-screen">
        {/* Left Panel - Professional Illustration (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#402D87] to-[#2D1A72] text-white relative overflow-hidden">
          <div className="flex flex-col justify-center items-center h-full relative z-10 px-12">
            {/* Floating Cards Animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[15%] left-[10%] w-20 h-20 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl flex items-center justify-center text-3xl animate-float">
                <Icon icon="bi:shield-check" />
              </div>
              <div className="absolute top-[60%] right-[15%] w-20 h-20 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl flex items-center justify-center text-3xl animate-float-delay-2">
                <Icon icon="bi:gift" />
              </div>
              <div className="absolute bottom-[20%] left-[20%] w-20 h-20 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl flex items-center justify-center text-3xl animate-float-delay-4">
                <Icon icon="bi:phone" />
              </div>
            </div>

            {/* Main Visual - Secure Badge */}
            <div className="relative my-8">
              <div className="relative w-32 h-32 bg-linear-to-br from-[#5B47D4] to-[#402D87] rounded-full flex items-center justify-center shadow-2xl">
                <Icon icon="bi:shield-lock-fill" className="text-5xl text-white z-10" />
                <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse-ring"></div>
              </div>
            </div>

            {/* Content Text */}
            <div className="text-center max-w-md">
              <h2 className="text-4xl font-bold mb-4 leading-tight">Secure Gift Card Redemption</h2>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                Redeem your gift cards and vouchers with confidence using our bank-grade security
                platform
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-col gap-4">
                {/* <div className="flex items-center gap-3 px-4 py-3 bg-white/8 backdrop-blur-md border border-white/12 rounded-xl">
                    <Icon icon="bi:shield-fill-check" className="text-xl text-yellow-400" />
                    <span className="text-sm font-medium">256-bit SSL Encryption</span>
                  </div> */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/8 backdrop-blur-md border border-white/12 rounded-xl">
                  <Icon icon="bi:lightning-charge-fill" className="text-xl text-yellow-400" />
                  <span className="text-sm font-medium">Instant Processing</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/8 backdrop-blur-md border border-white/12 rounded-xl">
                  <Icon icon="bi:telephone-fill" className="text-xl text-yellow-400" />
                  <span className="text-sm font-medium">SMS Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="w-full lg:w-1/2 bg-white min-h-screen flex flex-col justify-center p-6 md:p-12">
          <div className="max-w-lg w-full mx-auto">
            {/* Form Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#402D87] to-[#5B47D4] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Icon icon="bi:credit-card-2-front" className="text-4xl text-white" />
              </div>
              <Text variant="h1" weight="bold" className="text-gray-900 mb-2">
                Redeem Your Gift Card
              </Text>
              <Text variant="p" className="text-gray-600">
                Enter your details below to start the secure redemption process
              </Text>
            </div>

            {/* Form Container */}
            <div className="space-y-6">
              {step === 'method' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                      Select Redemption Method
                    </Text>
                    <Text variant="span" className="text-sm text-gray-500">
                      Choose how you want to redeem your gift card
                    </Text>
                  </div>

                  <RadioGroup
                    value={redemptionMethod}
                    onValueChange={(value) => handleMethodSelect(value as RedemptionMethod)}
                    className="space-y-4"
                  >
                    <div className="flex items-start space-x-3 p-5 border-2 rounded-xl border-gray-200 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md">
                      <RadioGroupItem value="vendor_mobile_money" id="vendor_mobile_money" />
                      <label
                        htmlFor="vendor_mobile_money"
                        className="flex-1 cursor-pointer"
                        onClick={() => handleMethodSelect('vendor_mobile_money')}
                      >
                        <div className="font-semibold text-gray-900 mb-1">Vendor mobile money</div>
                        <div className="text-sm text-gray-600">
                          Redeem DashPro to any mobile money number
                        </div>
                      </label>
                    </div>
                    <div className="flex items-start space-x-3 p-5 border-2 rounded-xl border-gray-200 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md">
                      <RadioGroupItem value="vendor_id" id="vendor_id" />
                      <label
                        htmlFor="vendor_id"
                        className="flex-1 cursor-pointer"
                        onClick={() => handleMethodSelect('vendor_id')}
                      >
                        <div className="font-semibold text-gray-900 mb-1">Vendor ID</div>
                        <div className="text-sm text-gray-600">
                          Redeem DashGo, DashX, DashPass, and DashPro at a vendor branch
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setStep('method')
                      setRedemptionMethod('')
                      resetVendorMobileMoney()
                      resetVendorLookup()
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                  >
                    <Icon icon="bi:arrow-left" className="text-lg" />
                    <span>Back</span>
                  </button>

                  {redemptionMethod === 'vendor_mobile_money' && (
                    <div className="space-y-6">
                      <div className="mb-2">
                        <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                          Vendor mobile money
                        </Text>
                        <Text variant="span" className="text-sm text-gray-500">
                          Enter the mobile money number where funds should be sent. Only DashPro
                          cards can be redeemed with this option.
                        </Text>
                      </div>

                      {!isAuthenticated && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
                          <Button
                            type="button"
                            variant="primary"
                            className="w-full bg-linear-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0"
                            onClick={() =>
                              openGuestVerifyModal(
                                { redemptionOnly: true },
                                invalidateRedemptionGuestQueries,
                              )
                            }
                          >
                            <Icon icon="bi:shield-lock" className="mr-2 inline" />
                            Verify your phone
                          </Button>
                        </div>
                      )}

                      {isAuthenticated && (
                        <>
                          <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
                            <Text
                              variant="span"
                              weight="semibold"
                              className="text-primary-800 text-sm"
                            >
                              DashPro only
                            </Text>
                            <Text variant="span" className="block text-sm text-primary-700 mt-1">
                              Other card types require vendor ID and branch selection.
                            </Text>
                          </div>

                          <div className="form-group">
                            <div className="flex justify-between items-center mb-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Icon icon="bi:phone" className="text-primary-600" />
                                Vendor mobile money number <span className="text-red-500">*</span>
                              </label>
                              <div className="text-xs">
                                {validatingVendor && (
                                  <span className="text-blue-600 flex items-center gap-1">
                                    <Loader />
                                    Verifying…
                                  </span>
                                )}
                                {isVendorPhoneVerified && (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <Icon icon="bi:check-circle-fill" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <BasePhoneInput
                              selectedVal={rawVendorPhone}
                              handleChange={setRawVendorPhone}
                              placeholder="Enter mobile money number"
                              options={countries}
                              name="vendorMobileMoneyPhone"
                              id="vendorMobileMoneyPhone"
                            />
                            {vendorPhoneError ? (
                              <Text variant="span" className="text-sm text-red-600 block mt-2">
                                {vendorPhoneError}
                              </Text>
                            ) : null}
                            {isVendorPhoneVerified && vendorPhoneName ? (
                              <div className="mt-3 p-3 border border-green-200 rounded-xl bg-green-50 flex items-center gap-3">
                                <Icon
                                  icon="bi:patch-check-fill"
                                  className="text-green-600 text-xl"
                                />
                                <div>
                                  <Text
                                    variant="span"
                                    weight="semibold"
                                    className="text-gray-900 text-sm"
                                  >
                                    {vendorPhoneName}
                                  </Text>
                                  <Text variant="span" className="block text-xs text-gray-500">
                                    Account verified
                                  </Text>
                                </div>
                              </div>
                            ) : null}
                            {momoResolveWarning ? (
                              <Text variant="span" className="text-sm text-amber-700 block mt-2">
                                {momoResolveWarning}
                              </Text>
                            ) : null}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Amount <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Enter amount to redeem"
                              value={amount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleAmountChange(e.target.value)
                              }
                            />
                          </div>

                          {balanceLoading ? (
                            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                              <Loader />
                              <Text variant="span" className="text-gray-600 text-sm">
                                Loading DashPro balance...
                              </Text>
                            </div>
                          ) : balance !== null ? (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                              <Text variant="span" className="text-sm text-gray-600 block mb-1">
                                DashPro balance
                              </Text>
                              <Text variant="h4" weight="semibold" className="text-primary-600">
                                GHS {balance.toFixed(2)}
                              </Text>
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <Text variant="span" className="text-gray-600 text-sm">
                                Unable to fetch DashPro balance
                              </Text>
                            </div>
                          )}

                          <Button
                            variant="secondary"
                            onClick={handleRedeem}
                            disabled={
                              !isVendorPhoneVerified ||
                              !isValidRedemptionAmountInput(amount) ||
                              (balance !== null && parseFloat(amount) > balance) ||
                              isProcessingRedemption
                            }
                            loading={isProcessingRedemption}
                            className="w-full"
                          >
                            {isProcessingRedemption ? 'Processing...' : 'Redeem DashPro'}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {redemptionMethod === 'vendor_id' && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="mb-6">
                        {!isAuthenticated ? (
                          <>
                            <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                              Continue as guest
                            </Text>
                            <Text variant="span" className="text-sm text-gray-500">
                              Verify your phone with a one-time code (same as guest checkout). Name
                              and email are optional. After verification, search for your vendor and
                              branch.
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                              Vendor name or ID
                            </Text>
                            <Text variant="span" className="text-sm text-gray-500">
                              Enter the vendor name or ID, then select the branch
                            </Text>
                          </>
                        )}
                      </div>

                      {!isAuthenticated && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
                          <Button
                            type="button"
                            variant="primary"
                            className="w-full bg-linear-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0"
                            onClick={() =>
                              openGuestVerifyModal(
                                { redemptionOnly: true },
                                invalidateRedemptionGuestQueries,
                              )
                            }
                          >
                            <Icon icon="bi:shield-lock" className="mr-2 inline" />
                            Verify your phone
                          </Button>
                        </div>
                      )}

                      {isAuthenticated && (
                        <>
                          <div className="form-group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Icon icon="bi:shop" className="text-primary-600" />
                              Vendor name or ID <span className="text-red-500">*</span>
                            </label>
                            {!selectedVendor ? (
                              <>
                                <Input
                                  value={vendorIdInput}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    setVendorIdInput(e.target.value)
                                  }
                                  placeholder="Search by name (e.g. KFC) or vendor ID (e.g. GH-0001)"
                                />
                                <Text variant="span" className="text-xs text-gray-500 block mt-2">
                                  Start typing to search. Select a vendor, then choose a branch.
                                </Text>
                                {isSearchingById ? (
                                  <Text variant="span" className="text-xs text-gray-500 block mt-2">
                                    Looking up vendor…
                                  </Text>
                                ) : null}
                                {debouncedVendorId.length >= 2 &&
                                !isSearchingById &&
                                vendorIdSearchResults.length === 0 ? (
                                  <Text variant="span" className="text-sm text-amber-700 block mt-2">
                                    No vendor found for &quot;{debouncedVendorId}&quot;. Try the full
                                    vendor ID (e.g. GH-0001) or search by business name.
                                  </Text>
                                ) : null}
                                {debouncedVendorId.length >= 2 &&
                                vendorIdSearchResults.length > 0 ? (
                                  <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                                    {vendorIdSearchResults.map((result) => (
                                      <li key={result.vendor_id}>
                                        <button
                                          type="button"
                                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-primary-50"
                                          onClick={() =>
                                            applyVendorSelection(
                                              result.vendor_id,
                                              result.vendor_name ||
                                                result.business_name ||
                                                '',
                                              result.gvid,
                                              result,
                                            )
                                          }
                                        >
                                          <span className="text-sm font-medium text-gray-900">
                                            {result.vendor_name || result.business_name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {result.gvid}
                                          </span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </>
                            ) : (
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                      <Icon icon="bi:shop-window" className="text-white text-lg" />
                                    </div>
                                    <div>
                                      <Text
                                        variant="span"
                                        weight="semibold"
                                        className="text-gray-900"
                                      >
                                        {vendorName}
                                      </Text>
                                      {selectedVendor?.gvid ? (
                                        <Text
                                          variant="span"
                                          className="text-gray-500 text-sm block"
                                        >
                                          ID: {selectedVendor.gvid}
                                        </Text>
                                      ) : null}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleResetVendor}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Branch Selection */}
                          {selectedVendor && availableBranches.length > 0 && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Branch <span className="text-red-500">*</span>
                              </label>
                              <Combobox
                                options={branchOptions}
                                value={selectedBranchId !== null ? String(selectedBranchId) : ''}
                                onChange={(e: any) => {
                                  const branchId = e.target.value
                                  if (branchId) {
                                    setSelectedBranchId(String(branchId))
                                    setSelectedCard(null) // Reset card selection when branch changes
                                    setCardType('') // Reset card type when branch changes
                                  } else {
                                    setSelectedBranchId(null)
                                  }
                                }}
                                placeholder="Select a branch..."
                              />
                            </div>
                          )}

                          {/* Card type selection - only show if vendor is selected and (no branches OR branch selected) */}
                          {selectedVendor &&
                            (availableBranches.length === 0 || selectedBranchId !== null) && (
                              <>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Card Type <span className="text-red-500">*</span>
                                  </label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(
                                      [
                                        { type: 'dashgo' as const, label: 'DashGo' },
                                        { type: 'dashpro' as const, label: 'DashPro' },
                                        { type: 'dashx' as const, label: 'DashX' },
                                        { type: 'dashpass' as const, label: 'DashPass' },
                                      ] as const
                                    ).map(({ type, label }) => {
                                      const available = isCardTypeAvailable(type)
                                      return (
                                        <button
                                          key={type}
                                          type="button"
                                          disabled={!available}
                                          onClick={() => {
                                            if (!available) return
                                            setCardType(type)
                                            setSelectedCard(null)
                                          }}
                                          className={`p-4 border-2 rounded-lg transition-colors ${
                                            cardType === type
                                              ? 'border-primary-500 bg-primary-50'
                                              : 'border-gray-200 hover:border-gray-300'
                                          } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                          {label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>

                                {/* Show cards for selected card type (DashX and DashPass) */}
                                {cardType && (cardType === 'dashx' || cardType === 'dashpass') && (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Select Card <span className="text-red-500">*</span>
                                    </label>
                                    {filteredCards.length === 0 ? (
                                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <Text variant="span" className="text-yellow-800 text-sm">
                                          No {cardType === 'dashx' ? 'DashX' : 'DashPass'} cards
                                          available
                                        </Text>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[32rem] overflow-y-auto pr-1">
                                        {filteredCards.map((card: VendorCard) => {
                                          const key =
                                            card.cart_item_id != null
                                              ? `cart-${card.cart_item_id}`
                                              : `${card.card_id}-${card.branch_id ?? 'nb'}-${card.recipient_id ?? 'nr'}`
                                          const bothHaveCartItem =
                                            card.cart_item_id != null &&
                                            selectedCard?.cart_item_id != null
                                          const isSelected =
                                            !!selectedCard &&
                                            (bothHaveCartItem
                                              ? selectedCard.cart_item_id === card.cart_item_id
                                              : selectedCard?.card_id === card.card_id &&
                                                selectedCard?.branch_id === card.branch_id &&
                                                selectedCard?.recipient_id === card.recipient_id)

                                          return (
                                            <GuestGiftCardTile
                                              key={key}
                                              product={card.card_name}
                                              cardType={card.card_type}
                                              amount={Number(card.card_price || 0)}
                                              currency={card.currency || 'GHS'}
                                              expiryDate={card.expiry_date}
                                              vendorName={
                                                card.vendor_name ||
                                                vendorName ||
                                                selectedVendor?.vendor_name
                                              }
                                              images={
                                                card.image_url
                                                  ? [{ file_url: card.image_url }]
                                                  : undefined
                                              }
                                              selected={isSelected}
                                              onSelect={() => {
                                                setSelectedCard(card)
                                                setSelectedBranchId(card.branch_id || null)
                                              }}
                                            />
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Amount input for DashGo and DashPro */}
                                {(cardType === 'dashgo' || cardType === 'dashpro') && (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Amount <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      placeholder="Enter amount to redeem"
                                      value={amount}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleAmountChange(e.target.value)
                                      }
                                    />
                                  </div>
                                )}

                                {/* Balance display - Show balance for selected card type */}
                                {balanceLoading ? (
                                  <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                                    <Loader />
                                    <Text variant="span" className="text-gray-600 text-sm">
                                      Loading balance...
                                    </Text>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* DashGo Balance */}
                                    {cardType === 'dashgo' && dashGoBalance !== null && (
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          DashGo Balance
                                        </label>
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                          <Text
                                            variant="h4"
                                            weight="semibold"
                                            className="text-primary-600"
                                          >
                                            GHS {dashGoBalance.toFixed(2)}
                                          </Text>
                                        </div>
                                        {amount && parseFloat(amount) > dashGoBalance && (
                                          <p className="mt-2 text-sm text-red-600">
                                            Insufficient DashGo balance
                                          </p>
                                        )}
                                        {amount &&
                                          parseFloat(amount) <= dashGoBalance &&
                                          parseFloat(amount) > 0 && (
                                            <p className="mt-2 text-sm text-green-600">
                                              DashGo amount valid
                                            </p>
                                          )}
                                      </div>
                                    )}

                                    {/* DashPro Balance */}
                                    {cardType === 'dashpro' && balance !== null && (
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          DashPro Balance
                                        </label>
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                                          <Text
                                            variant="h4"
                                            weight="semibold"
                                            className="text-primary-600"
                                          >
                                            GHS {balance.toFixed(2)}
                                          </Text>
                                        </div>
                                        {amount && parseFloat(amount) > balance && (
                                          <p className="mt-2 text-sm text-red-600">
                                            Insufficient DashPro balance
                                          </p>
                                        )}
                                        {amount &&
                                          parseFloat(amount) <= balance &&
                                          parseFloat(amount) > 0 && (
                                            <p className="mt-2 text-sm text-green-600">
                                              DashPro amount valid
                                            </p>
                                          )}
                                      </div>
                                    )}

                                    {/* Show message if no balance available (only when balance is null, not when it's 0) - Only for DashGo and DashPro */}
                                    {((cardType === 'dashgo' && dashGoBalance === null) ||
                                      (cardType === 'dashpro' && balance === null)) &&
                                      (isAuthenticated ||
                                        getGuestPhoneFromAuth(jwtUser) ||
                                        phoneNumber) && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                          <Text variant="span" className="text-gray-600 text-sm">
                                            Unable to fetch balance for{' '}
                                            {cardType === 'dashgo' ? 'DashGo' : 'DashPro'}
                                          </Text>
                                        </div>
                                      )}

                                    {/* Show message if phone number not entered */}
                                    {!isAuthenticated &&
                                      !(getGuestPhoneFromAuth(jwtUser) || phoneNumber).trim() && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                          <Text variant="span" className="text-gray-600 text-sm">
                                            Verify your phone above to view balance
                                          </Text>
                                        </div>
                                      )}
                                  </div>
                                )}

                                <Button
                                  variant="secondary"
                                  onClick={handleRedeem}
                                  disabled={
                                    !selectedVendor ||
                                    !selectedVendorGvid ||
                                    !cardType ||
                                    vendorIdFlowRequiresBranch(
                                      availableBranches.length,
                                      selectedBranchId,
                                    ) ||
                                    ((cardType === 'dashgo' || cardType === 'dashpro') &&
                                      (!isValidRedemptionAmountInput(amount) ||
                                        (cardType === 'dashgo' &&
                                          dashGoBalance !== null &&
                                          parseFloat(amount) > dashGoBalance) ||
                                        (cardType === 'dashpro' &&
                                          balance !== null &&
                                          parseFloat(amount) > balance))) ||
                                    ((cardType === 'dashx' || cardType === 'dashpass') &&
                                      !selectedCard) ||
                                    (isGuestAuth &&
                                      selectedBranchId === null &&
                                      !selectedCard?.branch_id) ||
                                    (!isAuthenticated &&
                                      !(getGuestPhoneFromAuth(jwtUser) || phoneNumber).trim()) ||
                                    isProcessingRedemption
                                  }
                                  loading={isProcessingRedemption}
                                  className="w-full"
                                >
                                  {isProcessingRedemption ? 'Processing...' : 'Redeem'}
                                </Button>
                              </>
                            )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon icon="bi:check-circle-fill" className="text-5xl text-green-600" />
                  </div>
                  <Text variant="h2" weight="bold" className="text-gray-900">
                    Redemption Successful!
                  </Text>
                  <Text variant="p" className="text-gray-600">
                    {selectedCard
                      ? `${selectedCard.card_name} successfully redeemed`
                      : `GHS ${(redemptionSuccess?.amount ?? parseFloat(amount || '0')).toFixed(2)} successfully redeemed`}{' '}
                    at {vendorName}
                  </Text>
                  {(redemptionSuccess?.transaction_reference ||
                    redemptionSuccess?.redemption_code ||
                    redemptionSuccess?.amount != null) && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left space-y-2">
                      {redemptionSuccess.amount != null && (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Amount:</span> GHS{' '}
                          {Number(redemptionSuccess.amount).toFixed(2)}
                        </p>
                      )}
                      {redemptionSuccess.transaction_reference && (
                        <p className="text-sm text-gray-700 break-all">
                          <span className="font-semibold">Receipt #:</span>{' '}
                          {redemptionSuccess.transaction_reference}
                        </p>
                      )}
                      {redemptionSuccess.redemption_code && (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Redemption code:</span>{' '}
                          {redemptionSuccess.redemption_code}
                        </p>
                      )}
                    </div>
                  )}
                  {balance !== null &&
                    (cardType === 'dashpro' || cardType === 'dashgo') &&
                    redemptionSuccess?.amount == null && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Text variant="span" className="text-gray-600">
                          Remaining Balance: GHS{' '}
                          {(
                            (cardType === 'dashgo' ? (dashGoBalance ?? balance) : balance)! -
                            parseFloat(amount)
                          ).toFixed(2)}
                        </Text>
                      </div>
                    )}
                  <div className="flex flex-col gap-3">
                    {isGuestAuth && recentGuestRedemptions.length > 0 && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
                        <Text variant="span" weight="semibold" className="text-gray-800">
                          Recent redemptions
                        </Text>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {recentGuestRedemptions.map((entry, index) => (
                            <li key={entry.redemption_id ?? entry.transaction_reference ?? index}>
                              {entry.card_type || entry.product || 'Card'} — GHS{' '}
                              {Number(entry.amount ?? 0).toFixed(2)}
                              {entry.status ? ` · ${entry.status}` : ''}
                              {entry.redemption_date
                                ? ` · ${new Date(entry.redemption_date).toLocaleDateString()}`
                                : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {redeemedCardId && (
                      <Button
                        variant="secondary"
                        onClick={() => setStep('rating')}
                        className="w-full"
                      >
                        Rate Your Experience
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          isGuestAuth ? ROUTES.IN_APP.GUEST.CARDS : ROUTES.IN_APP.DASHBOARD.HOME,
                        )
                      }
                      className="w-full"
                    >
                      {isGuestAuth ? 'View my cards' : 'Go to Dashboard'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'rating' && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon icon="bi:star-fill" className="text-5xl text-primary-600" />
                  </div>
                  <Text variant="h2" weight="bold" className="text-gray-900">
                    Rate Your Experience
                  </Text>
                  <Text variant="p" className="text-gray-600">
                    How would you rate your redemption experience?
                  </Text>

                  {/* Star Rating */}
                  <div className="flex items-center justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        <Icon
                          icon={star <= rating ? 'bi:star-fill' : 'bi:star'}
                          className={`text-4xl ${
                            star <= rating ? 'text-yellow-500' : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>

                  {rating > 0 && (
                    <Text variant="span" className="text-sm text-gray-500">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </Text>
                  )}

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        if (!redeemedCardId || rating === 0) {
                          toast.error('Please select a rating')
                          return
                        }
                        setIsSubmittingRating(true)
                        try {
                          await rateCardMutation.mutateAsync({
                            card_id: redeemedCardId,
                            rating: rating,
                          })
                          setStep('success')
                          setRating(0)
                        } catch (error) {
                          console.error('Rating error:', error)
                        } finally {
                          setIsSubmittingRating(false)
                        }
                      }}
                      disabled={rating === 0 || isSubmittingRating}
                      loading={isSubmittingRating}
                      className="w-full"
                    >
                      Submit Rating
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep('success')
                        setRating(0)
                      }}
                      disabled={isSubmittingRating}
                      className="w-full"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showActionChoiceModal}
        setIsOpen={setShowActionChoiceModal}
        panelClass="max-w-xl"
      >
        <div className="rounded-[20px] bg-white p-7 sm:p-8">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-linear-to-br from-[#22C55E] to-[#16A34A] text-white shadow-[0_10px_30px_rgba(34,197,94,0.3)]">
            <Icon icon="bi:cursor-fill" className="size-7" />
          </div>

          <div className="text-center mb-6">
            <h3 className="text-[30px] leading-tight font-bold text-[#0F172A]">
              Choose Your Next Step
            </h3>
            <p className="mt-2 text-base text-[#475569]">
              Continue with redemption or switch to gift card purchase.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleChooseRedeem}
              className="w-full rounded-2xl border border-[#C7D2FE] bg-linear-to-br from-[#EEF2FF] to-[#F8FAFC] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#A5B4FC]"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#4338CA] text-white">
                  <Icon icon="bi:gift-fill" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#1E1B4B]">Redeem a card</p>
                  <p className="text-sm text-[#4C1D95]/80">
                    Use your existing card for redemption now.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleChoosePurchase}
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#F59E0B] text-white">
                  <Icon icon="bi:bag-check-fill" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#0F172A]">Make a purchase</p>
                  <p className="text-sm text-[#475569]">Browse gift cards and buy a new one.</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowActionChoiceModal(false)}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add CSS animations */}
      <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes pulse-ring {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }
            100% {
              transform: scale(1.4);
              opacity: 0;
            }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-delay-2 {
            animation: float 6s ease-in-out infinite;
            animation-delay: 2s;
          }
          .animate-float-delay-4 {
            animation: float 6s ease-in-out infinite;
            animation-delay: 4s;
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s ease-out infinite;
          }
        `}</style>
    </div>
  )
}
