import { describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/utils/constants'
import { finishClientLogout } from '../finishClientLogout'

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
