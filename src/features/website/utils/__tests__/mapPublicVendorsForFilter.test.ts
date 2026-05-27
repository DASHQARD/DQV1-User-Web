import { describe, it, expect } from 'vitest'
import { mapPublicVendorsForFilter } from '../mapPublicVendorsForFilter'

describe('mapPublicVendorsForFilter', () => {
  it('maps vendors with cards only', () => {
    const result = mapPublicVendorsForFilter({
      data: [
        {
          vendor_id: 1,
          business_name: 'Acme',
          branches_with_cards: [{ cards: [{ card_id: 'a' }] }],
        },
        {
          vendor_id: 2,
          business_name: 'Empty',
          branches_with_cards: [{ cards: [] }],
        },
      ],
    })

    expect(result).toEqual([{ id: 1, vendor_id: 1, name: 'Acme' }])
  })
})
