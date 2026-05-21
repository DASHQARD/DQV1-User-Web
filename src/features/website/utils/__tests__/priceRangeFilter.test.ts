import { describe, expect, it } from 'vitest'
import {
  applyApiSafePriceRange,
  getPriceRangeValidationError,
  isInvertedPriceRange,
  normalizePriceInput,
  reconcilePriceRange,
} from '../priceRangeFilter'

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

  it('reconcilePriceRange swaps when min exceeds max (complete values only)', () => {
    expect(reconcilePriceRange('200', '50')).toEqual({
      min_price: '50',
      max_price: '200',
    })
  })

  it('detects inverted range and strips max from API query', () => {
    expect(isInvertedPriceRange('10', '1')).toBe(true)
    expect(getPriceRangeValidationError('10', '1')).toMatch(/maximum/i)
    expect(applyApiSafePriceRange({ min_price: '10', max_price: '1', limit: 50 })).toEqual({
      min_price: '10',
      max_price: '',
      limit: 50,
    })
  })

  it('keeps both prices when range is valid', () => {
    expect(applyApiSafePriceRange({ min_price: '50', max_price: '100' })).toEqual({
      min_price: '50',
      max_price: '100',
    })
  })
})
