import { beforeEach, describe, expect, it, vi } from 'vitest'

const postMethod = vi.fn()
const getState = vi.fn()

vi.mock('@/services/requests', () => ({
  postMethod: (...args: unknown[]) => postMethod(...args),
  getList: vi.fn(),
}))

vi.mock('@/stores', () => ({
  useAuthStore: {
    getState,
  },
}))

vi.mock('@/libs', () => ({
  axiosClient: {
    post: vi.fn(),
  },
}))

describe('auth logout services', () => {
  beforeEach(() => {
    postMethod.mockReset()
    getState.mockReset()
  })

  it('calls guest-auth/logout for guest sessions', async () => {
    getState.mockReturnValue({ isGuestAuth: true })
    const { logout, guestAuthLogout } = await import('../index')

    await logout()
    expect(postMethod).toHaveBeenCalledWith('/guest-auth/logout')

    postMethod.mockClear()
    await guestAuthLogout()
    expect(postMethod).toHaveBeenCalledWith('/guest-auth/logout')
  })

  it('calls auth/logout for registered user sessions', async () => {
    getState.mockReturnValue({ isGuestAuth: false })
    const { logout } = await import('../index')

    await logout()
    expect(postMethod).toHaveBeenCalledWith('/auth/logout')
  })
})
