import { useMemo } from 'react'

import { getCardBackground, getCardMediaSource } from '@/utils/cardDisplay'
import { usePresignedMediaUrl } from './usePresignedMediaUrl'

type UseCardImageUrlOptions = {
  fileUrl?: string | null
  cardType?: string
  fallback?: string
}

/** Resolves card image file keys (S3) or legacy upload paths to a displayable image URL. */
export function useCardImageUrl({ fileUrl, cardType, fallback }: UseCardImageUrlOptions) {
  const typeFallback = useMemo(
    () => fallback ?? getCardBackground(cardType),
    [fallback, cardType],
  )

  const { directUrl, storageKey } = useMemo(
    () => getCardMediaSource(fileUrl ?? undefined),
    [fileUrl],
  )

  const { url: presignedUrl, isLoading } = usePresignedMediaUrl(storageKey)

  const url = directUrl || presignedUrl || typeFallback

  return { url, isLoading, fallback: typeFallback }
}
