import { describe, it, expect, vi, beforeEach } from 'vitest'

const openModalMock = vi.fn()
const getStateMock = vi.fn()

vi.mock('@/stores/guestAddToCartModal', () => ({
  useGuestAddToCartModalStore: {
    getState: () => ({
      open: openModalMock,
    }),
  },
}))

vi.mock('@/stores', () => ({
  useAuthStore: {
    getState: () => getStateMock(),
  },
}))

vi.mock('@/features/website/services/guestSession', () => ({
  isGuestOtpVerified: () => getStateMock().isGuestOtpVerified ?? false,
}))

describe('guestOtpGate', () => {
  beforeEach(() => {
    openModalMock.mockReset()
    getStateMock.mockReturnValue({
      isAuthenticated: false,
      isGuestAuth: false,
      isGuestOtpVerified: false,
      getToken: () => null,
    })
  })

  it('ensureGuestOtpForGuestCards opens OTP modal when guest is not verified', async () => {
    const { ensureGuestOtpForGuestCards, fulfillGuestOtpGate } = await import('../guestOtpGate')

    const pending = ensureGuestOtpForGuestCards()
    expect(openModalMock).toHaveBeenCalledWith({ cardCreationOtp: true })

    fulfillGuestOtpGate('otp-token')
    await expect(pending).resolves.toBe('otp-token')
  })

  it('ensureGuestOtpForGuestCards returns existing token when OTP verified', async () => {
    getStateMock.mockReturnValue({
      isAuthenticated: false,
      isGuestAuth: true,
      isGuestOtpVerified: true,
      getToken: () => 'existing-otp-token',
    })

    const { ensureGuestOtpForGuestCards } = await import('../guestOtpGate')
    await expect(ensureGuestOtpForGuestCards()).resolves.toBe('existing-otp-token')
    expect(openModalMock).not.toHaveBeenCalled()
  })
})
