import { describe, it, expect } from 'vitest'
import { getVendorCatalogStats, vendorHasCatalogCards } from '../vendorCatalogStats'

describe('vendorCatalogStats', () => {
  it('aggregates cards, types, and price range', () => {
    const stats = getVendorCatalogStats([
      {
        cards: [
          { card_type: 'DashX', card_price: 100, currency: 'GHS', card_status: 'active' },
          { card_type: 'DashPass', card_price: 220, currency: 'GHS', card_status: 'active' },
        ],
      },
      { cards: [] },
    ])

    expect(stats.totalCards).toBe(2)
    expect(stats.activeBranches).toBe(1)
    expect(stats.cardTypes).toEqual(['DashX', 'DashPass'])
    expect(stats.minPrice).toBe(100)
    expect(stats.maxPrice).toBe(220)
  })

  it('returns false when only empty branches exist', () => {
    expect(vendorHasCatalogCards([{ cards: [] }])).toBe(false)
  })
})
