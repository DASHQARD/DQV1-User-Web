import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  mapCatalogCardsToVendorCards,
  mapVendorRedemptionCatalogToPublicVendor,
  resolveVendorProfileCatalogGvid,
  findCatalogCardInCache,
  mapCatalogCardToDetailsCard,
} from '../vendorRedemptionCatalog'

const catalogFixture = {
  vendor: {
    vendor_id: 'v-1',
    vendor_name: 'Test Vendor',
    gvid: 'GH-0001',
    qr_code_url: 'https://app.dashqard.com/redeem?gvid=GH-0001',
    branches: [
      {
        id: 'branch-1',
        branch_name: 'Main',
        branch_location: 'Accra',
      },
    ],
  },
  cards: [
    {
      id: 'card-1',
      type: 'DashX',
      product: 'Lunch Voucher',
      description: 'Valid weekdays',
      amount: 50,
      currency: 'GHS',
      status: 'active',
      expiry_date: '2099-12-31',
      images: [{ file_url: 'https://cdn.example/card.png' }],
      redemption_branches: [
        { branch_id: 'branch-1', branch_name: 'Main', branch_location: 'Accra' },
      ],
    },
  ],
}

describe('vendorRedemptionCatalog', () => {
  it('maps catalog response to public vendor profile shape', () => {
    const vendor = mapVendorRedemptionCatalogToPublicVendor(catalogFixture)
    expect(vendor.vendor_id).toBe('v-1')
    expect(vendor.gvid).toBe('GH-0001')
    expect(vendor.qr_url).toContain('gvid=GH-0001')
    expect(vendor.branches_with_cards).toHaveLength(1)
    expect(vendor.branches_with_cards?.[0]?.cards).toHaveLength(1)
    expect(vendor.branches_with_cards?.[0]?.cards?.[0]?.product).toBe('Lunch Voucher')
  })

  it('maps catalog cards to redemption vendor cards', () => {
    const cards = mapCatalogCardsToVendorCards(catalogFixture.cards, catalogFixture.vendor)
    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      card_id: 'card-1',
      card_name: 'Lunch Voucher',
      card_type: 'dashx',
      branch_id: 'branch-1',
      gvid: 'GH-0001',
    })
  })

  it('resolveVendorProfileCatalogGvid prefers explicit gvid param', () => {
    const client = new QueryClient()
    expect(resolveVendorProfileCatalogGvid({ gvidParam: 'GH-0001' }, client)).toBe('GH-0001')
  })

  it('resolveVendorProfileCatalogGvid uses gvid without legacy vendor_id', () => {
    const client = new QueryClient()
    expect(resolveVendorProfileCatalogGvid({ gvidParam: '4158-01' }, client)).toBe('4158-01')
  })

  it('findCatalogCardInCache resolves card details from vendor catalog query cache', () => {
    const client = new QueryClient()
    client.setQueryData(['vendor-redemption-catalog', '4158-01', undefined], {
      data: catalogFixture,
    })

    const card = findCatalogCardInCache(client, 'card-1')
    expect(card).toMatchObject({
      card_id: 'card-1',
      product: 'Lunch Voucher',
      vendor_name: 'Test Vendor',
      gvid: 'GH-0001',
    })
    expect(mapCatalogCardToDetailsCard(catalogFixture.cards[0], catalogFixture.vendor)).toEqual(
      card,
    )
  })
})
