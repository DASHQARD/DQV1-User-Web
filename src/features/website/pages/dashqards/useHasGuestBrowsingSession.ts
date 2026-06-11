import { useAuthStore } from '@/stores'
import { hasAnonymousGuestBrowsingSession } from '@/features/website/utils/guestBrowsingSession'

/** Anonymous user already chose guest flow (browsing ack or saved phone). */
export function useHasGuestBrowsingSession(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)

  if (isAuthenticated || isGuestAuth) return false
  return hasAnonymousGuestBrowsingSession(false)
}
