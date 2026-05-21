import { describe, expect, it } from 'vitest'
import { formatBranchLabel, formatCurrency, formatCurrencyLabel } from '../format'

describe('formatCurrency', () => {
  it('uses GHS code instead of the cedi symbol', () => {
    expect(formatCurrency(100)).toBe('GHS 100.00')
    expect(formatCurrency(100)).not.toMatch(/₵/)
  })
})

describe('formatCurrencyLabel', () => {
  it('formats whole amounts with GHS prefix', () => {
    expect(formatCurrencyLabel(100)).toBe('GHS 100')
  })
})

describe('formatBranchLabel', () => {
  it('combines name and location', () => {
    expect(
      formatBranchLabel({
        branch_name: 'Accra Main',
        branch_location: 'Osu',
      }),
    ).toBe('Accra Main — Osu')
  })

  it('falls back when branch_name is missing from API', () => {
    expect(
      formatBranchLabel({
        branch_id: '019e4020-bb98-7c8f-91d4-747bdc0f7ad7',
      }),
    ).toBe('Branch 019e4020')
  })
})
