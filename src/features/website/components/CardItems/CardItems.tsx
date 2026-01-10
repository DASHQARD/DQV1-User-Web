import React, { useState } from 'react'
import { Icon } from '@/libs'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/format'
import { Text } from '@/components'

type FeaturedCardProps = {
  card_id: number
  product: string
  branch_name: string
  branch_location: string
  description: string
  price: string
  base_price: string
  markup_price: number | null
  service_fee: string
  currency: string
  expiry_date: string
  status: string
  rating: number
  created_at: string
  recipient_count: string
  images: []
  terms_and_conditions: []
  type: string
  updated_at: string
  vendor_id: number
  vendor_name: string
  buttonText?: string
  onGetQard?: () => void
}

export const CardItems = ({
  card_id,
  product,
  branch_name,
  branch_location,
  vendor_name,
  buttonText = 'Quick Add',
  rating = 0,
  price,
  currency = 'GHS',
  type,
  onGetQard,
}: FeaturedCardProps) => {
  // const { id, product, vendor_name, rating = 0, price, currency = 'GHS', type, onGetQard } = props

  const roundedRating = Math.round(rating)
  const [isHovered, setIsHovered] = useState(false)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()

  // Get background SVG based on card type
  const getCardBackground = () => {
    const normalizedType = type?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashpass':
        return DashpassBg
      case 'dashgo':
        return DashgoBg
      default:
        return DashxBg // default fallback
    }
  }

  const cardBackground = getCardBackground()
  const displayPrice = formatCurrency(price, currency) || 0

  // Generate QR code for the card
  // const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${product}-${card_id}`)}&bgcolor=FFFFFF&color=000000&margin=0`

  // Get card type display name
  const getCardTypeName = () => {
    const normalizedType = type?.toLowerCase()
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

  const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (!card_id) {
      console.error('Card ID is required to add item to cart')
      return
    }

    try {
      await addToCartAsync({
        card_id: card_id,
        quantity: 1,
      })
      openCart()
    } catch (error) {
      console.error('Failed to add item to cart', error)
    }
  }

  const handleCardClick = () => {
    if (onGetQard) {
      onGetQard()
    }
  }

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-gray-200" style={{ paddingTop: '62.5%' }}>
        <img
          src={cardBackground}
          alt={`${product} card background`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Card Overlay Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          {/* Top Section */}
          <div className="flex items-start justify-between">
            {/* Left: Card Type */}
            <div className="flex items-center gap-2">
              <Icon icon="bi:gift" className="size-5" />
              <span className="font-extrabold text-lg tracking-wide">{getCardTypeName()}</span>
            </div>

            {/* Right: Price */}
            <div className="text-right">
              <span className="text-2xl font-extrabold">{displayPrice}</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between">
            {/* Left: Vendor Name */}
            {vendor_name && (
              <div>
                <span className="font-bold text-base tracking-wide uppercase">{vendor_name}</span>
              </div>
            )}

            {/* Right: QR Code */}
            {/* <div className="p-1.5 rounded-lg">
              <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-2 px-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-col gap-2 text-[#030303]">
          <Text variant="p" weight="semibold" className="hover:underline">
            {vendor_name || branch_name}
          </Text>

          <Text variant="span" className="text-[#666]">
            {product}
          </Text>

          <Text variant="span" className="text-[#666]">
            {branch_location}
          </Text>

          {rating > 0 && (
            <div
              className="inline-flex items-center gap-1.5"
              aria-label={`Rating ${rating} out of 5`}
            >
              {Array.from({ length: 5 }).map((_, n) => {
                const starNumber = n + 1
                return (
                  <Icon
                    key={starNumber}
                    icon={starNumber <= roundedRating ? 'bi:star-fill' : 'bi:star'}
                    className="size-4 text-yellow-500"
                  />
                )
              })}
              <span className="text-sm font-semibold text-[#7a7a7a]">{rating.toFixed(1)}</span>
            </div>
          )}

          {price && <p className="font-medium">{displayPrice}</p>}
        </header>

        {/* Meta */}

        {/* Actions */}
        <div className="mt-auto pt-3.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            className={`w-full rounded-full bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(64,45,135,0.25)] transition-all duration-200 hover:bg-primary-700 active:translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isHovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            {isAdding ? 'Adding...' : buttonText}
          </button>
        </div>
      </div>
    </article>
  )
}
