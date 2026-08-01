import { describe, expect, it } from 'vitest'
import { EditUserProfileSchema } from '@/utils/schemas/settings'

describe('EditUserProfileSchema', () => {
  it('accepts a valid edit-profile payload', () => {
    const result = EditUserProfileSchema.safeParse({
      full_name: 'Yaa Mensah',
      phone_number: '+233241234567',
      street_address: '12 East Legon Ave',
      dob: '1995-06-12',
      id_type: 'ghana_card',
      id_number: 'GHA-123456789-0',
    })

    expect(result.success).toBe(true)
  })

  it('ignores email when present in input', () => {
    const result = EditUserProfileSchema.safeParse({
      full_name: 'Yaa Mensah',
      phone_number: '+233241234567',
      street_address: '12 East Legon Ave',
      dob: '1995-06-12',
      id_type: 'ghana_card',
      id_number: 'GHA-123456789-0',
      email: 'yaa.new@example.com',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('email')
    }
  })
})
