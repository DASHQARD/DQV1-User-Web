import { describe, expect, it } from 'vitest'

import { buildVendorLogoMap, enrichCardsWithVendorLogos } from '../enrichCardsWithVendorLogos'

describe('enrichCardsWithVendorLogos', () => {
  const vendorsResponse = {
    data: [
      {
        vendor_id: '019e4067-b322-7a3b-877d-18e9d61f60c1',
        logo: 'https://example.com/surge.png',
        logo_key: 'Variant5.png',
      },
    ],
  }

  it('maps vendor logos onto cards by vendor_id', () => {
    const cards = [
      {
        card_id: '019e409a-6d06-7b22-b38c-0900e8381593',
        vendor_id: '019e4067-b322-7a3b-877d-18e9d61f60c1',
        product: 'The Elevate Card',
      },
    ]
    const enriched = enrichCardsWithVendorLogos(cards, vendorsResponse)
    expect(enriched[0]?.logo).toBe('https://example.com/surge.png')
    expect(enriched[0]?.logo_key).toBe('Variant5.png')
  })

  it('buildVendorLogoMap keys by vendor_id string', () => {
    const map = buildVendorLogoMap(vendorsResponse)
    expect(map.get('019e4067-b322-7a3b-877d-18e9d61f60c1')?.logo).toBe('https://example.com/surge.png')
  })
})
