import { useAuthStore } from '@/stores'
import { useGuestAddToCartModalStore } from '@/stores/guestAddToCartModal'
import { isGuestOtpVerified } from '@/features/website/services/guestSession'

export class GuestOtpCancelledError extends Error {
  constructor(message = 'Phone verification was cancelled') {
    super(message)
    this.name = 'GuestOtpCancelledError'
  }
}

type PendingOtpGate = {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let pendingOtpGate: PendingOtpGate | null = null

/** Opens the guest OTP modal and resolves when phone verification succeeds. */
export function requestGuestOtpForCardCreation(): Promise<string> {
  const state = useAuthStore.getState()
  if (isGuestOtpVerified()) {
    const token = state.getToken()
    if (token) return Promise.resolve(token)
  }

  if (pendingOtpGate) {
    return new Promise((resolve, reject) => {
      const previous = pendingOtpGate!
      pendingOtpGate = {
        resolve: (token) => {
          previous.resolve(token)
          resolve(token)
        },
        reject: (error) => {
          previous.reject(error)
          reject(error)
        },
      }
    })
  }

  return new Promise((resolve, reject) => {
    pendingOtpGate = { resolve, reject }
    useGuestAddToCartModalStore.getState().open({ cardCreationOtp: true })
  })
}

export function fulfillGuestOtpGate(accessToken: string): void {
  pendingOtpGate?.resolve(accessToken)
  pendingOtpGate = null
}

export function rejectGuestOtpGate(error: Error = new GuestOtpCancelledError()): void {
  pendingOtpGate?.reject(error)
  pendingOtpGate = null
}

/**
 * @deprecated Buy flow uses POST /guest-auth/session for `/guest-cards/*`.
 * OTP gate remains for legacy callers only.
 */
export async function ensureGuestOtpForGuestCards(): Promise<string> {
  const state = useAuthStore.getState()
  if (state.isAuthenticated && !state.isGuestAuth) {
    const memberToken = state.getToken()
    if (!memberToken) {
      throw new Error('Member session is missing a token')
    }
    return memberToken
  }

  if (isGuestOtpVerified()) {
    const token = state.getToken()
    if (token) return token
  }

  return requestGuestOtpForCardCreation()
}
