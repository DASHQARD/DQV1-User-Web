import { describe, it, expect } from 'vitest'
import { isHiddenHomepageVendor } from '../hiddenHomepageVendors'

describe('isHiddenHomepageVendor', () => {
  it('hides Melcom and Aqua Safari names', () => {
    expect(isHiddenHomepageVendor('Melcom')).toBe(true)
    expect(isHiddenHomepageVendor('MELCOM GHANA LTD')).toBe(true)
    expect(isHiddenHomepageVendor('Aqua Safari')).toBe(true)
    expect(isHiddenHomepageVendor('Aqua Safari Resort')).toBe(true)
  })

  it('keeps other vendors', () => {
    expect(isHiddenHomepageVendor('KFC')).toBe(false)
    expect(isHiddenHomepageVendor('')).toBe(false)
    expect(isHiddenHomepageVendor(undefined)).toBe(false)
  })
})
