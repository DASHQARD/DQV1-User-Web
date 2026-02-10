import { Icon } from '@/libs'
import { Text } from '@/components'
import { useCardItem } from '../../hooks/useCardItem'
import type { FeaturedCardProps } from '@/types'

export const CardItems = (props: FeaturedCardProps) => {
  const {
    isHovered,
    setIsHovered,
    roundedRating,
    cardBackground,
    cardTypeName,
    displayPrice,
    handleQuickAdd,
    handleCardClick,
    product,
    branch_name,
    branch_location,
    vendor_name,
    buttonText,
    rating,
    isAdding,
  } = useCardItem(props)

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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="bi:gift" className="size-5" />
              <span className="font-extrabold text-lg tracking-wide">{cardTypeName}</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold">{displayPrice}</span>
            </div>
          </div>

          <div className="flex items-end justify-between">
            {vendor_name && (
              <div>
                <span className="font-bold text-base tracking-wide uppercase">{vendor_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-2 px-1 flex flex-col h-full">
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

          {props.price && <p className="font-medium">{displayPrice}</p>}
        </header>

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
