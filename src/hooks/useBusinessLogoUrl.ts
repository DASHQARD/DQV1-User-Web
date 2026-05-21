import { useMemo } from 'react'

import { getBusinessLogoFileKey, type BusinessLogoProfile } from '@/utils/businessLogo'
import { usePresignedMediaUrl } from './usePresignedMediaUrl'

type UseBusinessLogoUrlOptions = {
  enabled?: boolean
}

/** Resolves corporate/vendor business logo storage keys to a loadable URL. */
export function useBusinessLogoUrl(
  profile?: BusinessLogoProfile | null,
  options?: UseBusinessLogoUrlOptions,
) {
  const fileKey = useMemo(() => getBusinessLogoFileKey(profile), [profile])
  return usePresignedMediaUrl(fileKey, options)
}
