import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Text,
  RadioGroup,
  RadioGroupItem,
  Combobox,
  Loader,
  BasePhoneInput,
} from '@/components'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState, useCountriesData, userProfile } from '@/hooks'
import type { DropdownOption } from '@/types'
import { useToast } from '@/hooks'
import {
  getCardBalance,
  processCardsRedemption,
  type CardBalanceResponse,
  type CardsRedemptionPayload,
  type RedemptionResponse,
} from '@/features/dashboard/services/redemptions'

type RedemptionMethod = 'vendor_mobile_money' | 'vendor_id'
type CardType = 'dashpro' | 'dashgo' | 'dashx' | 'dashpass'

interface VendorCard {
  card_id: number
  card_name: string
  card_type: string
  card_price: number
  currency: string
  status: string
  branch_id?: number
  branch_name?: string
  branch_location?: string
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
  const { isAuthenticated } = useAuthStore()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = userProfile()
  const { data: user } = useGetUserProfileService()
  console.log('user', user)

  // State management
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod | ''>('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vendorMobileMoney, setVendorMobileMoney] = useState('')
  const [vendorMobileMoneyRaw, setVendorMobileMoneyRaw] = useState('')
  const [validatingVendor, setValidatingVendor] = useState(false)
  const [vendorValidatedName, setVendorValidatedName] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [cardType, setCardType] = useState<CardType | ''>('')
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [dashGoBalance, setDashGoBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [selectedCard, setSelectedCard] = useState<VendorCard | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [step, setStep] = useState<'method' | 'details' | 'success'>('method')
  const [isProcessingRedemption, setIsProcessingRedemption] = useState(false)
  const toast = useToast()

  // Debounced vendor search
  const { value: debouncedVendorSearch } = useDebouncedState({
    initialValue: vendorSearch,
    onChange: setVendorSearch,
    debounceTime: 500,
  })

  // Fetch vendors based on search
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    debouncedVendorSearch
      ? {
          search: debouncedVendorSearch,
          limit: 20,
        }
      : undefined,
  )

  // Extract vendors from response
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

  // Extract cards from selected vendor with branch information
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    const cards: VendorCard[] = []

    // Extract cards from branches_with_cards (includes branch info)
    if (selectedVendor.branches_with_cards && Array.isArray(selectedVendor.branches_with_cards)) {
      selectedVendor.branches_with_cards.forEach((branch: any) => {
        if (branch.cards && Array.isArray(branch.cards)) {
          branch.cards.forEach((card: any) => {
            cards.push({
              card_id: card.card_id,
              card_name: card.card_name || card.product || 'Unknown Card',
              card_type: card.card_type?.toLowerCase() || '',
              card_price: card.card_price || 0,
              currency: card.currency || 'GHS',
              status: card.status || 'active',
              branch_id: branch.branch_id,
              branch_name: branch.branch_name,
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
  }, [selectedVendor])

  // Extract unique branches from vendor
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

  // Filter cards by selected card type and branch
  const filteredCards = useMemo(() => {
    let cards = vendorCards
    if (cardType) {
      cards = cards.filter((card) => card.card_type === cardType)
    }
    if (selectedBranchId !== null) {
      cards = cards.filter((card) => card.branch_id === selectedBranchId)
    }
    return cards
  }, [vendorCards, cardType, selectedBranchId])

  // Fetch balance when phone number, selected card, or vendor changes
  useEffect(() => {
    const fetchBalance = async () => {
      // Get phone number - from user if authenticated, otherwise from phoneNumber state
      const userPhoneNumber = isAuthenticated
        ? (user as any)?.phonenumber || (user as any)?.phone || ''
        : phoneNumber

      if (!userPhoneNumber) {
        setBalance(null)
        setDashGoBalance(null)
        return
      }

      // Format phone number (remove +233 prefix if present, keep only digits)
      const formattedPhone = userPhoneNumber.replace(/^\+?233/, '').replace(/\D/g, '')

      if (!formattedPhone || formattedPhone.length < 10) {
        setBalance(null)
        setDashGoBalance(null)
        return
      }

      // Only fetch balance if we have the required info
      if (redemptionMethod === 'vendor_mobile_money') {
        // For vendor mobile money, fetch DashPro balance
        setBalanceLoading(true)
        setBalanceError(null)
        try {
          const response: CardBalanceResponse = await getCardBalance({
            phone_number: formattedPhone,
            card_type: 'DashPro',
          })

          if (response?.data?.balance !== undefined) {
            setBalance(response.data.balance)
            setBalanceError(null)
          } else {
            setBalance(null)
            setBalanceError(response?.message || 'Unable to fetch balance. Please try again.')
          }
        } catch (error: any) {
          console.error('Error fetching balance:', error)
          setBalance(null)
          setBalanceError(
            error?.response?.data?.message ||
              error?.message ||
              'Failed to fetch balance. Please try again.',
          )
        } finally {
          setBalanceLoading(false)
        }
      } else if (redemptionMethod === 'vendor_id') {
        // For vendor ID, fetch balance based on selected card
        if (selectedCard?.card_type) {
          setBalanceLoading(true)
          setBalanceError(null)
          try {
            const cardTypeForAPI = formatCardTypeForAPI(selectedCard.card_type)

            if (cardTypeForAPI) {
              const response: CardBalanceResponse = await getCardBalance({
                phone_number: formattedPhone,
                card_type: cardTypeForAPI,
              })

              if (response?.data?.balance !== undefined) {
                const balanceValue = response.data.balance

                // Update the appropriate balance state based on card type
                if (selectedCard.card_type.toLowerCase() === 'dashgo') {
                  setDashGoBalance(balanceValue)
                  setBalance(balanceValue)
                } else {
                  setBalance(balanceValue)
                }
                setBalanceError(null)
              } else {
                setBalance(null)
                if (selectedCard.card_type.toLowerCase() === 'dashgo') {
                  setDashGoBalance(null)
                }
                setBalanceError(response?.message || 'Unable to fetch balance. Please try again.')
              }
            } else {
              setBalance(null)
              setBalanceError('Invalid card type')
            }
          } catch (error: any) {
            console.error('Error fetching balance:', error)
            setBalance(null)
            if (selectedCard.card_type.toLowerCase() === 'dashgo') {
              setDashGoBalance(null)
            }
            setBalanceError(
              error?.response?.data?.message ||
                error?.message ||
                'Failed to fetch balance. Please try again.',
            )
          } finally {
            setBalanceLoading(false)
          }
        } else {
          // If no card selected, fetch DashGo balance
          setBalanceLoading(true)
          setBalanceError(null)
          try {
            // Fetch DashGo balance
            const dashGoResponse: CardBalanceResponse = await getCardBalance({
              phone_number: formattedPhone,
              card_type: 'DashGo',
            })

            if (dashGoResponse?.data?.balance !== undefined) {
              setDashGoBalance(dashGoResponse.data.balance)
            } else {
              setDashGoBalance(null)
            }

            // Set the balance based on selected card type
            if (cardType === 'dashgo' && dashGoResponse?.data?.balance !== undefined) {
              setBalance(dashGoResponse.data.balance)
            } else {
              setBalance(null)
            }

            setBalanceError(null)
          } catch (error: any) {
            console.error('Error fetching balance:', error)
            setBalance(null)
            setDashGoBalance(null)
            setBalanceError(
              error?.response?.data?.message ||
                error?.message ||
                'Failed to fetch balance. Please try again.',
            )
          } finally {
            setBalanceLoading(false)
          }
        }
      }
    }

    fetchBalance()
  }, [phoneNumber, selectedCard, selectedVendor, cardType, isAuthenticated, user, redemptionMethod])

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find((v: any) => v.vendor_id?.toString() === vendorId)
    if (vendor) {
      /**
       * ✅ Successful Vendor Retrieval Structure:
       *
       * Example response structure:
       * {
       *   vendor_id: 123,
       *   business_name: "ABC Restaurant",
       *   vendor_name: "ABC Restaurant",
       *   vendor_email: "contact@abcrestaurant.com",
       *   gvid: "GV-12345",
       *   country: "Ghana",
       *   status: "active",
       *   branches_with_cards: [
       *     {
       *       branch_id: 456,
       *       branch_name: "Main Branch",
       *       branch_location: "Accra, Ghana",
       *       branch_code: "BR-001",
       *       full_branch_id: "FB-456",
       *       cards: [
       *         {
       *           card_id: 789,
       *           card_name: "DashX Gift Card",
       *           card_type: "dashx",
       *           card_price: 100,
       *           currency: "GHS",
       *           status: "active"
       *         },
       *         {
       *           card_id: 790,
       *           card_name: "DashPass Subscription",
       *           card_type: "dashpass",
       *           card_price: 50,
       *           currency: "GHS",
       *           status: "active"
       *         }
       *       ]
       *     }
       *   ]
       * }
       */
      // Log successful vendor retrieval for debugging
      console.log('✅ Successful Vendor Retrieval:', {
        vendor_id: vendor.vendor_id,
        business_name: vendor.business_name,
        vendor_name: vendor.vendor_name,
        branches_count: vendor.branches_with_cards?.length || 0,
        total_cards:
          vendor.branches_with_cards?.reduce(
            (sum: number, branch: any) => sum + (branch.cards?.length || 0),
            0,
          ) || 0,
        branches_with_cards: vendor.branches_with_cards?.map((branch: any) => ({
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          branch_location: branch.branch_location,
          cards_count: branch.cards?.length || 0,
          cards: branch.cards?.map((card: any) => ({
            card_id: card.card_id,
            card_name: card.card_name,
            card_type: card.card_type,
            card_price: card.card_price,
            currency: card.currency,
          })),
        })),
        full_vendor_object: vendor,
      })

      setSelectedVendor(vendor)
      setSelectedVendorId(vendorId)
      setVendorName(vendor.business_name || vendor.vendor_name || 'Unknown Vendor')
      setSelectedCard(null)
      setSelectedBranchId(null)
      setCardType('')
      setAmount('')
    }
  }

  // Handle method selection
  const handleMethodSelect = (method: RedemptionMethod) => {
    setRedemptionMethod(method)
    setStep('details')
    // Reset state when changing methods
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setCardType('')
    setAmount('')
    setBalance(null)
    setSelectedCard(null)
    setVendorSearch('')
  }

  // Handle vendor mobile money validation
  const handleVendorMobileMoneyChange = async (value: string) => {
    setVendorMobileMoneyRaw(value)
    // Format: "+233-551681617" -> extract number
    const phoneNumber = value.replace(/[^0-9]/g, '')
    setVendorMobileMoney(phoneNumber)

    // Reset validation state
    setVendorValidatedName('')
    setVendorName('')

    // Validate vendor mobile money number if we have a complete number
    if (phoneNumber.length >= 9) {
      setValidatingVendor(true)
      try {
        // TODO: Replace with actual API endpoint
        // For now, simulate validation
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock validation - replace with actual API call
        // const response = await axiosClient.post('/vendors/validate-mobile-money', { phone_number: phoneNumber })
        // setVendorValidatedName(response.data.vendor_name)
        // setVendorName(response.data.vendor_name)

        // Mock response for demonstration
        if (phoneNumber.startsWith('233551681617') || phoneNumber.includes('551681617')) {
          setVendorValidatedName('Michael Martey')
          setVendorName('Michael Martey')
        }
      } catch (error: any) {
        console.error('Error validating vendor:', error)
        setVendorValidatedName('')
        setVendorName('')
      } finally {
        setValidatingVendor(false)
      }
    }
  }

  // Handle phone number entry (for guest users)
  const handlePhoneNumberChange = async (value: string) => {
    setPhoneNumber(value)
    // Balance will be fetched automatically via useEffect
  }

  // Handle amount validation
  const handleAmountChange = (value: string) => {
    setAmount(value)
  }

  // Handle redemption submission - process cards redemption directly
  const handleRedeem = async () => {
    if (redemptionMethod === 'vendor_id') {
      // For vendor_id method, DashGo, DashPro, DashX, and DashPass are allowed
      if (
        !selectedCard &&
        cardType !== 'dashgo' &&
        (cardType === 'dashpro' || cardType === 'dashx' || cardType === 'dashpass')
      ) {
        // For DashPro, DashX, and DashPass, a card must be selected
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

      // For DashPro, DashX, and DashPass, branch must be selected if branches are available
      if (
        (cardType === 'dashpro' || cardType === 'dashx' || cardType === 'dashpass') &&
        availableBranches.length > 0 &&
        selectedBranchId === null
      ) {
        toast.error('Please select a branch')
        return
      }

      // Get phone number
      const userPhoneNumber = isAuthenticated
        ? (user as any)?.phonenumber || (user as any)?.phone || ''
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
        const payload: CardsRedemptionPayload = {
          card_type: cardTypeForAPI,
          phone_number: userPhoneNumber.replace(/^\+?233/, '0'),
        }

        const response: RedemptionResponse = await processCardsRedemption(payload)

        if (
          response?.status === 'success' ||
          response?.statusCode === 200 ||
          response?.statusCode === 201
        ) {
          toast.success(response?.message || 'Redemption processed successfully')
          setStep('success')
        } else {
          toast.error(response?.message || 'Redemption failed. Please try again.')
        }
      } catch (error: any) {
        console.error('Redemption error:', error)
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Redemption failed. Please try again.',
        )
      } finally {
        setIsProcessingRedemption(false)
      }
    } else {
      // For vendor_mobile_money, handle DashPro redemption
      // TODO: Implement DashPro redemption flow if needed
      toast.error('DashPro redemption via vendor mobile money is not yet implemented')
    }
  }

  // Reset vendor selection
  const handleResetVendor = () => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setVendorName('')
    setVendorSearch('')
    setCardType('')
    setSelectedCard(null)
    setSelectedBranchId(null)
    setAmount('')
    setBalance(null)
    setDashGoBalance(null)
  }

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
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#5B47D4] to-[#402D87] rounded-full flex items-center justify-center shadow-2xl">
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
                        <div className="font-semibold text-gray-900 mb-1">Vendor Mobile Money</div>
                        <div className="text-sm text-gray-600">
                          Redeem from your DashPro balance only
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
                        <div className="font-semibold text-gray-900 mb-1">Vendor Redemption</div>
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

                  {redemptionMethod === 'vendor_mobile_money' && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="mb-6">
                        <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                          Vendor Information
                        </Text>
                        <Text variant="span" className="text-sm text-gray-500">
                          Details of the vendor providing the service
                        </Text>
                      </div>

                      {/* Vendor Mobile Money Input */}
                      <div className="form-group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Icon icon="bi:shop" className="text-primary-600" />
                            Vendor Mobile Money
                          </label>
                          {validatingVendor ? (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <Icon icon="bi:spinner" className="animate-spin" />
                              Verifying vendor...
                            </span>
                          ) : vendorValidatedName ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Icon icon="bi:check-circle-fill" />
                              Verified
                            </span>
                          ) : null}
                        </div>

                        <div
                          className={`relative transition-all ${
                            vendorValidatedName
                              ? 'border-2 border-green-500 rounded-xl'
                              : validatingVendor
                                ? 'border-2 border-blue-500 rounded-xl'
                                : 'border-2 border-gray-200 rounded-xl'
                          }`}
                        >
                          <BasePhoneInput
                            placeholder="Enter vendor phone number"
                            options={phoneCountries}
                            maxLength={9}
                            handleChange={handleVendorMobileMoneyChange}
                            selectedVal={vendorMobileMoneyRaw}
                            disabled={validatingVendor}
                          />
                        </div>

                        {/* Vendor Validation Card */}
                        {vendorValidatedName && (
                          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                  <Icon icon="bi:shop-window" className="text-white text-lg" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {vendorValidatedName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Wallet number validated successfully
                                  </div>
                                </div>
                              </div>
                              <Icon icon="bi:patch-check-fill" className="text-green-600 text-xl" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Redemption Amount */}
                      <div className="form-group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Icon icon="bi:cash-coin" className="text-primary-600" />
                            Redemption Amount
                          </label>
                          {amount && parseFloat(amount) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Icon icon="bi:check-circle-fill" />
                              Valid Amount
                            </span>
                          )}
                        </div>

                        <div
                          className={`relative transition-all ${
                            amount && parseFloat(amount) > 0
                              ? 'border-2 border-green-500 rounded-xl'
                              : 'border-2 border-gray-200 rounded-xl'
                          }`}
                        >
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleAmountChange(e.target.value)
                            }
                            className="pr-16"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary-600">
                            GHS
                          </div>
                        </div>

                        {amount && parseFloat(amount) <= 0 && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <Icon icon="bi:exclamation-triangle" />
                            Please enter a valid amount greater than 0
                          </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                          <Icon icon="bi:info-circle" />
                          Enter the amount you want to redeem in Ghana Cedis (GHS)
                        </p>
                      </div>

                      {/* User Account Details Section */}
                      <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-sm font-medium text-gray-500 bg-white">
                          Your Account Details
                        </span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>

                      {isAuthenticated ? (
                        /* Logged-in User Card */
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                              <Icon icon="bi:person-circle" className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {user?.fullname || 'User'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {user?.phonenumber || 'Phone not available'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {user?.email || 'Email not available'}
                              </div>
                            </div>
                            <Icon icon="bi:check-circle-fill" className="text-green-600 text-xl" />
                          </div>
                          <div className="mt-3 pt-3 border-t border-purple-200 flex items-center gap-2 text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-2">
                            <Icon icon="bi:shield-check" />
                            <span>Logged in - Details auto-filled</span>
                          </div>
                        </div>
                      ) : (
                        /* Non-logged-in User Input Fields */
                        <div className="space-y-4">
                          <div className="form-group">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Icon icon="bi:phone" className="text-primary-600" />
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative border-2 border-gray-200 rounded-xl">
                              <BasePhoneInput
                                placeholder="Enter the phone number you received the gift card on"
                                options={phoneCountries}
                                maxLength={9}
                                handleChange={(value: string) => {
                                  setPhoneNumber(value.replace(/[^0-9]/g, ''))
                                }}
                                selectedVal={phoneNumber ? `+233-${phoneNumber}` : ''}
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                              <Icon icon="bi:info-circle" />
                              Enter the phone number associated with your gift card
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Balance Information Section */}
                      {(balanceLoading || balance !== null || balanceError) && (
                        <div className="mt-6">
                          <div className="mb-4">
                            <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                              Balance Information
                            </Text>
                            <Text variant="span" className="text-sm text-gray-500">
                              Your account balance verification
                            </Text>
                          </div>

                          {balanceLoading ? (
                            <div className="p-6 bg-gray-50 rounded-xl flex items-center gap-3">
                              <Loader />
                              <Text variant="span" className="text-gray-600">
                                Verifying balance...
                              </Text>
                            </div>
                          ) : balanceError ? (
                            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                  <Icon
                                    icon="bi:exclamation-triangle-fill"
                                    className="text-white"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    Balance Check Failed
                                  </h4>
                                  <p className="text-sm text-gray-600">{balanceError}</p>
                                </div>
                              </div>
                            </div>
                          ) : balance !== null ? (
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                  <Icon
                                    icon="bi:check-circle-fill"
                                    className="text-white text-xl"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Balance Verified</h4>
                                  <p className="text-sm text-gray-600">
                                    Account:{' '}
                                    {isAuthenticated
                                      ? user?.fullname || 'User'
                                      : phoneNumber || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-green-200 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Available Balance:</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {balance.toFixed(2)} GHS
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Amount to Send:</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {parseFloat(amount || '0').toFixed(2)} GHS
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                                  <span className="text-sm font-semibold text-gray-900">
                                    Status:
                                  </span>
                                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                    <Icon icon="bi:check-circle-fill" />
                                    Sufficient Balance
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-8">
                        <Button
                          variant="outline"
                          onClick={handleResetVendor}
                          className="flex-1"
                          disabled={isProcessingRedemption}
                        >
                          <Icon icon="bi:arrow-clockwise" className="mr-2" />
                          Reset Form
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleRedeem}
                          disabled={
                            !vendorValidatedName ||
                            !vendorMobileMoney ||
                            (!isAuthenticated && !phoneNumber) ||
                            !amount ||
                            (balance !== null && parseFloat(amount) > balance) ||
                            isProcessingRedemption
                          }
                          loading={isProcessingRedemption}
                          className="flex-1"
                        >
                          {isProcessingRedemption ? (
                            <span className="flex items-center gap-2">
                              <Loader />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Icon icon="bi:arrow-right-circle" />
                              Continue to Redemption
                            </span>
                          )}
                        </Button>
                      </div>

                      {/* Security Notice */}
                      {/* <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300 rounded-xl flex gap-3">
                        <Icon
                          icon="bi:shield-lock"
                          className="text-yellow-600 text-xl flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-yellow-900">
                          <strong>Secure Transaction:</strong> This redemption is protected by
                          256-bit SSL encryption and requires SMS verification to complete.
                        </div>
                      </div> */}
                    </div>
                  )}

                  {redemptionMethod === 'vendor_id' && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="mb-6">
                        <Text variant="h3" weight="semibold" className="text-gray-900 mb-1">
                          Vendor Information
                        </Text>
                        <Text variant="span" className="text-sm text-gray-500">
                          Search and select the vendor for redemption
                        </Text>
                      </div>

                      {!isAuthenticated && (
                        <div className="form-group">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Icon icon="bi:phone" className="text-primary-600" />
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative border-2 border-gray-200 rounded-xl">
                            <Input
                              type="tel"
                              placeholder="Enter the phone number you received the gift card on"
                              value={phoneNumber}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handlePhoneNumberChange(e.target.value)
                              }
                              className="pr-10"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Icon icon="bi:telephone" />
                            </div>
                          </div>
                        </div>
                      )}

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
                            {vendorSearch && vendors.length === 0 && !isLoadingVendors && (
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
                                  <Text variant="span" weight="semibold" className="text-gray-900">
                                    {vendorName}
                                  </Text>
                                  {vendorCards.length > 0 && (
                                    <Text variant="span" className="text-gray-600 text-sm block">
                                      {vendorCards.length} card{vendorCards.length !== 1 ? 's' : ''}{' '}
                                      available
                                    </Text>
                                  )}
                                  {selectedVendor?.branches_with_cards && (
                                    <Text
                                      variant="span"
                                      className="text-gray-500 text-xs block mt-1"
                                    >
                                      {selectedVendor.branches_with_cards.length} branch
                                      {selectedVendor.branches_with_cards.length !== 1 ? 'es' : ''}
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
                            {/* Show vendor details on successful retrieval */}
                            {selectedVendor && (
                              <div className="mt-3 pt-3 border-t border-green-200 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                  <span>Vendor ID:</span>
                                  <span className="font-semibold text-gray-900">
                                    {selectedVendor.vendor_id || 'N/A'}
                                  </span>
                                </div>
                                {selectedVendor.branches_with_cards && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Branches:</span>
                                    <span className="font-semibold text-gray-900">
                                      {selectedVendor.branches_with_cards.length}
                                    </span>
                                  </div>
                                )}
                                {selectedVendor.country && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Country:</span>
                                    <span className="font-semibold text-gray-900">
                                      {selectedVendor.country}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Branch Selection - Show right after vendor selection */}
                      {selectedVendor && availableBranches.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Branch <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                            {availableBranches.map((branch) => {
                              const isSelected = selectedBranchId === branch.branch_id
                              return (
                                <button
                                  key={branch.branch_id}
                                  onClick={() => {
                                    setSelectedBranchId(branch.branch_id)
                                    setSelectedCard(null) // Reset card selection when branch changes
                                    setCardType('') // Reset card type when branch changes
                                  }}
                                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                    isSelected
                                      ? 'border-primary-500 bg-primary-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Icon icon="bi:shop" className="text-primary-600 text-lg" />
                                        <Text
                                          variant="span"
                                          weight="semibold"
                                          className="text-gray-900"
                                        >
                                          {branch.branch_name || `Branch #${branch.branch_id}`}
                                        </Text>
                                      </div>
                                      {branch.branch_location && (
                                        <Text
                                          variant="span"
                                          className="text-gray-600 text-sm block mt-1"
                                        >
                                          {branch.branch_location}
                                        </Text>
                                      )}
                                      <Text
                                        variant="span"
                                        className="text-gray-500 text-xs block mt-1"
                                      >
                                        {
                                          vendorCards.filter(
                                            (card) => card.branch_id === branch.branch_id,
                                          ).length
                                        }{' '}
                                        card
                                        {vendorCards.filter(
                                          (card) => card.branch_id === branch.branch_id,
                                        ).length !== 1
                                          ? 's'
                                          : ''}{' '}
                                        available
                                      </Text>
                                    </div>
                                    {isSelected && (
                                      <div className="shrink-0 ml-3">
                                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                          <Icon icon="bi:check" className="text-white text-sm" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
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

                            {/* Show cards for selected card type (DashX, DashPro, and DashPass) */}
                            {cardType &&
                              (cardType === 'dashx' ||
                                cardType === 'dashpro' ||
                                cardType === 'dashpass') && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Card <span className="text-red-500">*</span>
                                  </label>
                                  {filteredCards.length === 0 ? (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <Text variant="span" className="text-yellow-800 text-sm">
                                        No {cardType} cards available for this vendor
                                      </Text>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                                      {filteredCards.map((card) => {
                                        const isSelected =
                                          selectedCard?.card_id === card.card_id &&
                                          selectedBranchId === card.branch_id
                                        return (
                                          <button
                                            key={`${card.card_id}-${card.branch_id || 'no-branch'}`}
                                            onClick={() => {
                                              setSelectedCard(card)
                                              setSelectedBranchId(card.branch_id || null)
                                            }}
                                            className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                              isSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <Text
                                                  variant="span"
                                                  weight="semibold"
                                                  className="text-gray-900 block"
                                                >
                                                  {card.card_name}
                                                </Text>
                                                <Text
                                                  variant="span"
                                                  className="text-gray-600 text-sm block mt-1"
                                                >
                                                  {card.currency} {card.card_price.toFixed(2)}
                                                </Text>
                                                {card.branch_name && (
                                                  <div className="mt-2 flex items-start gap-2">
                                                    <Icon
                                                      icon="bi:shop"
                                                      className="text-primary-600 text-sm mt-0.5"
                                                    />
                                                    <div>
                                                      <Text
                                                        variant="span"
                                                        className="text-gray-700 text-sm font-medium block"
                                                      >
                                                        {card.branch_name}
                                                      </Text>
                                                      {card.branch_location && (
                                                        <Text
                                                          variant="span"
                                                          className="text-gray-500 text-xs block mt-0.5"
                                                        >
                                                          {card.branch_location}
                                                        </Text>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              {isSelected && (
                                                <div className="flex-shrink-0 ml-3">
                                                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                    <Icon
                                                      icon="bi:check"
                                                      className="text-white text-sm"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Amount input for DashGo */}
                            {cardType === 'dashgo' && (
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
                                  </div>
                                )}

                                {/* DashX/DashPass Balance */}
                                {(cardType === 'dashx' || cardType === 'dashpass') &&
                                  balance !== null && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {cardType === 'dashx' ? 'DashX' : 'DashPass'} Balance
                                      </label>
                                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                        <Text
                                          variant="h4"
                                          weight="semibold"
                                          className="text-primary-600"
                                        >
                                          GHS {balance.toFixed(2)}
                                        </Text>
                                      </div>
                                    </div>
                                  )}

                                {/* Show message if no balance available */}
                                {((cardType === 'dashgo' && dashGoBalance === null) ||
                                  ((cardType === 'dashpro' ||
                                    cardType === 'dashx' ||
                                    cardType === 'dashpass') &&
                                    balance === null)) &&
                                  (isAuthenticated || phoneNumber) && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                      <Text variant="span" className="text-gray-600 text-sm">
                                        No balance available for{' '}
                                        {cardType === 'dashgo'
                                          ? 'DashGo'
                                          : cardType === 'dashpro'
                                            ? 'DashPro'
                                            : cardType === 'dashx'
                                              ? 'DashX'
                                              : 'DashPass'}
                                      </Text>
                                    </div>
                                  )}

                                {/* Show message if phone number not entered */}
                                {!isAuthenticated && !phoneNumber && (
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <Text variant="span" className="text-gray-600 text-sm">
                                      Enter phone number to view balance
                                    </Text>
                                  </div>
                                )}
                              </div>
                            )}

                            <Button
                              variant="primary"
                              onClick={handleRedeem}
                              disabled={
                                !selectedVendor ||
                                !cardType ||
                                ((cardType === 'dashpro' ||
                                  cardType === 'dashx' ||
                                  cardType === 'dashpass') &&
                                  (!selectedCard ||
                                    (availableBranches.length > 0 && selectedBranchId === null))) ||
                                (!isAuthenticated && !phoneNumber) ||
                                isProcessingRedemption
                              }
                              loading={isProcessingRedemption}
                              className="w-full"
                            >
                              {isProcessingRedemption ? 'Processing...' : 'Redeem'}
                            </Button>
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
                    {redemptionMethod === 'vendor_mobile_money' ? (
                      <>
                        GHS {parseFloat(amount || '0').toFixed(2)} successfully redeemed via vendor
                        mobile money
                      </>
                    ) : (
                      <>
                        {selectedCard
                          ? `${selectedCard.card_name} successfully redeemed`
                          : `GHS ${parseFloat(amount || '0').toFixed(2)} successfully redeemed`}{' '}
                        at {vendorName}
                      </>
                    )}
                  </Text>
                  {balance !== null && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Text variant="span" className="text-gray-600">
                        Remaining Balance: GHS {(balance - parseFloat(amount)).toFixed(2)}
                      </Text>
                    </div>
                  )}
                  <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
