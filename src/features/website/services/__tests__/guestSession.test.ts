import { describe, it, expect, vi, beforeEach } from 'vitest'

const postMock = vi.fn()
const authenticateMock = vi.fn()

vi.mock('@/libs', () => ({
  axiosClient: {
    post: (...args: unknown[]) => postMock(...args),
  },
}))

vi.mock('@/stores', () => ({
  useAuthStore: {
    getState: () => ({
      isAuthenticated: false,
      isGuestAuth: false,
      getToken: () => null,
      getRefreshToken: () => null,
      authenticate: authenticateMock,
    }),
  },
}))

describe('guestSession', () => {
  beforeEach(() => {
    postMock.mockReset()
    authenticateMock.mockReset()
  })

  it('guestAuthCreateSession posts to /guest-auth/session', async () => {
    postMock.mockResolvedValue({
      data: {
        access_token: 'session-token',
        guest_session_id: 'uuid',
        expires_in: 604800,
      },
    })
    const { guestAuthCreateSession } = await import('../guestSession')
    const result = await guestAuthCreateSession()
    expect(postMock).toHaveBeenCalledWith('/guest-auth/session', {})
    expect(result.accessToken).toBe('session-token')
    expect(result.guestSessionId).toBe('uuid')
    expect(result.expiresIn).toBe(604800)
  })

  it('guestSessionLogout posts to /guest-auth/session/logout', async () => {
    postMock.mockResolvedValue({})
    const { guestSessionLogout } = await import('../guestSession')
    await guestSessionLogout()
    expect(postMock).toHaveBeenCalledWith('/guest-auth/session/logout', {})
  })

  it('ensureGuestSession authenticates with session token and no refresh token', async () => {
    postMock.mockResolvedValue({
      data: { access_token: 'new-session-token' },
    })
    const { ensureGuestSession } = await import('../guestSession')
    const token = await ensureGuestSession()
    expect(token).toBe('new-session-token')
    expect(authenticateMock).toHaveBeenCalledWith({
      token: 'new-session-token',
      refreshToken: null,
      isGuestAuth: true,
      guestOtpVerified: false,
    })
  })
})
