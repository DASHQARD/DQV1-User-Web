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
})
