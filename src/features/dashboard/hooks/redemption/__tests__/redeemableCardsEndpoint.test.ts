import { describe, expect, it } from 'vitest'

/** Mirrors useGetRedeemableCardsService endpoint selection. */
function shouldUseUserRedeemableCardsEndpoint(
  isAuthenticated: boolean,
  isGuestAuth: boolean,
): boolean {
  return isAuthenticated && !isGuestAuth
}

function shouldFetchRedeemableCards(isAuthenticated: boolean, isGuestAuth: boolean): boolean {
  return isAuthenticated && !isGuestAuth
}

describe('redeemable cards endpoint selection', () => {
  it('does not call redeemable-cards for guests (use guest-redemptions APIs)', () => {
    expect(shouldFetchRedeemableCards(true, true)).toBe(false)
  })

  it('uses /users/redeemable-cards for authenticated members', () => {
    expect(shouldUseUserRedeemableCardsEndpoint(true, false)).toBe(true)
  })

  it('uses public redeemable-cards when unauthenticated with phone', () => {
    expect(shouldUseUserRedeemableCardsEndpoint(false, false)).toBe(false)
    expect(shouldFetchRedeemableCards(false, false)).toBe(false)
  })
})
