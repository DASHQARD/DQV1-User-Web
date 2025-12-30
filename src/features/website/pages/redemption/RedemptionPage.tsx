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
} from '@/components'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import { useDebouncedState, useCountdown } from '@/hooks'
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

  // State management
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod | ''>('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vendorMobileMoney, setVendorMobileMoney] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [cardType, setCardType] = useState<CardType | ''>('')
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
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
        return
      }

      // Only fetch balance if we have the required info
      if (redemptionMethod === 'vendor_mobile_money') {
        // For vendor mobile money, we need phone number if not authenticated
        if (!isAuthenticated && !phoneNumber) {
          setBalance(null)
          return
        }
      } else if (redemptionMethod === 'vendor_id') {
        // For vendor ID, we need phone number if not authenticated and card type
        if (!isAuthenticated && !phoneNumber) {
          setBalance(null)
          return
        }
        if (!cardType) {
          setBalance(null)
          return
        }
      }

      setBalanceLoading(true)
      try {
        const balanceData = await getCardBalance(
          !isAuthenticated ? phoneNumber : undefined,
          isAuthenticated ? user?.user_id : undefined,
          cardType || 'dashpro',
          selectedVendor.vendor_id,
        )
        setBalance(balanceData?.balance || null)
      } catch (error) {
        console.error('Error fetching balance:', error)
        setBalance(null)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [phoneNumber, selectedVendor, cardType, isAuthenticated, user, redemptionMethod])

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find((v: any) => v.vendor_id?.toString() === vendorId)
    if (vendor) {
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
    setVendorMobileMoney(value)
    // TODO: Validate vendor mobile money number and get vendor name
    // This would call an API endpoint to validate the number
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
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Text variant="h1" weight="bold" className="text-gray-900 mb-2">
            Redeem Gift Card
          </Text>
          <Text variant="p" className="text-gray-600">
            Choose your redemption method and follow the steps
          </Text>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {step === 'method' && (
            <div className="space-y-6">
              <Text variant="h3" weight="semibold" className="text-gray-900 mb-6">
                Select Redemption Method
              </Text>

              <RadioGroup
                value={redemptionMethod}
                onValueChange={(value) => handleMethodSelect(value as RedemptionMethod)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg border-gray-200 hover:border-primary-500 cursor-pointer transition-colors">
                  <RadioGroupItem value="vendor_mobile_money" id="vendor_mobile_money" />
                  <label
                    htmlFor="vendor_mobile_money"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleMethodSelect('vendor_mobile_money')}
                  >
                    <div className="font-semibold text-gray-900">Vendor Mobile Money</div>
                    <div className="text-sm text-gray-600">
                      Redeem from your DashPro balance only
                    </div>
                  </label>
                </div>
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg border-gray-200 hover:border-primary-500 cursor-pointer transition-colors">
                  <RadioGroupItem value="vendor_id" id="vendor_id" />
                  <label
                    htmlFor="vendor_id"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleMethodSelect('vendor_id')}
                  >
                    <div className="font-semibold text-gray-900">Vendor ID</div>
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icon icon="bi:arrow-left" className="text-lg" />
                <span>Back</span>
              </button>

              {redemptionMethod === 'vendor_mobile_money' && (
                <div className="space-y-6">
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Vendor Mobile Money Redemption
                  </Text>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter the phone number you received the gift card on"
                        value={phoneNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vendor Mobile Money Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter vendor mobile money number"
                      value={vendorMobileMoney}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleVendorMobileMoneyChange(e.target.value)
                      }
                    />
                    {vendorName && (
                      <p className="mt-2 text-sm text-green-600">Vendor: {vendorName}</p>
                    )}
                  </div>

                  {balanceLoading ? (
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                      <Loader />
                      <Text variant="span" className="text-gray-600 text-sm">
                        Loading balance...
                      </Text>
                    </div>
                  ) : balance !== null ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        DashPro Balance
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Text variant="h4" weight="semibold" className="text-primary-600">
                          GHS {balance.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                  ) : (!isAuthenticated && !phoneNumber) ||
                    (isAuthenticated && vendorMobileMoney) ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Text variant="span" className="text-gray-600 text-sm">
                        {!isAuthenticated && !phoneNumber
                          ? 'Enter phone number to view balance'
                          : 'Enter vendor mobile money number to view balance'}
                      </Text>
                    </div>
                  ) : null}

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
                    {balance && parseFloat(amount) > balance && (
                      <p className="mt-2 text-sm text-red-600">Insufficient balance</p>
                    )}
                    {balance && parseFloat(amount) <= balance && parseFloat(amount) > 0 && (
                      <p className="mt-2 text-sm text-green-600">Amount valid</p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleRedeem}
                    disabled={
                      !vendorMobileMoney ||
                      (!isAuthenticated && !phoneNumber) ||
                      !amount ||
                      (balance !== null && parseFloat(amount) > balance)
                    }
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </div>
              )}

              {redemptionMethod === 'vendor_id' && (
                <div className="space-y-6">
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Vendor Redemption
                  </Text>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter the phone number you received the gift card on"
                        value={phoneNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Vendor search and selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Search Vendor by Name <span className="text-red-500">*</span>
                    </label>
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
                      <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                          <Text variant="span" weight="semibold" className="text-gray-900">
                            {vendorName}
                          </Text>
                          {vendorCards.length > 0 && (
                            <Text variant="span" className="text-gray-600 text-sm ml-2">
                              ({vendorCards.length} card{vendorCards.length !== 1 ? 's' : ''}{' '}
                              available)
                            </Text>
                          )}
                        </div>
                        <button
                          onClick={handleResetVendor}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Change
                        </button>
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

                      {/* Balance display */}
                      {balanceLoading ? (
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Loader />
                          <Text variant="span" className="text-gray-600 text-sm">
                            Loading balance...
                          </Text>
                        </div>
                      ) : balance !== null ? (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Available Balance
                          </label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <Text variant="h4" weight="semibold" className="text-primary-600">
                              GHS {balance.toFixed(2)}
                            </Text>
                          </div>
                          {amount && parseFloat(amount) > balance && (
                            <p className="mt-2 text-sm text-red-600">Insufficient balance</p>
                          )}
                          {amount && parseFloat(amount) <= balance && parseFloat(amount) > 0 && (
                            <p className="mt-2 text-sm text-green-600">Amount valid</p>
                          )}
                        </div>
                      ) : (
                        cardType && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <Text variant="span" className="text-gray-600 text-sm">
                              {!isAuthenticated && !phoneNumber
                                ? 'Enter phone number to view balance'
                                : 'No balance available for this card type'}
                            </Text>
                          </div>
                        )
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
                                  <Text variant="span" weight="semibold" className="text-gray-900">
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
                            ((cardType === 'dashx' || cardType === 'dashpass') && !selectedCard) ||
                            ((cardType === 'dashpro' || cardType === 'dashgo') &&
                              (!amount || parseFloat(amount) <= 0)) ||
                            (!isAuthenticated && !phoneNumber) ||
                            (balance !== null && amount && parseFloat(amount) > balance),
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
  )
}
