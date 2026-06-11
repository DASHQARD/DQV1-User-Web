import { describe, expect, it } from 'vitest'
import {
  getCartRecipientDisplayLines,
  getRecipientsForCartUnit,
  isCartUnitAssigned,
} from '../cartRecipientUnits'

const dashGoRecipient = {
  recipient_id: '019e5a54-5763-7806-9db9-af102869ba76',
  email: 'djokotoabeeku619@gmail.com',
  amount: 20,
  quantity: 2,
}

describe('cartRecipientUnits', () => {
  it('treats a recipient with quantity 2 as covering both unit slots', () => {
    expect(isCartUnitAssigned([dashGoRecipient], 0)).toBe(true)
    expect(isCartUnitAssigned([dashGoRecipient], 1)).toBe(true)
    expect(isCartUnitAssigned([dashGoRecipient], 2)).toBe(false)
  })

  it('returns per-unit amount when recipient spans multiple units', () => {
    const unit0 = getRecipientsForCartUnit([dashGoRecipient], 0, 10)
    const unit1 = getRecipientsForCartUnit([dashGoRecipient], 1, 10)
    expect(unit0).toHaveLength(1)
    expect(unit1).toHaveLength(1)
    expect(unit0[0]?.email).toBe('djokotoabeeku619@gmail.com')
    expect(unit0[0]?.amount).toBe(10)
    expect(unit1[0]?.amount).toBe(10)
  })

  it('getCartRecipientDisplayLines prefers phone when email is missing', () => {
    expect(
      getCartRecipientDisplayLines({
        phone: '+233559617908',
      }),
    ).toEqual({ primary: '+233559617908' })
  })

  it('getCartRecipientDisplayLines avoids duplicating email on both lines', () => {
    expect(
      getCartRecipientDisplayLines({
        email: 'user@example.com',
        phone: '+233559611108',
      }),
    ).toEqual({
      primary: 'user@example.com',
      secondary: '+233559611108',
    })
  })

  it('maps separate recipients to separate unit indices', () => {
    const recipients = [
      { email: 'a@example.com', amount: 10, quantity: 1 },
      { email: 'b@example.com', amount: 10, quantity: 1 },
    ]
    expect(getRecipientsForCartUnit(recipients, 0)[0]?.email).toBe('a@example.com')
    expect(getRecipientsForCartUnit(recipients, 1)[0]?.email).toBe('b@example.com')
  })
})
