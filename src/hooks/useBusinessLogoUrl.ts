import { useMemo } from 'react'

import { getBusinessLogoFileKey, type BusinessLogoProfile } from '@/utils/businessLogo'
import { usePresignedMediaUrl } from './usePresignedMediaUrl'

/** Resolves corporate/vendor business logo storage keys to a loadable URL. */
export function useBusinessLogoUrl(profile?: BusinessLogoProfile | null) {
  const fileKey = useMemo(() => getBusinessLogoFileKey(profile), [profile])
  return usePresignedMediaUrl(fileKey)
}
