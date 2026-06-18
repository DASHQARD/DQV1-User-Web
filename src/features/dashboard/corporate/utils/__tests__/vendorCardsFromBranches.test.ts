import { describe, expect, it } from 'vitest'
import {
  getVendorCardsFromBranches,
  resolveFeaturedEntityId,
  vendorCatalogCardToFeaturedCardProps,
} from '../vendorCardsFromBranches'

describe('getVendorCardsFromBranches', () => {
  it('flattens cards from branches_with_cards and skips DashGo/DashPro', () => {
    const cards = getVendorCardsFromBranches({
      vendor_id: 'v1',
      business_name: 'adele business',
      branches_with_cards: [
        {
          branch_id: 'b1',
          branch_name: 'Main',
          cards: [
            {
              card_id: 'c1',
              card_name: 'adele foods',
              card_type: 'DashPass',
              card_price: 110,
              currency: 'GHS',
              card_status: 'active',
            },
            {
              card_id: 'c2',
              card_type: 'DashGo',
              card_price: 50,
              card_status: 'active',
            },
          ],
        },
      ],
    })

    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      card_id: 'c1',
      product: 'adele foods',
      type: 'DashPass',
      price: '110',
      vendor_name: 'adele business',
    })
  })

  it('includes vendor_cards when branches have empty card arrays', () => {
    const cards = getVendorCardsFromBranches(
      {
        vendor_id: 'v1',
        business_name: 'Serge',
        branches_with_cards: [{ branch_id: 'b1', branch_name: 'Main', cards: [] }],
        vendor_cards: [
          {
            card_id: 'c10',
            card_name: 'Elevate Card',
            card_type: 'DashX',
            card_price: 22,
            card_status: 'active',
          },
        ],
      },
      { excludeCardTypes: ['dashgo'], activeOnly: false },
    )

    expect(cards).toHaveLength(1)
    expect(cards[0].product).toBe('Elevate Card')
  })

  it('deduplicates cards present in both branches and vendor_cards', () => {
    const cards = getVendorCardsFromBranches({
      vendor_id: 'v1',
      business_name: 'Vendor',
      branches_with_cards: [
        {
          branch_id: 'b1',
          cards: [{ card_id: 'c1', card_name: 'Same', card_type: 'dashx', card_status: 'active' }],
        },
      ],
      vendor_cards: [
        { card_id: 'c1', card_name: 'Same', card_type: 'dashx', card_status: 'active' },
      ],
    })

    expect(cards).toHaveLength(1)
  })
})

describe('vendorCatalogCardToFeaturedCardProps', () => {
  it('preserves uuid card ids for navigation', () => {
    const props = vendorCatalogCardToFeaturedCardProps({
      card_id: '019e8cb0-9405-74a1-ab7b-e3c13b423a04',
      product: 'Unlimited Access Pass',
      vendor_name: 'Marvel Studios Animation',
      branch_name: 'Main',
      branch_location: 'Accra',
      description: '',
      price: '550',
      currency: 'GHS',
      expiry_date: '2099-12-31',
      status: 'active',
      rating: 0,
      created_at: '',
      updated_at: '',
      type: 'DashX',
      terms_and_conditions: [],
      images: [],
      vendor_id: '019eda1c-8534-7415-a56e-a679e7e78178',
    })

    expect(props.card_id).toBe('019e8cb0-9405-74a1-ab7b-e3c13b423a04')
    expect(props.vendor_id).toBe('019eda1c-8534-7415-a56e-a679e7e78178')
  })

  it('keeps numeric ids as numbers', () => {
    expect(resolveFeaturedEntityId('42')).toBe(42)
  })
})
