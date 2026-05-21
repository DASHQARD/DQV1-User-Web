import { describe, expect, it } from 'vitest'
import { getVendorCardsFromBranches } from '../vendorCardsFromBranches'

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
      vendor_cards: [{ card_id: 'c1', card_name: 'Same', card_type: 'dashx', card_status: 'active' }],
    })

    expect(cards).toHaveLength(1)
  })
})
