import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Text,
  RadioGroup,
  RadioGroupItem,
  Combobox,
  Loader,
  OTPInput,
  ResendCode,
  BasePhoneInput,
} from '@/components'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState, useCountdown, useCountriesData } from '@/hooks'
import type { DropdownOption } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { axiosClient } from '@/libs'
import { useToast } from '@/hooks'

type RedemptionMethod = 'vendor_mobile_money' | 'vendor_id'
type CardType = 'dashpro' | 'dashgo' | 'dashx' | 'dashpass'

interface VendorCard {
  card_id: number
  card_name: string
  card_type: string
  card_price: number
  currency: string
  status: string
}

interface BalanceResponse {
  balance: number
  card_type: string
}

// Service function to fetch balance
const getCardBalance = async (
  phoneNumber?: string,
  userId?: string | number,
  cardType?: string,
  vendorId?: string | number,
): Promise<BalanceResponse | null> => {
  try {
    const params: Record<string, any> = {}
    if (phoneNumber) params.phone_number = phoneNumber
    if (userId) params.user_id = userId
    if (cardType) params.card_type = cardType
    if (vendorId) params.vendor_id = vendorId

    // TODO: Replace with actual API endpoint when available
    // For now, this is a placeholder that returns null
    // const response = await getList('/gift-cards/balance', params)
    // return response

    return null
  } catch (error) {
    console.error('Error fetching balance:', error)
    return null
  }
}

// Service function to send redemption OTP
const sendRedemptionOTP = async (data: {
  phone_number?: string
  user_id?: string | number
  redemption_method: string
  vendor_id?: string | number
  card_type?: string
  amount?: number
  card_id?: number
}): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post('/redemptions/send-otp', data)
  return response.data
}

// Service function to verify redemption OTP
const verifyRedemptionOTP = async (data: {
  otp: string
  phone_number?: string
  user_id?: string | number
  redemption_method: string
  vendor_id?: string | number
  card_type?: string
  amount?: number
  card_id?: number
}): Promise<{ status: string; message: string; data?: any }> => {
  const response = await axiosClient.post('/redemptions/verify-otp', data)
  return response.data
}

export default function RedemptionPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { countries: phoneCountries } = useCountriesData()

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
  const [dashProBalance, setDashProBalance] = useState<number | null>(null)
  const [dashGoBalance, setDashGoBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [selectedCard, setSelectedCard] = useState<VendorCard | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [step, setStep] = useState<'method' | 'details' | 'otp' | 'confirm' | 'success'>('method')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
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

  // Extract cards from selected vendor
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    const cards: VendorCard[] = []

    // Extract cards from branches_with_cards
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
            })
          })
        }
      })
    }

    // Extract cards from vendor_cards if available
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

  // Filter cards by selected card type
  const filteredCards = useMemo(() => {
    if (!cardType) return vendorCards
    return vendorCards.filter((card) => card.card_type === cardType)
  }, [vendorCards, cardType])

  // Fetch balance when phone number or vendor changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!selectedVendor) {
        setBalance(null)
        setDashProBalance(null)
        setDashGoBalance(null)
        return
      }

      // Only fetch balance if we have the required info
      if (redemptionMethod === 'vendor_mobile_money') {
        // For vendor mobile money, we need phone number if not authenticated
        if (!isAuthenticated && !phoneNumber) {
          setBalance(null)
          return
        }
        setBalanceLoading(true)
        setBalanceError(null)
        try {
          const balanceData = await getCardBalance(
            !isAuthenticated ? phoneNumber : undefined,
            isAuthenticated ? user?.user_id : undefined,
            'dashpro',
            selectedVendor.vendor_id,
          )
          if (balanceData) {
            setBalance(balanceData.balance)
            setBalanceError(null)
          } else {
            setBalance(null)
            setBalanceError('Unable to fetch balance. Please try again.')
          }
        } catch (error: any) {
          console.error('Error fetching balance:', error)
          setBalance(null)
          setBalanceError(error?.message || 'Failed to fetch balance. Please try again.')
        } finally {
          setBalanceLoading(false)
        }
      } else if (redemptionMethod === 'vendor_id') {
        // For vendor ID, we need phone number if not authenticated
        if (!isAuthenticated && !phoneNumber) {
          setBalance(null)
          setDashProBalance(null)
          setDashGoBalance(null)
          return
        }

        // Fetch both DashPro and DashGo balances when vendor is selected
        setBalanceLoading(true)
        setBalanceError(null)
        try {
          // Fetch DashPro balance
          const dashProData = await getCardBalance(
            !isAuthenticated ? phoneNumber : undefined,
            isAuthenticated ? user?.user_id : undefined,
            'dashpro',
            selectedVendor.vendor_id,
          )

          // Fetch DashGo balance
          const dashGoData = await getCardBalance(
            !isAuthenticated ? phoneNumber : undefined,
            isAuthenticated ? user?.user_id : undefined,
            'dashgo',
            selectedVendor.vendor_id,
          )

          if (dashProData) {
            setDashProBalance(dashProData.balance)
          } else {
            setDashProBalance(null)
          }

          if (dashGoData) {
            setDashGoBalance(dashGoData.balance)
          } else {
            setDashGoBalance(null)
          }

          // Set the balance based on selected card type
          if (cardType === 'dashpro' && dashProData) {
            setBalance(dashProData.balance)
          } else if (cardType === 'dashgo' && dashGoData) {
            setBalance(dashGoData.balance)
          } else {
            setBalance(null)
          }

          setBalanceError(null)
        } catch (error: any) {
          console.error('Error fetching balance:', error)
          setBalance(null)
          setDashProBalance(null)
          setDashGoBalance(null)
          setBalanceError(error?.message || 'Failed to fetch balance. Please try again.')
        } finally {
          setBalanceLoading(false)
        }
      }
    }

    fetchBalance()
  }, [phoneNumber, selectedVendor, cardType, isAuthenticated, user, redemptionMethod])

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
    setOtp('')
    setOtpError('')
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

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: sendRedemptionOTP,
    onSuccess: () => {
      toast.success('OTP sent successfully')
      setStep('otp')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to send OTP. Please try again.')
    },
  })

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: verifyRedemptionOTP,
    onSuccess: () => {
      toast.success('OTP verified successfully')
      setStep('confirm')
      setOtpError('')
    },
    onError: (error: { status: number; message: string }) => {
      setOtpError(error?.message || 'Invalid OTP. Please try again.')
      toast.error(error?.message || 'Invalid OTP. Please try again.')
    },
  })

  // Countdown for resending OTP
  const { resendOtp, formatCountdown, countdown, startCountdown } = useCountdown({
    sendOtp: async () => {
      await sendOTPMutation.mutateAsync({
        phone_number: !isAuthenticated ? phoneNumber : undefined,
        user_id: isAuthenticated ? user?.user_id : undefined,
        redemption_method: redemptionMethod,
        vendor_id: selectedVendor?.vendor_id,
        card_type: cardType || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        card_id: selectedCard?.card_id,
      })
    },
    countdown: 120,
  })

  // Start countdown when OTP step is reached
  useEffect(() => {
    if (step === 'otp') {
      startCountdown()
    }
  }, [step, startCountdown])

  // Handle redemption submission - send OTP
  const handleRedeem = async () => {
    if (
      redemptionMethod === 'vendor_id' &&
      !selectedCard &&
      cardType !== 'dashpro' &&
      cardType !== 'dashgo'
    ) {
      // For DashX and DashPass, a card must be selected
      return
    }

    // Send OTP
    sendOTPMutation.mutate({
      phone_number: !isAuthenticated ? phoneNumber : undefined,
      user_id: isAuthenticated ? user?.user_id : undefined,
      redemption_method: redemptionMethod,
      vendor_id: selectedVendor?.vendor_id,
      card_type: cardType || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      card_id: selectedCard?.card_id,
    })
  }

  // Handle OTP verification
  const handleVerifyOTP = useCallback(() => {
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    verifyOTPMutation.mutate({
      otp,
      phone_number: !isAuthenticated ? phoneNumber : undefined,
      user_id: isAuthenticated ? user?.user_id : undefined,
      redemption_method: redemptionMethod,
      vendor_id: selectedVendor?.vendor_id,
      card_type: cardType || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      card_id: selectedCard?.card_id,
    })
  }, [
    otp,
    isAuthenticated,
    phoneNumber,
    user?.user_id,
    redemptionMethod,
    selectedVendor?.vendor_id,
    cardType,
    amount,
    selectedCard?.card_id,
    verifyOTPMutation,
  ])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOTP()
    }
  }, [otp, step, handleVerifyOTP])

  // Handle confirmation
  const handleConfirm = async () => {
    // TODO: Call redemption API
    // On success, navigate to success page
    setStep('success')
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
    setBalance(null)
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
                <div className="flex items-center gap-3 px-4 py-3 bg-white/8 backdrop-blur-md border border-white/12 rounded-xl">
                  <Icon icon="bi:shield-fill-check" className="text-xl text-yellow-400" />
                  <span className="text-sm font-medium">256-bit SSL Encryption</span>
                </div>
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
                                {user?.fullname || user?.name || 'User'}
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
                                      ? user?.fullname || user?.name || 'User'
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
                          disabled={sendOTPMutation.isPending}
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
                            sendOTPMutation.isPending
                          }
                          loading={sendOTPMutation.isPending}
                          className="flex-1"
                        >
                          {sendOTPMutation.isPending ? (
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
                      <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-300 rounded-xl flex gap-3">
                        <Icon
                          icon="bi:shield-lock"
                          className="text-yellow-600 text-xl flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-yellow-900">
                          <strong>Secure Transaction:</strong> This redemption is protected by
                          256-bit SSL encryption and requires SMS verification to complete.
                        </div>
                      </div>
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
                              placeholder="Search for a vendor by name..."
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

                      {/* Card type selection - only show if vendor is selected */}
                      {selectedVendor && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Card Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
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
                                    No {cardType} cards available for this vendor
                                  </Text>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                                  {filteredCards.map((card) => (
                                    <button
                                      key={card.card_id}
                                      onClick={() => setSelectedCard(card)}
                                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                        selectedCard?.card_id === card.card_id
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <Text
                                            variant="span"
                                            weight="semibold"
                                            className="text-gray-900"
                                          >
                                            {card.card_name}
                                          </Text>
                                          <Text
                                            variant="span"
                                            className="text-gray-600 text-sm block mt-1"
                                          >
                                            {card.currency} {card.card_price.toFixed(2)}
                                          </Text>
                                        </div>
                                        {selectedCard?.card_id === card.card_id && (
                                          <Icon
                                            icon="bi:check-circle-fill"
                                            className="text-primary-600 text-xl"
                                          />
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Amount input for DashPro and DashGo */}
                          {(cardType === 'dashpro' || cardType === 'dashgo') && (
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

                          {/* Balance display - Show DashPro and DashGo balances */}
                          {balanceLoading ? (
                            <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                              <Loader />
                              <Text variant="span" className="text-gray-600 text-sm">
                                Loading balance...
                              </Text>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* DashPro Balance */}
                              {dashProBalance !== null && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    DashPro Balance
                                  </label>
                                  <div
                                    className={`p-4 rounded-lg ${
                                      cardType === 'dashpro'
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <Text
                                      variant="h4"
                                      weight="semibold"
                                      className="text-primary-600"
                                    >
                                      GHS {dashProBalance.toFixed(2)}
                                    </Text>
                                  </div>
                                  {cardType === 'dashpro' &&
                                    amount &&
                                    parseFloat(amount) > dashProBalance && (
                                      <p className="mt-2 text-sm text-red-600">
                                        Insufficient DashPro balance
                                      </p>
                                    )}
                                  {cardType === 'dashpro' &&
                                    amount &&
                                    parseFloat(amount) <= dashProBalance &&
                                    parseFloat(amount) > 0 && (
                                      <p className="mt-2 text-sm text-green-600">
                                        DashPro amount valid
                                      </p>
                                    )}
                                </div>
                              )}

                              {/* DashGo Balance */}
                              {dashGoBalance !== null && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    DashGo Balance
                                  </label>
                                  <div
                                    className={`p-4 rounded-lg ${
                                      cardType === 'dashgo'
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <Text
                                      variant="h4"
                                      weight="semibold"
                                      className="text-primary-600"
                                    >
                                      GHS {dashGoBalance.toFixed(2)}
                                    </Text>
                                  </div>
                                  {cardType === 'dashgo' &&
                                    amount &&
                                    parseFloat(amount) > dashGoBalance && (
                                      <p className="mt-2 text-sm text-red-600">
                                        Insufficient DashGo balance
                                      </p>
                                    )}
                                  {cardType === 'dashgo' &&
                                    amount &&
                                    parseFloat(amount) <= dashGoBalance &&
                                    parseFloat(amount) > 0 && (
                                      <p className="mt-2 text-sm text-green-600">
                                        DashGo amount valid
                                      </p>
                                    )}
                                </div>
                              )}

                              {/* Show message if no balances available */}
                              {dashProBalance === null &&
                                dashGoBalance === null &&
                                (isAuthenticated || phoneNumber) && (
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <Text variant="span" className="text-gray-600 text-sm">
                                      No balance available for DashPro or DashGo
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

                          {/* Branch selection if multiple branches */}
                          {selectedVendor.branches_with_cards &&
                            selectedVendor.branches_with_cards.length > 1 && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Select Branch <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                  {selectedVendor.branches_with_cards.map((branch: any) => (
                                    <button
                                      key={branch.branch_id}
                                      onClick={() => setSelectedBranchId(branch.branch_id)}
                                      className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                                        selectedBranchId === branch.branch_id
                                          ? 'border-primary-500 bg-primary-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <Text
                                        variant="span"
                                        weight="semibold"
                                        className="text-gray-900"
                                      >
                                        {branch.branch_name}
                                      </Text>
                                      {branch.branch_location && (
                                        <Text
                                          variant="span"
                                          className="text-gray-600 text-sm block mt-1"
                                        >
                                          {branch.branch_location}
                                        </Text>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          <Button
                            variant="primary"
                            onClick={handleRedeem}
                            disabled={Boolean(
                              !selectedVendor ||
                                !cardType ||
                                ((cardType === 'dashx' || cardType === 'dashpass') &&
                                  !selectedCard) ||
                                ((cardType === 'dashpro' || cardType === 'dashgo') &&
                                  (!amount || parseFloat(amount) <= 0)) ||
                                (!isAuthenticated && !phoneNumber) ||
                                (cardType === 'dashpro' &&
                                  dashProBalance !== null &&
                                  amount &&
                                  parseFloat(amount) > dashProBalance) ||
                                (cardType === 'dashgo' &&
                                  dashGoBalance !== null &&
                                  amount &&
                                  parseFloat(amount) > dashGoBalance),
                            )}
                            className="w-full"
                          >
                            Redeem
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setStep('details')
                      setOtp('')
                      setOtpError('')
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                  >
                    <Icon icon="bi:arrow-left" className="text-lg" />
                    <span>Back</span>
                  </button>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <Icon icon="bi:shield-check" className="text-3xl text-primary-600" />
                    </div>
                    <Text variant="h3" weight="semibold" className="text-gray-900">
                      Verify OTP
                    </Text>
                    <Text variant="p" className="text-gray-600">
                      We've sent a 6-digit OTP to{' '}
                      <span className="font-semibold text-gray-900">
                        {isAuthenticated
                          ? user?.email || user?.phonenumber || 'your registered contact'
                          : phoneNumber || 'your phone number'}
                      </span>
                      . Please enter it below to continue with your redemption.
                    </Text>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter OTP <span className="text-red-500">*</span>
                      </label>
                      <OTPInput
                        length={6}
                        value={otp}
                        onChange={(value) => {
                          setOtp(value)
                          setOtpError('')
                        }}
                        error={otpError}
                        inputListClassName="grid grid-cols-6 gap-2"
                      />
                    </div>

                    <ResendCode
                      countdown={countdown}
                      formatCountdown={formatCountdown}
                      onResend={resendOtp}
                      isLoading={sendOTPMutation.isPending}
                    />

                    <Button
                      variant="primary"
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || verifyOTPMutation.isPending}
                      loading={verifyOTPMutation.isPending}
                      className="w-full"
                    >
                      Verify OTP
                    </Button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Confirm Redemption
                  </Text>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between">
                      <Text variant="span" className="text-gray-600">
                        Redemption Method:
                      </Text>
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        {redemptionMethod === 'vendor_mobile_money'
                          ? 'Vendor Mobile Money'
                          : 'Vendor Redemption'}
                      </Text>
                    </div>
                    {redemptionMethod === 'vendor_id' && cardType && (
                      <div className="flex justify-between">
                        <Text variant="span" className="text-gray-600">
                          Card Type:
                        </Text>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {cardType.charAt(0).toUpperCase() + cardType.slice(1)}
                        </Text>
                      </div>
                    )}
                    {selectedCard && (
                      <div className="flex justify-between">
                        <Text variant="span" className="text-gray-600">
                          Selected Card:
                        </Text>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {selectedCard.card_name}
                        </Text>
                      </div>
                    )}
                    {(cardType === 'dashpro' ||
                      cardType === 'dashgo' ||
                      redemptionMethod === 'vendor_mobile_money') && (
                      <div className="flex justify-between">
                        <Text variant="span" className="text-gray-600">
                          Redemption Amount:
                        </Text>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          GHS {parseFloat(amount || '0').toFixed(2)}
                        </Text>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <Text variant="span" className="text-gray-600">
                        Vendor:
                      </Text>
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        {vendorName || 'N/A'}
                      </Text>
                    </div>
                    {balance !== null && (
                      <div className="flex justify-between">
                        <Text variant="span" className="text-gray-600">
                          Available Balance:
                        </Text>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          GHS {balance.toFixed(2)}
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} className="flex-1">
                      Confirm
                    </Button>
                  </div>
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
