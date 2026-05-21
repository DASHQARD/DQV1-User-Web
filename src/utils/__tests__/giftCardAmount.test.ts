import { describe, expect, it } from 'vitest'
import {
  clampGiftCardAmount,
  GIFT_CARD_AMOUNT_MAX,
  normalizeGiftCardAmountInput,
  parseGiftCardAmountInput,
  resolveGiftCardAmount,
} from '../giftCardAmount'

describe('giftCardAmount', () => {
  it('parseGiftCardAmountInput rejects oversized digit strings that become scientific notation', () => {
    expect(parseGiftCardAmountInput('10000000000000000000000')).toBeNull()
    expect(parseFloat('10000000000000000000000')).toBe(1e22)
  })

  it('normalizeGiftCardAmountInput caps values above max', () => {
    expect(normalizeGiftCardAmountInput('10000000000000000000000')).toBe('10000')
    expect(normalizeGiftCardAmountInput('99999')).toBe('10000')
  })

  it('resolveGiftCardAmount returns clamped preview-safe value', () => {
    expect(resolveGiftCardAmount('500')).toBe(500)
    expect(resolveGiftCardAmount('10000000000000000000000')).toBe(GIFT_CARD_AMOUNT_MAX)
  })

  it('clampGiftCardAmount bounds finite numbers', () => {
    expect(clampGiftCardAmount(0)).toBe(1)
    expect(clampGiftCardAmount(50_000)).toBe(GIFT_CARD_AMOUNT_MAX)
    expect(clampGiftCardAmount(Number.NaN)).toBe(1)
  })
})
