import { useAuthStore } from '@/stores'
import { isGuestSessionAuth } from '@/features/website/services/guestSession'
import { isGuestSessionExpiredMessage } from '@/utils/authSession'

/** Endpoints that require a registered member token — never retry these with a guest session. */
export function isMemberOnlyRequestPath(url: string | undefined): boolean {
  if (!url) return false
  if (url.includes('/users/info')) return true
  if (url.includes('/guest-carts') || url.includes('/guest-auth') || url.includes('/guest-cards')) {
    return false
  }
  return /\/carts(\/|\?|$)/.test(url)
}

/**
 * Whether a 401 should be recovered by creating a new anonymous guest session.
 * Member logouts and member-only requests must not trigger guest session recreation.
 */
export function shouldRecoverWithGuestSession(errorMessage: string): boolean {
  const state = useAuthStore.getState()
  if (!state.isGuestAuth) return false
  if (isGuestSessionAuth()) return true
  if (!state.getRefreshToken() && isGuestSessionExpiredMessage(errorMessage)) return true
  return false
}

function isLogoutRequestPath(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/guest-auth/session/logout') ||
    url.includes('/guest-auth/logout') ||
    url.includes('/auth/logout')
  )
}

export function canRetryRequestAfterGuestRecovery(url: string | undefined): boolean {
  if (isLogoutRequestPath(url)) return false
  return !isMemberOnlyRequestPath(url)
}
