import { useAuthStore } from '@/stores'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'

type GuestJwtClaims = {
  guest_phone?: string
  guest_name?: string
  guest_email?: string
  phone?: string
  phonenumber?: string
  email?: string
  fullname?: string
}

function resolveJwtUser(user?: Record<string, unknown> | null): GuestJwtClaims {
  if (user) return user as GuestJwtClaims
  if (typeof useAuthStore.getState === 'function') {
    return (useAuthStore.getState().user ?? {}) as GuestJwtClaims
  }
  return {}
}

/** Guest phone from JWT claims; sessionStorage only when token omits it. */
export function getGuestPhoneFromAuth(user?: Record<string, unknown> | null): string {
  const claims = resolveJwtUser(user)
  const fromJwt = claims.guest_phone ?? claims.phone ?? claims.phonenumber ?? ''
  if (fromJwt) return fromJwt
  return getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY) ?? ''
}

export function getGuestNameFromAuth(user?: Record<string, unknown> | null): string {
  const claims = resolveJwtUser(user)
  const fromJwt = claims.guest_name ?? claims.fullname ?? ''
  if (fromJwt) return fromJwt
  return getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY) ?? ''
}

export function getGuestEmailFromAuth(user?: Record<string, unknown> | null): string {
  const claims = resolveJwtUser(user)
  const fromJwt = claims.guest_email ?? claims.email ?? ''
  if (fromJwt) return fromJwt
  return getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY) ?? ''
}
