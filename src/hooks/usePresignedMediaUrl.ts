import { useMemo } from 'react'

import { resolveMediaUrl } from '@/utils/cardDisplay'

type UsePresignedMediaUrlOptions = {
  /** When false, skips URL resolution (e.g. before vendor onboarding is complete). */
  enabled?: boolean
}

/** Resolves a storage file key or uploads path to a browser-loadable URL. */
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
