import { describe, expect, it } from 'vitest'
import {
  extractGiftCardIdFromGuestCreate,
  extractGuestCreateCartMeta,
  unwrapPostResponsePayload,
} from '../cards'

const guestDashGoSuccessBody = {
  status: 'success',
  statusCode: 201,
  message: 'DashGo card created successfully for guest',
  data: {
    guest_card: {
      id: '019e4812-eb7f-7ccc-8149-ba26137583d4',
      gift_card_id: '019e4812-eb6f-73fe-b0e6-33e7a102bff8',
      guest_phone: '+233506803532',
      guest_name: 'Larry Djokoto',
      guest_email: 'djokotoabeeku101@yahoo.com',
      card_type: 'DashGo',
      amount: '300.00',
      status: 'pending',
    },
    gift_card: {
      id: '019e4812-eb6f-73fe-b0e6-33e7a102bff8',
      card_id: 'G-2064-01-01-000003',
      product: 'DashGo Gift Card',
      type: 'DashGo',
      price: '300.00',
      currency: 'GHS',
    },
    cart: {
      cart_id: '019e47f2-97bf-734d-af5e-85ff78eb99f6',
      cart_item_id: '019e4812-eb95-71cd-9ff9-709183517db8',
      total_quantity: 1,
      total_amount: '300.00',
    },
  },
}

describe('guest card create response parsing (DashGo / DashPro)', () => {
  it('unwraps axios + API envelope to inner data', () => {
    const payload = unwrapPostResponsePayload({ data: guestDashGoSuccessBody })
    expect(payload?.gift_card).toBeDefined()
    expect(payload?.cart).toBeDefined()
  })

  it('extracts gift card id for add-card / assign flows', () => {
    const axiosLike = { data: guestDashGoSuccessBody }
    expect(extractGiftCardIdFromGuestCreate(axiosLike)).toBe(
      '019e4812-eb6f-73fe-b0e6-33e7a102bff8',
    )
  })

  it('extracts cart_id and cart_item_id when create already added to cart', () => {
    const axiosLike = { data: guestDashGoSuccessBody }
    expect(extractGuestCreateCartMeta(axiosLike)).toEqual({
      cartId: '019e47f2-97bf-734d-af5e-85ff78eb99f6',
      cartItemId: '019e4812-eb95-71cd-9ff9-709183517db8',
    })
  })
})
