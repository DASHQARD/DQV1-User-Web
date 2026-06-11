import { beforeEach, describe, expect, it, vi } from 'vitest'

const getState = vi.fn()

vi.mock('@/stores', () => ({
  useAuthStore: { getState },
}))

describe('authRequestRecovery', () => {
  beforeEach(() => {
    getState.mockReset()
  })

  it('detects member-only API paths', async () => {
    const { isMemberOnlyRequestPath } = await import('../authRequestRecovery')
    expect(isMemberOnlyRequestPath('/users/info')).toBe(true)
    expect(isMemberOnlyRequestPath('/carts')).toBe(true)
    expect(isMemberOnlyRequestPath('/carts?limit=10')).toBe(true)
    expect(isMemberOnlyRequestPath('/carts/items/1')).toBe(true)
    expect(isMemberOnlyRequestPath('/guest-carts')).toBe(false)
    expect(isMemberOnlyRequestPath('/guest-auth/session')).toBe(false)
  })

  it('does not recover member sessions with guest session recreation', async () => {
    getState.mockReturnValue({
      isGuestAuth: false,
      getRefreshToken: () => 'refresh-token',
    })
    const { shouldRecoverWithGuestSession } = await import('../authRequestRecovery')
    expect(shouldRecoverWithGuestSession('Session expired')).toBe(false)
  })

  it('recovers anonymous guest browse sessions after expiry', async () => {
    getState.mockReturnValue({
      isGuestAuth: true,
      getRefreshToken: () => null,
    })
    const { shouldRecoverWithGuestSession } = await import('../authRequestRecovery')
    expect(shouldRecoverWithGuestSession('Guest session expired')).toBe(true)
  })

  it('blocks retrying member cart after guest recovery', async () => {
    const { canRetryRequestAfterGuestRecovery } = await import('../authRequestRecovery')
    expect(canRetryRequestAfterGuestRecovery('/carts')).toBe(false)
    expect(canRetryRequestAfterGuestRecovery('/guest-carts')).toBe(true)
  })

  it('does not retry logout endpoints after guest recovery', async () => {
    const { canRetryRequestAfterGuestRecovery } = await import('../authRequestRecovery')
    expect(canRetryRequestAfterGuestRecovery('/guest-auth/session/logout')).toBe(false)
    expect(canRetryRequestAfterGuestRecovery('/guest-auth/logout')).toBe(false)
    expect(canRetryRequestAfterGuestRecovery('/auth/logout')).toBe(false)
  })
})
