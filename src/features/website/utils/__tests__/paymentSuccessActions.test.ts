import { describe, expect, it } from 'vitest'

import { getPaymentSuccessActions } from '../paymentSuccessActions'
import { ROUTES } from '@/utils/constants'

describe('getPaymentSuccessActions', () => {
  it('returns dashboard and orders for member users', () => {
    const actions = getPaymentSuccessActions({
      isAuthenticated: true,
      isGuestAuth: false,
      userType: 'user',
    })
    expect(actions).toHaveLength(2)
    expect(actions[0]?.to).toBe(ROUTES.IN_APP.DASHBOARD.HOME)
    expect(actions[1]?.to).toBe(ROUTES.IN_APP.DASHBOARD.ORDERS)
  })

  it('returns corporate routes for corporate members', () => {
    const actions = getPaymentSuccessActions({
      isAuthenticated: true,
      isGuestAuth: false,
      userType: 'corporate',
    })
    expect(actions[0]?.to).toBe(ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME)
    expect(actions[1]?.to).toBe(ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS)
  })

  it('returns guest website routes without dashboard', () => {
    const actions = getPaymentSuccessActions({
      isAuthenticated: true,
      isGuestAuth: true,
    })
    expect(actions.map((a) => a.id)).toEqual(['shop', 'guest-cards', 'redeem'])
    expect(actions.some((a) => a.to.includes('/dashboard'))).toBe(false)
    expect(actions.find((a) => a.id === 'guest-cards')?.to).toBe(ROUTES.IN_APP.GUEST.CARDS)
  })

  it('includes sign in when session is not authenticated', () => {
    const actions = getPaymentSuccessActions({
      isAuthenticated: false,
      isGuestAuth: false,
    })
    expect(actions.map((a) => a.id)).toEqual(['shop', 'redeem', 'sign-in'])
  })
})
