import { describe, expect, it } from 'vitest'
import { CreateAccountSchema, ForgotPasswordSchema, LoginSchema } from '../auth/auth'
import { isValidEmailAddress } from '../shared'

describe('isValidEmailAddress', () => {
  it('accepts dots, underscores, hyphens, and plus in the local part', () => {
    expect(isValidEmailAddress('codes.long@gmail.com')).toBe(true)
    expect(isValidEmailAddress('jane.doe+test@example.com')).toBe(true)
    expect(isValidEmailAddress('a_b-c@domain.co.uk')).toBe(true)
    expect(isValidEmailAddress('+tag@example.com')).toBe(true)
    expect(isValidEmailAddress('_user@example.com')).toBe(true)
    expect(isValidEmailAddress('user-name+shop@mail.example.org')).toBe(true)
  })

  it('rejects empty or malformed addresses', () => {
    expect(isValidEmailAddress('')).toBe(false)
    expect(isValidEmailAddress('   ')).toBe(false)
    expect(isValidEmailAddress('nope')).toBe(false)
    expect(isValidEmailAddress('@nodomain.com')).toBe(false)
    expect(isValidEmailAddress('local@')).toBe(false)
    expect(isValidEmailAddress('local@nodot')).toBe(false)
  })
})

describe('auth schemas (login / register / forgot password)', () => {
  const emailsWithSpecialLocalPart = [
    'jane.doe+test@example.com',
    'codes.long@gmail.com',
    'user_name-work+tag@mail.example.org',
  ]

  it.each(emailsWithSpecialLocalPart)('LoginSchema accepts %s', (email) => {
    const result = LoginSchema.safeParse({ email, password: 'any' })
    expect(result.success).toBe(true)
  })

  it.each(emailsWithSpecialLocalPart)('ForgotPasswordSchema accepts %s', (email) => {
    const result = ForgotPasswordSchema.safeParse({ email })
    expect(result.success).toBe(true)
  })

  it.each(emailsWithSpecialLocalPart)('CreateAccountSchema accepts %s', (email) => {
    const result = CreateAccountSchema.safeParse({
      email,
      password: 'Test123!',
      phone_number: '5512345678',
      user_type: 'user' as const,
      country: 'Ghana',
      country_code: '+233',
    })
    expect(result.success).toBe(true)
  })
})
