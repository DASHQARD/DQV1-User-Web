import { axiosClient } from '@/libs'
import { useAuthStore } from '@/stores'
import { extractTokensFromPayload } from '@/utils/authSession'
import { getGuestPhoneFromAuth } from '@/features/website/utils/guestAuth'

export type GuestSessionData = {
  accessToken: string
  guestSessionId?: string
  expiresIn?: number
}

/** POST /guest-auth/session/logout — destroys anonymous session token (not OTP guest logout). */
export async function guestSessionLogout(): Promise<void> {
  await axiosClient.post('/guest-auth/session/logout', {})
}

/** POST /guest-auth/session — anonymous guest session (no OTP). */
export async function guestAuthCreateSession(): Promise<GuestSessionData> {
  const response = await axiosClient.post('/guest-auth/session', {})
  const root = response as unknown as Record<string, unknown> | null | undefined
  const data = (root?.data ?? root) as Record<string, unknown> | null | undefined
  const { accessToken } = extractTokensFromPayload(response)
  if (!accessToken) {
    throw new Error('Invalid guest session response')
  }
  const guestSessionId =
    typeof data?.guest_session_id === 'string' ? data.guest_session_id : undefined
  const expiresIn = typeof data?.expires_in === 'number' ? data.expires_in : undefined
  return { accessToken, guestSessionId, expiresIn }
}

/** True when the guest was issued a session token (no refresh token). */
export function isGuestSessionAuth(): boolean {
  const state = useAuthStore.getState()
  return state.isGuestAuth && !state.getRefreshToken()
}

/** True when guest completed phone OTP (required before assign-recipient). */
export function isGuestOtpVerified(): boolean {
  const state = useAuthStore.getState()
  if (!state.isGuestAuth) return false
  if (state.guestOtpVerified) return true
  // Legacy persisted sessions: OTP tokens carry guest phone; browse sessions do not.
  return !isGuestSessionAuth() && Boolean(getGuestPhoneFromAuth(state.user))
}

/** Reactive selector for guest OTP verification state. */
export function useGuestOtpVerified(): boolean {
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const guestOtpVerified = useAuthStore((state) => state.guestOtpVerified)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)

  if (!isGuestAuth) return false
  if (guestOtpVerified) return true
  return Boolean(refreshToken) || Boolean(getGuestPhoneFromAuth(user))
}

/**
 * Ensures a guest Bearer token exists for cart/checkout APIs.
 * No-op when already authenticated as a member.
 */
export async function ensureGuestSession(): Promise<string> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('dashqard-guest-local-cart')
  }
  const state = useAuthStore.getState()
  if (state.isAuthenticated && !state.isGuestAuth) {
    const memberToken = state.getToken()
    if (!memberToken) {
      throw new Error('Member session is missing a token')
    }
    return memberToken
  }

  const existing = state.getToken()
  if (state.isGuestAuth && existing) {
    return existing
  }

  const { accessToken } = await guestAuthCreateSession()
  state.authenticate({
    token: accessToken,
    refreshToken: null,
    isGuestAuth: true,
    guestOtpVerified: false,
  })
  return accessToken
}

/** Re-create an anonymous guest session after token expiry (no refresh endpoint). */
export async function recreateGuestSession(): Promise<string> {
  const { accessToken } = await guestAuthCreateSession()
  useAuthStore.getState().authenticate({
    token: accessToken,
    refreshToken: null,
    isGuestAuth: true,
    guestOtpVerified: false,
  })
  return accessToken
}
