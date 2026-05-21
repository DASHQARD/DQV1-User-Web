import { describe, expect, it } from 'vitest'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants/phone'
import {
  getOptionalInternationalPhoneSchema,
  getRequiredInternationalPhoneSchema,
  isDialCodeOnlyPhone,
  isValidInternationalPhoneDigits,
} from '../shared'

describe('phone validation helpers', () => {
  it('rejects dial-code-only values', () => {
    expect(isDialCodeOnlyPhone('+233')).toBe(true)
    expect(isDialCodeOnlyPhone('+234')).toBe(true)
    expect(isValidInternationalPhoneDigits('+233')).toBe(false)
  })

  it('accepts complete Ghana mobile numbers', () => {
    expect(isValidInternationalPhoneDigits(EXAMPLE_PHONE_E164)).toBe(true)
    expect(isValidInternationalPhoneDigits('+233551234567')).toBe(true)
    expect(isValidInternationalPhoneDigits('0551234567')).toBe(true)
  })

  it('rejects incomplete subscriber numbers', () => {
    expect(isValidInternationalPhoneDigits('+2335596178')).toBe(false)
    expect(isValidInternationalPhoneDigits('+23355')).toBe(false)
    expect(isValidInternationalPhoneDigits('55123')).toBe(false)
    expect(isValidInternationalPhoneDigits('')).toBe(false)
  })

  it('getRequiredInternationalPhoneSchema rejects incomplete numbers', () => {
    const schema = getRequiredInternationalPhoneSchema('Phone')
    expect(schema.safeParse('+233').success).toBe(false)
    expect(schema.safeParse('+2335596178').success).toBe(false)
    expect(schema.safeParse(EXAMPLE_PHONE_E164).success).toBe(true)
  })

  it('CreateAccountSchema rejects sign-up style partial Ghana numbers', async () => {
    const { CreateAccountSchema } = await import('../auth/auth')
    const result = CreateAccountSchema.safeParse({
      email: 'user@example.com',
      password: 'Test123!',
      phone_number: '+2335596178',
      user_type: 'user',
      country: 'Ghana',
      country_code: '01',
    })
    expect(result.success).toBe(false)
  })

  it('getOptionalInternationalPhoneSchema allows empty and dial-code-only', () => {
    const schema = getOptionalInternationalPhoneSchema()
    expect(schema.safeParse(undefined).success).toBe(true)
    expect(schema.safeParse('').success).toBe(true)
    expect(schema.safeParse('+233').success).toBe(true)
    expect(schema.safeParse(EXAMPLE_PHONE_E164).success).toBe(true)
  })

  it('getOptionalInternationalPhoneSchema rejects incomplete subscriber numbers', () => {
    const schema = getOptionalInternationalPhoneSchema()
    expect(schema.safeParse('+2335596178').success).toBe(false)
  })
})
