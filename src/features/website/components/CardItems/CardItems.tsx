import React, { useState } from 'react'
import { Icon } from '@/libs'
// import { useCart } from '../../hooks/useCart'
// import { useCartStore } from '@/stores/cart'

type FeaturedCardProps = {
  card_id?: number
  title: string
  subtitle?: string
  imageUrl: string
  rating?: number
  reviews?: number
  qrUrl?: string
  price?: number
  amount?: number
  type?: 'dashx' | 'dashpro' | 'dashgo'
  onGetQard?: () => void
}

export const CardItems = ({
  card_id,
  title,
  subtitle = '',
  imageUrl,
  rating = 4.8,
  reviews = 120,
  // price,
  // amount,
  onGetQard,
}: FeaturedCardProps) => {
  const roundedRating = Math.round(rating)
  const [isHovered, setIsHovered] = useState(false)
  // const { addToCartAsync } = useCart()
  // const { openCart } = useCartStore()

  const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!card_id) {
      console.error('card_id is required to add item to cart')
      return
    }

    try {
      // await addToCartAsync({
      // card_id,
      // amount: amount || price || 0,
      // quantity: 1,
      // })
      // openCart()
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    }
  }

  const handleCardClick = () => {
    if (onGetQard) {
      onGetQard()
    }
  }

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border border-black/6 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] group cursor-pointer"
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
          src={imageUrl}
          alt={`${title} image`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <header className="mb-2">
          <h3 className="mb-1 text-base font-bold text-[#212529]">{title}</h3>
          {subtitle && <p className="text-sm text-grey-500">{subtitle}</p>}
        </header>

        {/* Meta */}
        <div className="mt-2.5 flex items-center justify-start">
          <div
            className="inline-flex items-center gap-1.5 text-[0.95rem] text-yellow-500"
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
            <span className="ml-1.5 text-[0.85rem] font-semibold text-[#7a7a7a]">({reviews})</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3.5">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full rounded-full bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(64,45,135,0.25)] transition-all duration-200 hover:bg-primary-700 active:translate-y-px cursor-pointer ${
              isHovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            Quick Add
          </button>
        </div>
      </div>
    </article>
  )
}
