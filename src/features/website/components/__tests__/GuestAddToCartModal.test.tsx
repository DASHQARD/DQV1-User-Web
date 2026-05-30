import { describe, it, expect } from 'vitest'
import { guestAddToCartContactSchema } from '../GuestAddToCartModal/guestAddToCartContactSchema'

describe('guestAddToCartContactSchema', () => {
  it('requires only a valid phone number', () => {
    const result = guestAddToCartContactSchema.safeParse({
      guest_phone: '+233551234567',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty phone', () => {
    const result = guestAddToCartContactSchema.safeParse({ guest_phone: '' })
    expect(result.success).toBe(false)
  })
})
