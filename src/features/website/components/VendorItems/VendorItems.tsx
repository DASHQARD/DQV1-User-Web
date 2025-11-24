import { Icon } from '@/libs'

type VendorItemProps = {
  name: string
  shops?: number
  rating?: number
}

export const VendorItems = ({ name, shops = 1, rating = 4.5 }: VendorItemProps) => {
  const roundedRating = Math.round(rating)

  return (
    <article className="rounded-[14px] border border-black/6 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="m-0 text-base font-bold text-[#212529]">{name}</h4>
        <span className="rounded-full bg-gray-200 px-2.5 py-1.5 text-xs font-semibold text-[#555]">
          {shops} Shops
        </span>
      </div>

      {/* Rating */}
      <div className="inline-flex items-center gap-1.5" aria-label={`Rating ${rating} out of 5`}>
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
        <span className="text-sm font-semibold text-[#6a6a6a]">{rating.toFixed(1)}</span>
      </div>
    </article>
  )
}
