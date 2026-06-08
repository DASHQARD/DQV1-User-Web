import { describe, expect, it } from 'vitest'
import {
  clampGiftCardAmount,
  formatGiftCardAmountPreview,
  fromGiftCardPriceInputChange,
  GIFT_CARD_AMOUNT_MAX,
  isGiftCardAmountSubmittable,
  normalizeGiftCardAmountInput,
  parseGiftCardAmountInput,
  resolveGiftCardAmount,
  toGiftCardPriceInputValue,
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

  it('formatGiftCardAmountPreview clamps out-of-range values for display', () => {
    expect(formatGiftCardAmountPreview('')).toBe('0.00')
    expect(formatGiftCardAmountPreview('500')).toBe('500.00')
    expect(formatGiftCardAmountPreview('99999')).toBe('10,000.00')
    expect(formatGiftCardAmountPreview('10000000000000000000000')).toBe('10,000.00')
  })

  it('toGiftCardPriceInputValue shows empty instead of zero default', () => {
    expect(toGiftCardPriceInputValue(0)).toBe('')
    expect(toGiftCardPriceInputValue(undefined)).toBe('')
    expect(toGiftCardPriceInputValue(250)).toBe('250')
  })

  it('fromGiftCardPriceInputChange maps empty string to null', () => {
    expect(fromGiftCardPriceInputChange('')).toBeNull()
    expect(fromGiftCardPriceInputChange('500')).toBe(500)
  })

  it('isGiftCardAmountSubmittable enforces min and max', () => {
    expect(isGiftCardAmountSubmittable('')).toBe(false)
    expect(isGiftCardAmountSubmittable('0.50')).toBe(false)
    expect(isGiftCardAmountSubmittable('1')).toBe(true)
    expect(isGiftCardAmountSubmittable('10000')).toBe(true)
    expect(isGiftCardAmountSubmittable('99999')).toBe(true)
    expect(isGiftCardAmountSubmittable('0')).toBe(false)
  })
})
