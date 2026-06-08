import { describe, it, expect } from 'vitest'
import {
  formatTermDisplayName,
  getCardPriceBreakdown,
  getVendorNameById,
  resolveFeaturedCardPricingFields,
} from '../cardDetailsUtils'

describe('cardDetailsUtils', () => {
  it('builds price breakdown from markup_amount when markup_price is absent', () => {
    expect(
      getCardPriceBreakdown({
        price: '110.00',
        base_price: '100.00',
        markup_amount: '10.00',
        currency: 'GHS',
      }),
    ).toEqual({
      basePrice: 100,
      markupPrice: 10,
      totalPrice: 110,
      currency: 'GHS',
    })
  })

  it('maps featured card pricing from API card fields', () => {
    expect(
      resolveFeaturedCardPricingFields({
        price: '110.00',
        base_price: '100.00',
        markup_amount: '10.00',
      }),
    ).toEqual({
      price: '110.00',
      base_price: '100.00',
      markup_price: 10,
    })
  })

  it('builds price breakdown from API fields', () => {
    expect(
      getCardPriceBreakdown({
        price: '300.00',
        base_price: '200.00',
        markup_price: '100.00',
        currency: 'GHS',
      }),
    ).toEqual({
      basePrice: 200,
      markupPrice: 100,
      totalPrice: 300,
      currency: 'GHS',
    })
  })

  it('resolves vendor name from catalog', () => {
    const vendors = [
      {
        vendor_id: 'v-1',
        business_name: 'Acme Stores',
      },
    ]
    expect(getVendorNameById(vendors, 'v-1')).toBe('Acme Stores')
  })

  it('formats terms PDF display names', () => {
    expect(formatTermDisplayName('terms-and-conditions.pdf', 0)).toBe('Terms & Conditions')
    expect(formatTermDisplayName('[ABEEKU DJOKOTO][CV].pdf', 0)).toContain('ABEEKU')
  })
})
