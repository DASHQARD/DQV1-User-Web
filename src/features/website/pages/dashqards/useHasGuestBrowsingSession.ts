import { useAuthStore } from '@/stores'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { hasAnonymousGuestBrowsingSession } from '@/features/website/utils/guestBrowsingSession'

/** Anonymous user already chose guest flow (local cart, ack, or saved phone). */
export function useHasGuestBrowsingSession(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const localCartHasItems = useGuestLocalCartStore((s) => s.lines.length > 0)

  if (isAuthenticated || isGuestAuth) return false
  return hasAnonymousGuestBrowsingSession(localCartHasItems)
}
