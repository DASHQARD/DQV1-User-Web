import { describe, expect, it } from 'vitest'
import { normalizePriceInput, reconcilePriceRange } from '../priceRangeFilter'

describe('priceRangeFilter', () => {
  it('normalizePriceInput allows partial integers while typing', () => {
    expect(normalizePriceInput('1')).toBe('1')
    expect(normalizePriceInput('10')).toBe('10')
    expect(normalizePriceInput('100')).toBe('100')
    expect(normalizePriceInput('200')).toBe('200')
  })

  it('normalizePriceInput rejects non-integers and empty clears filter', () => {
    expect(normalizePriceInput('')).toBeUndefined()
    expect(normalizePriceInput('12.5')).toBeUndefined()
    expect(normalizePriceInput('abc')).toBeUndefined()
  })

  it('reconcilePriceRange does not clamp max to min while both are set', () => {
    expect(reconcilePriceRange('50', '100')).toEqual({
      min_price: '50',
      max_price: '100',
    })
    expect(reconcilePriceRange('50', '200')).toEqual({
      min_price: '50',
      max_price: '200',
    })
  })

  it('reconcilePriceRange swaps when min exceeds max on blur', () => {
    expect(reconcilePriceRange('200', '50')).toEqual({
      min_price: '50',
      max_price: '200',
    })
  })
})
