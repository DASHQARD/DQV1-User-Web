import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { useUserProfile } from '@/hooks'
import type { DropdownOption } from '@/types'
import { useToast } from '@/hooks'
import {
  type CardsRedemptionPayload,
  convertToInternationalFormat,
} from '@/features/dashboard/services/redemptions'
import {
  useRedemptionMutation,
  useRedemptionQueries,
  useRateCard,
} from '@/features/dashboard/hooks'
import { ROUTES } from '@/utils/constants'
import { getCardBackground, getCardTypeName, getImageUrl } from '@/utils/cardDisplay'
import { getGuestPhoneFromAuth } from '@/features/website/utils/guestAuth'
import {
  filterGuestAssignedByType,
  formatBranchLabel,
  mapGuestAssignedCardToVendorCard,
  pickGuestRedemptionCardId,
  resolveRedemptionCardId,
} from '@/features/website/utils/guestRedemption'

type RedemptionMethod = 'vendor_id'
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

const formatExpiryDate = (dateValue?: string): string => {
  if (!dateValue) return 'No expiry date'
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) return 'No expiry date'
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
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

  useEffect(() => {
    if (searchParams.get('redeem') === 'true') {
      setShowActionChoiceModal(true)
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
  }, [queryClient])

  // Get redemption queries hooks
  const {
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashProService,
    useGetRedemptionsAmountDashXService,
    useGetRedemptionsAmountDashPassService,
    useGetGuestAssignedCardsService,
    useGetGuestRedemptionsService,
  } = useRedemptionQueries()
  const { useProcessRedemptionCardsService, useProcessGuestCardsRedemptionService } =
    useRedemptionMutation()
  const processRedemptionMutation = useProcessRedemptionCardsService()
  const processGuestCardsRedemptionMutation = useProcessGuestCardsRedemptionService()
  const rateCardMutation = useRateCard()

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
    (isAuthenticated && !isGuestAuth) ||
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
    redemptionMethod === 'vendor_id',
  )
  const { data: guestRedemptionsHistory } = useGetGuestRedemptionsService(
    isGuestAuth && step === 'success',
    { limit: 5 },
  )

  const recentGuestRedemptions = useMemo(() => {
    if (!guestRedemptionsHistory) return []
    const list = Array.isArray(guestRedemptionsHistory)
      ? guestRedemptionsHistory
      : (guestRedemptionsHistory as { data?: unknown[] })?.data
    return Array.isArray(list) ? list.slice(0, 5) : []
  }, [guestRedemptionsHistory])

  // Fetch vendors same as Vendors/DashQards: limit 100 when on vendor_id flow
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    redemptionMethod === 'vendor_id' ? { limit: 100 } : undefined,
    redemptionMethod === 'vendor_id' && isAuthenticated,
  )

  const guestAssignedCards = useMemo(() => {
    if (!isGuestAuth) return []
    const cards = guestAssignedCardsResponse?.cards ?? guestAssignedCardsResponse?.data?.cards
    return Array.isArray(cards) ? cards : []
  }, [isGuestAuth, guestAssignedCardsResponse])

  const publicVendorsWithCards = useMemo(() => {
    if (!vendorsResponse) return []
    const raw = Array.isArray(vendorsResponse)
      ? vendorsResponse
      : (vendorsResponse as any)?.data || []
    const list = Array.isArray(raw) ? raw : []
    return list.filter(
      (v: any) =>
        v.branches_with_cards?.length > 0 &&
        v.branches_with_cards.some((b: any) => b.cards && b.cards.length > 0),
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

  // Convert to dropdown options (Combobox filters by search internally)
  const vendorOptions: DropdownOption[] = useMemo(() => {
    return vendors.map((vendor: any) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  // Extract cards from selected vendor with branch information
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []

    if (isGuestAuth) {
      return guestAssignedCards
        .filter((card: any) => String(card.vendor_id ?? '') === String(selectedVendorId))
        .map((card: any) => ({
          card_id: resolveRedemptionCardId(card),
          card_name: card.product || 'Unknown Card',
          card_type: String(card.card_type || '').toLowerCase(),
          card_price: Number(card.price || card.amount || 0),
          currency:
            card.currency ||
            guestAssignedCardsResponse?.currency ||
            guestAssignedCardsResponse?.data?.currency ||
            'GHS',
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
    guestAssignedCardsResponse,
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
    return availableBranches.map((branch) => ({
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

  const guestAssignedCurrency =
    guestAssignedCardsResponse?.currency || guestAssignedCardsResponse?.data?.currency || 'GHS'

  // DashX / DashPass: guests use assigned-cards (no balance API per guest spec)
  const dashXCards = useMemo(() => {
    if (isGuestAuth) {
      return filterGuestAssignedByType(guestAssignedCards, 'dashx').map((card) =>
        mapGuestAssignedCardToVendorCard(card, 'dashx', guestAssignedCurrency),
      )
    }
    const cards = redemptionsAmountDashX?.data?.cards || redemptionsAmountDashX?.cards
    if (!cards || !Array.isArray(cards)) {
      return []
    }
    const currency =
      redemptionsAmountDashX?.data?.currency || redemptionsAmountDashX?.currency || 'GHS'
    return cards.map((card: any) => ({
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
  }, [isGuestAuth, guestAssignedCards, guestAssignedCurrency, redemptionsAmountDashX])

  const dashPassCards = useMemo(() => {
    if (isGuestAuth) {
      return filterGuestAssignedByType(guestAssignedCards, 'dashpass').map((card) =>
        mapGuestAssignedCardToVendorCard(card, 'dashpass', guestAssignedCurrency),
      )
    }
    const cards = redemptionsAmountDashPass?.data?.cards || redemptionsAmountDashPass?.cards
    if (!cards || !Array.isArray(cards)) {
      return []
    }
    const currency =
      redemptionsAmountDashPass?.data?.currency || redemptionsAmountDashPass?.currency || 'GHS'
    return cards.map((card: any) => ({
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
  }, [isGuestAuth, guestAssignedCards, guestAssignedCurrency, redemptionsAmountDashPass])

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
  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find((v: any) => v.vendor_id?.toString() === vendorId)
    if (vendor) {
      setSelectedVendor(vendor)
      setSelectedVendorId(vendorId)
      setVendorName(vendor.business_name || vendor.vendor_name || 'Unknown Vendor')
      setSelectedCard(null)
      setSelectedBranchId(null)
      setCardType('')
      setAmount('')
    }
  }

  const handleMethodSelect = (method: RedemptionMethod) => {
    setRedemptionMethod(method)
    setStep('details')
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setCardType('')
    setAmount('')
    setBalance(null)
    setSelectedCard(null)
  }

  // Handle amount validation
  const handleAmountChange = (value: string) => {
    setAmount(value)
  }

  // Handle redemption submission
  const handleRedeem = async () => {
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

      if (
        (cardType === 'dashx' || cardType === 'dashpass') &&
        availableBranches.length > 0 &&
        selectedBranchId === null
      ) {
        toast.error('Please select a branch')
        return
      }

      if (
        (cardType === 'dashgo' || cardType === 'dashpro') &&
        (!amount || parseFloat(amount) <= 0)
      ) {
        toast.error('Please enter a valid amount')
        return
      }

      if (cardType === 'dashgo' || cardType === 'dashpro') {
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

      // For DashX and DashPass, branch must be selected if branches are available
      if (
        (cardType === 'dashx' || cardType === 'dashpass') &&
        availableBranches.length > 0 &&
        selectedBranchId === null
      ) {
        toast.error('Please select a branch')
        return
      }

      // For DashGo and DashPro, amount is required
      if (
        (cardType === 'dashgo' || cardType === 'dashpro') &&
        (!amount || parseFloat(amount) <= 0)
      ) {
        toast.error('Please enter a valid amount')
        return
      }

      const userPhoneNumber = isAuthenticated
        ? isGuestAuth
          ? getGuestPhoneFromAuth(jwtUser)
          : (userProfile as any)?.phonenumber || (userProfile as any)?.phone || ''
        : phoneNumber
      const phoneForApi = isGuestAuth
        ? convertToInternationalFormat(getGuestPhoneFromAuth(jwtUser))
        : isAuthenticated
          ? userPhoneNumber
          : convertToInternationalFormat(userPhoneNumber)

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
        let payload: CardsRedemptionPayload

        if (cardType === 'dashgo' || cardType === 'dashpro') {
          const dashGoCards =
            redemptionsAmountDashGo?.data?.cards || redemptionsAmountDashGo?.cards || []
          const dashProCards =
            redemptionsAmountDashPro?.data?.cards || redemptionsAmountDashPro?.cards || []

          const activeCards = cardType === 'dashgo' ? dashGoCards : dashProCards
          if (activeCards.length === 0) {
            toast.error(`You have no ${cardTypeForAPI} balance to redeem`)
            setIsProcessingRedemption(false)
            return
          }

          const redeemAmount = parseFloat(amount)
          const activeCardsList = cardType === 'dashgo' ? dashGoCards : dashProCards
          const redemptionCardId = pickGuestRedemptionCardId(activeCardsList, redeemAmount)

          if (!redemptionCardId) {
            toast.error('Could not find a gift card to redeem. Please try again.')
            setIsProcessingRedemption(false)
            return
          }

          payload = {
            card_type: cardTypeForAPI,
            phone_number: phoneForApi,
            amount: redeemAmount,
            branch_id: String(selectedBranchId || selectedCard?.branch_id || ''),
            card_id: redemptionCardId,
          }
        } else if (cardType === 'dashpass') {
          const dashPassCards =
            redemptionsAmountDashPass?.data?.cards || redemptionsAmountDashPass?.cards || []
          let dashPassCardId: string | undefined
          let dashPassAmount = 0
          let dashPassBranchId = ''

          if (selectedCard) {
            dashPassCardId = selectedCard.card_id
            dashPassAmount = selectedCard.card_price || 0
            dashPassBranchId = String(selectedBranchId || selectedCard.branch_id || '')
          } else if (dashPassCards.length > 0) {
            dashPassAmount = dashPassCards[0]?.amount || 0
            dashPassCardId = pickGuestRedemptionCardId(dashPassCards, dashPassAmount)
            dashPassBranchId = String(selectedBranchId || dashPassCards[0]?.branch_id || '')
          }

          if (!dashPassCardId) {
            toast.error('Please select a card')
            setIsProcessingRedemption(false)
            return
          }

          payload = {
            card_type: cardTypeForAPI,
            phone_number: phoneForApi,
            amount: dashPassAmount,
            branch_id: dashPassBranchId,
            card_id: dashPassCardId,
          }
        } else {
          if (!selectedCard) {
            toast.error('Please select a card')
            setIsProcessingRedemption(false)
            return
          }
          payload = {
            card_type: cardTypeForAPI,
            phone_number: phoneForApi,
            amount: selectedCard.card_price || 0,
            branch_id: String(selectedBranchId || selectedCard.branch_id || ''),
            card_id: selectedCard.card_id,
          }
        }

        if (!payload.card_id?.trim()) {
          toast.error('Could not find a gift card to redeem. Please try again.')
          setIsProcessingRedemption(false)
          return
        }

        if (!isAuthenticated) {
          toast.error('Please verify your phone and email to continue as a guest.')
          setIsProcessingRedemption(false)
          return
        }

        if (isGuestAuth) {
          const guestRedemptionPayload: {
            card_type: typeof payload.card_type
            amount: number
            card_id: string
            branch_id?: string
          } = {
            card_type: payload.card_type,
            amount: payload.amount,
            card_id: String(payload.card_id),
          }
          const branchId = String(payload.branch_id || '').trim()
          if (branchId) {
            guestRedemptionPayload.branch_id = branchId
          }

          const response =
            await processGuestCardsRedemptionMutation.mutateAsync(guestRedemptionPayload)
          if (
            response?.status === 'success' ||
            response?.statusCode === 200 ||
            response?.statusCode === 201
          ) {
            if (payload.card_id) {
              setRedeemedCardId(payload.card_id)
            }
            setStep('success')
          }
          return
        }

        // Logged-in: /redemptions/users/cards
        const response = await processRedemptionMutation.mutateAsync(payload)
        if (
          response?.status === 'success' ||
          response?.statusCode === 200 ||
          response?.statusCode === 201
        ) {
          if (payload.card_id) {
            setRedeemedCardId(payload.card_id)
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

  const handleResetVendor = () => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setCardType('')
    setSelectedCard(null)
    setSelectedBranchId(null)
    setAmount('')
    setBalance(null)
    setDashGoBalance(null)
  }

  useEffect(() => {
    if (redemptionMethod !== 'vendor_id' || isAuthenticated) return
    if (!selectedVendorId) return
    handleResetVendor()
  }, [redemptionMethod, isAuthenticated, selectedVendorId])

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
                      <RadioGroupItem value="vendor_id" id="vendor_id" />
                      <label
                        htmlFor="vendor_id"
                        className="flex-1 cursor-pointer"
                        onClick={() => handleMethodSelect('vendor_id')}
                      >
                        <div className="font-semibold text-gray-900 mb-1">Vendor Name</div>
                        <div className="text-sm text-gray-600">
                          Redeem from DashGo, DashX, DashPass, and DashPro
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
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                  >
                    <Icon icon="bi:arrow-left" className="text-lg" />
                    <span>Back</span>
                  </button>

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
                              Use the same guest verification as checkout: your name, phone, and
                              email. We&apos;ll send a one-time code to your phone; after you
                              verify, you can search for your vendor and branch.
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                              Vendor Information
                            </Text>
                            <Text variant="span" className="text-sm text-gray-500">
                              Search and select the vendor for redemption
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
                            Verify phone &amp; email
                          </Button>
                        </div>
                      )}

                      {isAuthenticated && (
                        <>
                          {/* Vendor search and selection */}
                          <div className="form-group">
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
                              <>
                                <Combobox
                                  options={vendorOptions}
                                  value={selectedVendorId}
                                  onChange={(e: any) => {
                                    const vendorId = e.target.value
                                    if (vendorId) {
                                      handleVendorSelect(vendorId)
                                    }
                                  }}
                                  placeholder="Search for a vendor or ID by name..."
                                  isLoading={isLoadingVendors}
                                />
                                {vendors.length === 0 && !isLoadingVendors && (
                                  <p className="mt-2 text-sm text-gray-500">No vendors found</p>
                                )}
                              </>
                            ) : (
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
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
                                      {vendorCards.length > 0 && (
                                        <Text
                                          variant="span"
                                          className="text-gray-600 text-sm block"
                                        >
                                          {vendorCards.length} card
                                          {vendorCards.length !== 1 ? 's' : ''} available
                                        </Text>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon="bi:patch-check-fill"
                                      className="text-green-600 text-xl"
                                    />
                                    <button
                                      onClick={handleResetVendor}
                                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                      Change
                                    </button>
                                  </div>
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
                                    <button
                                      onClick={() => {
                                        setCardType('dashgo')
                                        setSelectedCard(null)
                                      }}
                                      className={`p-4 border-2 rounded-lg transition-colors ${
                                        cardType === 'dashgo'
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      DashGo
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCardType('dashpro')
                                        setSelectedCard(null)
                                      }}
                                      className={`p-4 border-2 rounded-lg transition-colors ${
                                        cardType === 'dashpro'
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      DashPro
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCardType('dashx')
                                        setSelectedCard(null)
                                      }}
                                      className={`p-4 border-2 rounded-lg transition-colors ${
                                        cardType === 'dashx'
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      DashX
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCardType('dashpass')
                                        setSelectedCard(null)
                                      }}
                                      className={`p-4 border-2 rounded-lg transition-colors ${
                                        cardType === 'dashpass'
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      DashPass
                                    </button>
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
                                      <div className="flex flex-col gap-3 max-h-136 overflow-y-auto pr-1">
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
                                            <button
                                              key={key}
                                              onClick={() => {
                                                setSelectedCard(card)
                                                setSelectedBranchId(card.branch_id || null)
                                              }}
                                              type="button"
                                              className={`flex w-full overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-all ${
                                                isSelected
                                                  ? 'border-primary-500 ring-2 ring-primary-100'
                                                  : 'border-gray-200 hover:border-gray-300'
                                              }`}
                                            >
                                              <div className="relative h-28 w-32 shrink-0 bg-gray-100 sm:h-32 sm:w-40">
                                                <img
                                                  src={
                                                    card.image_url ||
                                                    getCardBackground(card.card_type)
                                                  }
                                                  alt={card.card_name}
                                                  className="h-full w-full object-cover"
                                                  onError={(event) => {
                                                    const target = event.target as HTMLImageElement
                                                    target.src = getCardBackground(card.card_type)
                                                  }}
                                                />
                                                <div className="absolute left-2 top-2">
                                                  <div className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                                                    <Icon icon="bi:briefcase" className="text-xs" />
                                                    {getCardTypeName(card.card_type)}
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3 sm:p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                  <Text
                                                    variant="span"
                                                    weight="semibold"
                                                    className="line-clamp-2 text-base text-gray-900 sm:text-lg"
                                                  >
                                                    {card.card_name}
                                                  </Text>
                                                  {isSelected && (
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600">
                                                      <Icon
                                                        icon="bi:check"
                                                        className="text-white text-sm"
                                                      />
                                                    </div>
                                                  )}
                                                </div>


                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                                  <div className="flex items-center gap-1">
                                                    <Icon icon="bi:calendar3" className="text-sm" />
                                                    <Text variant="span" className="text-sm">
                                                      Expires {formatExpiryDate(card.expiry_date)}
                                                    </Text>
                                                  </div>
                                                  <div className="flex min-w-0 items-center gap-1">
                                                    <Icon icon="bi:shop" className="shrink-0 text-sm" />
                                                    <Text variant="span" className="truncate text-sm">
                                                      {card.vendor_name ||
                                                        vendorName ||
                                                        selectedVendor?.vendor_name ||
                                                        'Vendor'}
                                                    </Text>
                                                  </div>
                                                </div>

                                                <Text
                                                  variant="span"
                                                  weight="semibold"
                                                  className="text-lg text-primary-700 sm:text-xl"
                                                >
                                                  {card.currency}{' '}
                                                  {Number(card.card_price || 0).toLocaleString(
                                                    undefined,
                                                    {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    },
                                                  )}
                                                </Text>
                                              </div>
                                            </button>
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
                                            Verify phone &amp; email above to view balance
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
                                    !cardType ||
                                    // For DashGo and DashPro: require amount
                                    ((cardType === 'dashgo' || cardType === 'dashpro') &&
                                      (!amount || parseFloat(amount) <= 0)) ||
                                    // For DashX and DashPass: require selectedCard and branch if available
                                    ((cardType === 'dashx' || cardType === 'dashpass') &&
                                      (!selectedCard ||
                                        (availableBranches.length > 0 &&
                                          selectedBranchId === null))) ||
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
                      : `GHS ${parseFloat(amount || '0').toFixed(2)} successfully redeemed`}{' '}
                    at {vendorName}
                  </Text>
                  {balance !== null && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Text variant="span" className="text-gray-600">
                        Remaining Balance: GHS {(balance - parseFloat(amount)).toFixed(2)}
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
                          {recentGuestRedemptions.map((entry: any, index: number) => (
                            <li key={entry.id ?? entry.redemption_id ?? index}>
                              {entry.card_type || entry.product || 'Card'} — GHS{' '}
                              {Number(entry.amount ?? entry.redeemed_amount ?? 0).toFixed(2)}
                              {entry.created_at
                                ? ` · ${new Date(entry.created_at).toLocaleDateString()}`
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
                      onClick={() => navigate('/dashboard')}
                      className="w-full"
                    >
                      Go to Dashboard
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
