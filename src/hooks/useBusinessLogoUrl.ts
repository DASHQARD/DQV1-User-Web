import { useMemo } from 'react'

import { resolveMediaUrl } from '@/utils/cardDisplay'
import { getBusinessLogoFileKey, type BusinessLogoProfile } from '@/utils/businessLogo'

type UseBusinessLogoUrlOptions = {
  enabled?: boolean
}

/** Resolves corporate/vendor business logo storage keys to a loadable URL. */
export function useBusinessLogoUrl(
  profile?: BusinessLogoProfile | null,
  options?: UseBusinessLogoUrlOptions,
) {
  const enabled = options?.enabled !== false
  const fileKey = useMemo(() => getBusinessLogoFileKey(profile), [profile])

  const url = useMemo(() => {
    if (!enabled) return null
    return resolveMediaUrl(fileKey)
  }, [enabled, fileKey])

  return { url, isLoading: false }
}
