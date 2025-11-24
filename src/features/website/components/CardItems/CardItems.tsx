import { Icon } from '@/libs'

type FeaturedCardProps = {
  title: string
  subtitle?: string
  imageUrl: string
  rating?: number
  reviews?: number
  qrUrl?: string
  onGetQard?: () => void
}

export const CardItems = ({
  title,
  subtitle = '',
  imageUrl,
  rating = 4.8,
  reviews = 120,
  onGetQard,
}: FeaturedCardProps) => {
  const roundedRating = Math.round(rating)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-black/6 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-gray-200" style={{ paddingTop: '62.5%' }}>
        <img
          src={imageUrl}
          alt={`${title} image`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Body */}
      <div className="p-4">
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
        <div className="mt-3.5">
          <button
            type="button"
            onClick={onGetQard}
            className="w-full rounded-full bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(64,45,135,0.25)] transition-all duration-200 hover:bg-primary-700 active:translate-y-px cursor-pointer"
          >
            Get Qard
          </button>
        </div>
      </div>
    </article>
  )
}
