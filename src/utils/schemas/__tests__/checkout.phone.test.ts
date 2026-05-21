import { describe, expect, it } from 'vitest'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants/phone'
import { UserInfoSchema } from '../checkout'

describe('UserInfoSchema phone_number', () => {
  it('rejects dial-code-only phone numbers', () => {
    const result = UserInfoSchema.safeParse({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: '+233',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid phone numbers', () => {
    const result = UserInfoSchema.safeParse({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone_number: EXAMPLE_PHONE_E164,
    })
    expect(result.success).toBe(true)
  })
})
