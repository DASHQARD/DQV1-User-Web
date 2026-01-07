import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Text, Loader, Modal } from '@/components'
import { Icon } from '@/libs'
import { useRecipientCards } from '@/features/website/hooks/useRecipientCards'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { userProfile } from '@/hooks'
import RedemptionOTPModal from '@/features/dashboard/components/RedemptionOTPModal'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashx_bg.svg'
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

// Example cards for demonstration
const EXAMPLE_CARDS: Record<CardType, any[]> = {
  dashx: [
    {
      id: 1,
      card_id: 1,
      card_name: 'Restaurant Gift Card',
      card_type: 'dashx',
      balance: 150,
      amount: 200,
      status: 'active',
      expiry_date: '2025-12-31',
      branch_name: 'Accra Main Branch',
      vendor_name: 'ABC Restaurant',
    },
    {
      id: 2,
      card_id: 2,
      card_name: 'Shopping Mall Gift Card',
      card_type: 'dashx',
      balance: 75.5,
      amount: 100,
      status: 'active',
      expiry_date: '2025-06-30',
      branch_name: 'Kumasi Branch',
      vendor_name: 'XYZ Mall',
    },
  ],
  dashgo: [
    {
      id: 3,
      card_id: 3,
      card_name: 'Flexible Spending Card',
      card_type: 'dashgo',
      balance: 500,
      amount: 500,
      status: 'active',
      branch_name: 'Main Branch',
      vendor_name: 'Multi-Vendor Store',
    },
  ],
  dashpro: [
    {
      id: 4,
      card_id: 4,
      card_name: 'Prepaid Card',
      card_type: 'dashpro',
      balance: 1000,
      amount: 1000,
      status: 'active',
    },
  ],
  dashpass: [
    {
      id: 5,
      card_id: 5,
      card_name: 'Monthly Subscription Pass',
      card_type: 'dashpass',
      balance: 0,
      amount: 50,
      status: 'active',
      expiry_date: '2025-01-31',
    },
  ],
}

export default function CardDetailsPage() {
  const { cardType } = useParams<{ cardType: string }>()
  const navigate = useNavigate()
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showRedemptionModal, setShowRedemptionModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isProcessingRedemption, setIsProcessingRedemption] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const normalizedCardType = cardType?.toLowerCase() as CardType | undefined
  const validCardType = normalizedCardType && CARD_TYPE_MAP[normalizedCardType]

  const { useRecipientCardsService } = useRecipientCards()
  const { data: recipientCardsResponse, isLoading } = useRecipientCardsService()
  const { useProcessCardsRedemptionService } = useRedemptionQueries()
  const processRedemptionMutation = useProcessCardsRedemptionService()
  const { useGetUserProfileService } = userProfile()
  const { data: user } = useGetUserProfileService()

  // Filter cards by type - use example data if API data is not available
  const filteredCards = useMemo(() => {
    if (!validCardType) return []

    // Use example data for demonstration
    const useExampleData = !recipientCardsResponse?.data || recipientCardsResponse.data.length === 0

    if (useExampleData) {
      return EXAMPLE_CARDS[validCardType] || []
    }

    const cards = Array.isArray(recipientCardsResponse.data) ? recipientCardsResponse.data : []

    return cards.filter((card: any) => {
      const cardTypeLower = card.card_type?.toLowerCase() || card.type?.toLowerCase() || ''
      return cardTypeLower === validCardType
    })
  }, [recipientCardsResponse, validCardType])

  // Handle redeem button click
  const handleRedeemClick = (card: any) => {
    setSelectedCard(card)
    setShowRedemptionModal(true)
  }

  // Handle redemption confirmation
  const handleConfirmRedemption = () => {
    if (!selectedCard) return
    if (!agreeToTerms) {
      return
    }
    setShowRedemptionModal(false)
    setShowOTPModal(true)
  }

  // Reset terms agreement when modal closes
  const handleCloseRedemptionModal = () => {
    setShowRedemptionModal(false)
    setSelectedCard(null)
    setAgreeToTerms(false)
  }

  // Handle OTP verification and process redemption
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOTPVerify = async (_otp: string) => {
    if (!selectedCard || !validCardType || !user) return

    const userPhoneNumber = (user as any)?.phonenumber || (user as any)?.phone || ''
    if (!userPhoneNumber) {
      return
    }

    // Format phone number (replace +233 or 233 with 0, keep only digits)
    const formattedPhone = userPhoneNumber.replace(/^\+?233/, '0').replace(/\D/g, '')

    const cardTypeForAPI = formatCardTypeForAPI(validCardType)
    if (!cardTypeForAPI) {
      return
    }

    setIsProcessingRedemption(true)
    try {
      await processRedemptionMutation.mutateAsync({
        card_type: cardTypeForAPI,
        phone_number: formattedPhone,
      })
      setShowOTPModal(false)
      setSelectedCard(null)
      // Cards will refresh automatically via query invalidation
    } catch (error) {
      console.error('Redemption error:', error)
    } finally {
      setIsProcessingRedemption(false)
    }
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

            return (
              <div
                key={card.id || card.card_id || index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Visual */}
                <div
                  className="relative overflow-hidden bg-gray-200"
                  style={{ paddingTop: '62.5%' }}
                >
                  <img
                    src={cardBackground}
                    alt={`${CARD_DISPLAY_NAMES[validCardType]} card background`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

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
                {selectedCard.branch_name && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Branch
                    </Text>
                    <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                      {selectedCard.branch_name}
                    </Text>
                  </div>
                )}
                {selectedCard.vendor_name && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Vendor
                    </Text>
                    <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                      {selectedCard.vendor_name}
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
              <Button variant="outline" onClick={handleCloseRedemptionModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirmRedemption}
                disabled={!agreeToTerms}
                className="flex-1"
              >
                Continue to Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* OTP Verification Modal */}
      <RedemptionOTPModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false)
          setSelectedCard(null)
        }}
        onVerify={handleOTPVerify}
        isLoading={isProcessingRedemption}
        userPhone={(user as any)?.phonenumber || (user as any)?.phone || ''}
      />
    </div>
  )
}
