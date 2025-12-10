import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader, Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useCards } from '../../hooks/useCards'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '@/stores/cart'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashpass_bg.svg'
import { ROUTES } from '@/utils/constants/shared'
import type { PublicCardResponse } from '@/types/cards'

export default function CardDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usePublicCardById } = useCards()
  const { data: cardResponse, isLoading, error } = usePublicCardById(id || null)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()

  const card = cardResponse as unknown as PublicCardResponse

  // Get card background based on type
  const getCardBackground = () => {
    if (!card?.type) return DashxBg
    const normalizedType = card.type.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashpass':
        return DashpassBg
      case 'dashgo':
        return DashxBg // fallback for now
      default:
        return DashxBg
    }
  }

  // Get card type display name
  const getCardTypeName = () => {
    if (!card?.type) return 'DASHQARD'
    const normalizedType = card.type.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return 'DASHX'
      case 'dashpro':
        return 'DASHPRO'
      case 'dashpass':
        return 'DASHPASS'
      case 'dashgo':
        return 'DASHGO'
      default:
        return 'DASHQARD'
    }
  }

  const handleAddToCart = async () => {
    if (!card || !id) return

    const cardAmount = parseFloat(card.price) || 0
    if (isNaN(cardAmount) || cardAmount <= 0) {
      return
    }

    await addToCartAsync({
      card_id: card.card_id,
      amount: cardAmount,
      quantity: 1,
    })
    openCart()
  }

  // Generate QR code for the card
  const qrCodeUrl = card
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${card.product}-${card.card_id}`)}&bgcolor=FFFFFF&color=402D87&margin=10`
    : ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Card not found</h2>
          <p className="text-gray-500 mb-4">The card you're looking for doesn't exist.</p>
          <Link
            to={ROUTES.IN_APP.DASHQARDS}
            className="text-primary-500 font-semibold hover:underline"
          >
            Browse all cards
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = parseFloat(card.price) || 0
  const cardBackground = getCardBackground()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="wrapper py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to={ROUTES.IN_APP.HOME} className="hover:text-primary-500">
            Home
          </Link>
          <Icon icon="bi:chevron-right" className="size-4" />
          <Link to={ROUTES.IN_APP.DASHQARDS} className="hover:text-primary-500">
            Cards
          </Link>
          <Icon icon="bi:chevron-right" className="size-4" />
          <span className="text-gray-900">{card.product}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Card Image */}
          <div className="space-y-4">
            {/* Main Card Display */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gray-200"
              style={{ paddingTop: '62.5%' }}
            >
              <img
                src={cardBackground}
                alt={`${card.product} card background`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Card Overlay Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  {/* Left: Card Type */}
                  <div className="flex items-center gap-2">
                    <Icon icon="bi:gift" className="size-6" />
                    <span className="font-extrabold text-xl tracking-wide">
                      {getCardTypeName()}
                    </span>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <span className="text-3xl font-extrabold">{displayPrice.toFixed(2)}</span>
                    <span className="text-lg ml-1">{card.currency}</span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between">
                  {/* Left: Vendor Name */}
                  {card.vendor_name && (
                    <div>
                      <span className="font-bold text-lg tracking-wide uppercase">
                        {card.vendor_name}
                      </span>
                    </div>
                  )}

                  {/* Right: QR Code */}
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {card.images && card.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {card.images.slice(0, 4).map((image, index) => (
                  <div
                    key={image.id || index}
                    className="relative overflow-hidden rounded-lg bg-gray-200"
                    style={{ paddingTop: '100%' }}
                  >
                    <img
                      src={image.file_url}
                      alt={`${card.product} image ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Card Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold uppercase">
                  {getCardTypeName()}
                </span>
                {card.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Icon icon="bi:star-fill" className="size-4" />
                    <span className="text-sm font-semibold text-gray-700">
                      {card.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <Text variant="h1" weight="bold" className="text-gray-900 mb-2">
                {card.product}
              </Text>
              {card.vendor_name && (
                <Text variant="p" className="text-gray-600 mb-4">
                  by {card.vendor_name}
                </Text>
              )}
              <div className="flex items-baseline gap-2">
                <Text variant="h2" weight="bold" className="text-primary-500">
                  {card.currency} {displayPrice.toFixed(2)}
                </Text>
              </div>
            </div>

            {/* Description */}
            {card.description && (
              <div>
                <Text variant="h3" weight="medium" className="text-gray-900 mb-2">
                  Description
                </Text>
                <Text variant="p" className="text-gray-600 whitespace-pre-line">
                  {card.description}
                </Text>
              </div>
            )}

            {/* Card Information */}
            <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
              <Text variant="h3" weight="medium" className="text-gray-900 mb-3">
                Card Information
              </Text>
              <div className="space-y-3">
                {card.expiry_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expiry Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(card.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {card.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        card.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                  </div>
                )}
                {card.recipient_count && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recipients</span>
                    <span className="text-sm font-medium text-gray-900">
                      {card.recipient_count}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
              <div>
                <Text variant="h3" weight="medium" className="text-gray-900 mb-3">
                  Terms & Conditions
                </Text>
                <div className="space-y-2">
                  {card.terms_and_conditions.map((term, index) => (
                    <a
                      key={term.id || index}
                      href={term.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-500 hover:text-primary-700 text-sm"
                    >
                      <Icon icon="bi:file-earmark-text" className="size-4" />
                      <span>{term.file_name || `Terms ${index + 1}`}</span>
                      <Icon icon="bi:box-arrow-up-right" className="size-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
              >
                {isAdding ? (
                  <>
                    <div className="mr-2">
                      <Loader />
                    </div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Icon icon="bi:cart-plus" className="size-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-6 rounded-full"
              >
                <Icon icon="bi:arrow-left" className="size-5 mr-2" />
                Back to Cards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
