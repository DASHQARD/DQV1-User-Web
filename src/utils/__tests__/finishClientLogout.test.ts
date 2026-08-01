import { describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/utils/constants'
import { finishClientLogout, forceClientLogout } from '../finishClientLogout'

describe('finishClientLogout', () => {
  it('navigates home before clearing auth', () => {
    const navigate = vi.fn()
    const clearAuthState = vi.fn()
    const callOrder: string[] = []

    navigate.mockImplementation(() => callOrder.push('navigate'))
    clearAuthState.mockImplementation(() => callOrder.push('clear'))

    finishClientLogout(navigate, clearAuthState)

    expect(navigate).toHaveBeenCalledWith(ROUTES.IN_APP.HOME, { replace: true })
    expect(clearAuthState).toHaveBeenCalled()
    expect(callOrder).toEqual(['navigate', 'clear'])
  })
})

describe('forceClientLogout', () => {
  it('clears auth and hard-redirects away from protected routes', () => {
    const clearAuthState = vi.fn()
    const replace = vi.fn()
    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/dashboard/corporate', replace },
    })

    forceClientLogout(clearAuthState)

    expect(clearAuthState).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith(ROUTES.IN_APP.HOME)

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('clears auth but does not redirect on auth or redeem paths', () => {
    const clearAuthState = vi.fn()
    const replace = vi.fn()
    const originalLocation = window.location

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/auth/login', replace },
    })

    forceClientLogout(clearAuthState)

    expect(clearAuthState).toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/redeem/abc', replace },
    })

    forceClientLogout(clearAuthState)
    expect(replace).not.toHaveBeenCalled()

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })
})
