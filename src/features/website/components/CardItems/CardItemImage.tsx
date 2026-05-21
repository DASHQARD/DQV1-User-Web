import { useEffect, useState } from 'react'

import { useCardImageUrl } from '@/hooks'

type CardItemImageProps = {
  fileUrl?: string | null
  cardType?: string
  alt: string
  className?: string
}

export function CardItemImage({ fileUrl, cardType, alt, className }: CardItemImageProps) {
  const { url, fallback } = useCardImageUrl({ fileUrl, cardType })
  const [displaySrc, setDisplaySrc] = useState(url)

  useEffect(() => {
    setDisplaySrc(url)
  }, [url])

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onError={() => {
        if (displaySrc !== fallback) setDisplaySrc(fallback)
      }}
    />
  )
}
