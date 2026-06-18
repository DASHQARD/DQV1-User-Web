import { describe, expect, it } from 'vitest'

import { getVendorRedemptionCatalog } from '@/features/dashboard/services/redemptions'

describe('getVendorRedemptionCatalog', () => {
  it('is exported from redemptions service', () => {
    expect(typeof getVendorRedemptionCatalog).toBe('function')
  })
})
