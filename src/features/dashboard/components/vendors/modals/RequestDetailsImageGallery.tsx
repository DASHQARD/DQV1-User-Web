import { getImageUrl } from '@/utils/cardDisplay'
import { Icon } from '@/libs'
import type { RequestEntityImage } from '@/features/dashboard/vendor/hooks'

type RequestDetailsImageGalleryProps = {
  images: RequestEntityImage[]
  productName?: string
}

export function RequestDetailsImageGallery({
  images,
  productName,
}: RequestDetailsImageGalleryProps) {
  if (!images.length) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
      {images.map((image, index) => {
        const imageUrl = getImageUrl(image.file_url || image.file_key)
        const imageAlt = image.file_name || `${productName ?? 'Card'} image ${index + 1}`

        return (
          <div
            key={image.id ?? index}
            className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 aspect-square"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Icon icon="bi:image" className="size-10" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
