import { Icon } from '@/libs'
import { CardItemImage } from '@/features/website/components/CardItems/CardItemImage'
import { getCardTypeAccent } from '../cardDetailsUtils'

type GalleryImage = {
  id?: unknown
  file_name?: string
  file_url?: string
}

type CardDetailsGalleryProps = {
  displayProduct: string
  cardType?: string
  typeLabel: string
  images: GalleryImage[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onOpenLightbox: (index: number) => void
  displayPrice: number
  currency: string
}

export function CardDetailsGallery({
  displayProduct,
  cardType,
  typeLabel,
  images,
  selectedIndex,
  onSelectIndex,
  onOpenLightbox,
  displayPrice,
  currency,
}: CardDetailsGalleryProps) {
  const { badgeClass, ringClass } = getCardTypeAccent(cardType)
  const hasImages = images.length > 0
  const selected = images[selectedIndex]

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onOpenLightbox(selectedIndex)}
        disabled={!hasImages}
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-gray-100 shadow-md md:shadow-lg aspect-square sm:aspect-[4/3] group disabled:cursor-default"
        aria-label={hasImages ? `View ${displayProduct} images` : undefined}
      >
        <CardItemImage
          fileUrl={selected?.file_url}
          cardType={cardType}
          alt={displayProduct}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-enabled:group-hover:scale-[1.02]"
        />

        {hasImages && (
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        )}

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm ${badgeClass}`}
          >
            <Icon icon="bi:gift" className="size-3.5" />
            {typeLabel}
          </span>
          <span className="rounded-xl bg-black/50 backdrop-blur-sm px-3 py-1.5 text-right text-white shadow-sm">
            <span className="block text-lg font-extrabold leading-none tabular-nums">
              {displayPrice.toFixed(2)}
            </span>
            <span className="text-[10px] font-medium uppercase opacity-90">{currency}</span>
          </span>
        </div>

        {hasImages && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
            <Icon icon="bi:zoom-in" className="size-3.5" />
            Tap to enlarge
          </span>
        )}
      </button>

      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Card images"
        >
          {images.map((image, index) => {
            const isSelected = index === selectedIndex
            return (
              <button
                key={String(image.id ?? image.file_name ?? index)}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectIndex(index)}
                className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? `border-transparent ring-2 ring-offset-2 ${ringClass}`
                    : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <CardItemImage
                  fileUrl={image.file_url}
                  cardType={cardType}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {!hasImages && (
        <p className="text-center text-xs text-gray-500">No product photos — showing card style preview</p>
      )}
    </div>
  )
}
