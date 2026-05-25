import { useMemo } from 'react'

import { getCardBackground, getCardMediaSource } from '@/utils/cardDisplay'

type UseCardImageUrlOptions = {
  fileUrl?: string | null
  cardType?: string
  fallback?: string
}

/** Resolves card image file keys or legacy upload paths to a displayable image URL. */
export function useCardImageUrl({ fileUrl, cardType, fallback }: UseCardImageUrlOptions) {
  const typeFallback = useMemo(
    () => fallback ?? getCardBackground(cardType),
    [fallback, cardType],
  )

  const directUrl = useMemo(
    () => getCardMediaSource(fileUrl ?? undefined).directUrl,
    [fileUrl],
  )

  const url = directUrl || typeFallback

  return { url, isLoading: false, fallback: typeFallback }
}
