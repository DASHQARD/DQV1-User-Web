import { describe, expect, it, vi } from 'vitest'
import {
  getCardExpiryEndTimestamp,
  getCardStatusBarWidth,
  isAssignedCardRedeemable,
  isMyGiftCardActive,
  isCardExpired,
  isCatalogCardPurchasable,
  resolveCardDisplayStatus,
  resolveGuestGiftCardTileDisplayStatus,
  resolvePurchasedGuestCardDisplayStatus,
} from '../cardExpiry'

describe('cardExpiry', () => {
  it('isCardExpired is false before end of expiry UTC day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00.000Z'))
    expect(isCardExpired('2026-06-30T00:00:00.000Z')).toBe(false)
    vi.useRealTimers()
  })

  it('isCardExpired is true after expiry UTC day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T00:00:01.000Z'))
    expect(isCardExpired('2026-06-30T00:00:00.000Z')).toBe(true)
    vi.useRealTimers()
  })

  it('resolveCardDisplayStatus returns expired when date passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T00:00:00.000Z'))
    expect(resolveCardDisplayStatus('active', '2026-06-30T00:00:00.000Z')).toBe('expired')
    vi.useRealTimers()
  })

  it('isCatalogCardPurchasable rejects expired and non-active', () => {
    expect(isCatalogCardPurchasable({ status: 'active', expiry_date: null })).toBe(true)
    expect(isCatalogCardPurchasable({ status: 'expired' })).toBe(false)
    expect(isCatalogCardPurchasable({ status: 'pending' })).toBe(false)
  })

  it('isMyGiftCardActive groups redeemable vs inactive cards', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T00:00:00.000Z'))
    expect(
      isMyGiftCardActive({
        status: 'active',
        expiry_date: '2026-06-30',
        is_activated: true,
        balance: 255,
      }),
    ).toBe(true)
    expect(
      isMyGiftCardActive({
        status: 'active',
        expiry_date: '2026-06-30',
        is_activated: false,
        balance: 255,
      }),
    ).toBe(false)
    expect(
      isMyGiftCardActive({
        status: 'used',
        expiry_date: '2026-12-30',
        balance: 100,
      }),
    ).toBe(false)
    vi.useRealTimers()
  })

  it('isAssignedCardRedeemable respects redeemed flag and expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-02T00:00:00.000Z'))
    expect(isAssignedCardRedeemable({ redeemed: false, status: 'active', expiry_date: '2026-06-30' })).toBe(
      false,
    )
    expect(isAssignedCardRedeemable({ redeemed: true, status: 'active', expiry_date: '2026-12-30' })).toBe(
      false,
    )
    vi.useRealTimers()
  })

  it('getCardExpiryEndTimestamp returns null for empty input', () => {
    expect(getCardExpiryEndTimestamp('')).toBeNull()
    expect(getCardExpiryEndTimestamp(undefined)).toBeNull()
  })

  it('getCardStatusBarWidth maps display status to fill', () => {
    expect(getCardStatusBarWidth('active')).toBe(80)
    expect(getCardStatusBarWidth('expired')).toBe(100)
    expect(getCardStatusBarWidth('pending')).toBe(40)
  })

  it('resolvePurchasedGuestCardDisplayStatus treats paid as active until expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T00:00:00.000Z'))
    expect(resolvePurchasedGuestCardDisplayStatus('paid', '2026-06-30T00:00:00.000Z')).toBe('active')
    vi.setSystemTime(new Date('2026-07-02T00:00:00.000Z'))
    expect(resolvePurchasedGuestCardDisplayStatus('paid', '2026-06-30T00:00:00.000Z')).toBe('expired')
    vi.useRealTimers()
  })

  it('resolveGuestGiftCardTileDisplayStatus maps Paid label for progress', () => {
    expect(resolveGuestGiftCardTileDisplayStatus('Paid', '2026-12-31')).toBe('active')
    expect(resolveGuestGiftCardTileDisplayStatus('Expired', null)).toBe('expired')
  })
})
