import { useMemo } from 'react'

import { resolveMediaUrl } from '@/utils/cardDisplay'

type UsePresignedMediaUrlOptions = {
  /** When false, skips URL resolution (e.g. before vendor onboarding is complete). */
  enabled?: boolean
}

/** Resolves profile/media URLs — accepts signed URLs from the API as-is, or legacy storage keys. */
export function usePresignedMediaUrl(
  fileKey: string | null | undefined,
  options?: UsePresignedMediaUrlOptions,
) {
  const enabled = options?.enabled !== false

  const url = useMemo(() => {
    if (!enabled) return null
    return resolveMediaUrl(fileKey)
  }, [fileKey, enabled])

  return { url, isLoading: false }
}
