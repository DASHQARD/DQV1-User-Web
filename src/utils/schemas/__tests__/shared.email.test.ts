import { describe, expect, it } from 'vitest'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants'
import { CreateAccountSchema, ForgotPasswordSchema, LoginSchema } from '../auth/auth'
import { INVALID_EMAIL_MESSAGE, isValidEmailAddress } from '../shared'

describe('isValidEmailAddress', () => {
  it('accepts standard addresses with a TLD', () => {
    expect(isValidEmailAddress('codes.long@gmail.com')).toBe(true)
    expect(isValidEmailAddress('collins.ampofo@gmail.com')).toBe(true)
    expect(isValidEmailAddress('jane.doe+test@example.com')).toBe(true)
    expect(isValidEmailAddress('a_b-c@domain.co.uk')).toBe(true)
    expect(isValidEmailAddress('Rey.Bigham@HorizonPost.com')).toBe(true)
    expect(isValidEmailAddress('user-name+shop@mail.example.org')).toBe(true)
  })

  it('rejects addresses without a top-level domain', () => {
    expect(isValidEmailAddress('firstname.lastname@example')).toBe(false)
    expect(isValidEmailAddress('test@example')).toBe(false)
    expect(isValidEmailAddress('local@nodot')).toBe(false)
  })

  it('rejects empty or malformed addresses', () => {
    expect(isValidEmailAddress('')).toBe(false)
    expect(isValidEmailAddress('   ')).toBe(false)
    expect(isValidEmailAddress('nope')).toBe(false)
    expect(isValidEmailAddress('@nodomain.com')).toBe(false)
    expect(isValidEmailAddress('local@')).toBe(false)
  })
})

describe('auth schemas (login / register / forgot password)', () => {
  const validEmails = [
    'jane.doe+test@example.com',
    'codes.long@gmail.com',
    'collins.ampofo@gmail.com',
    'user_name-work+tag@mail.example.org',
  ]

  const invalidNoTld = 'firstname.lastname@example'

  it.each(validEmails)('LoginSchema accepts %s', (email) => {
    const result = LoginSchema.safeParse({ email, password: 'any' })
    expect(result.success).toBe(true)
  })

  it('LoginSchema rejects email without TLD', () => {
    const result = LoginSchema.safeParse({ email: invalidNoTld, password: 'any' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(INVALID_EMAIL_MESSAGE)
    }
  })

  it.each(validEmails)('ForgotPasswordSchema accepts %s', (email) => {
    const result = ForgotPasswordSchema.safeParse({ email })
    expect(result.success).toBe(true)
  })

  it('ForgotPasswordSchema rejects email without TLD', () => {
    const result = ForgotPasswordSchema.safeParse({ email: invalidNoTld })
    expect(result.success).toBe(false)
  })

  it.each(validEmails)('CreateAccountSchema accepts %s', (email) => {
    const result = CreateAccountSchema.safeParse({
      email,
      password: 'Test123!',
      phone_number: EXAMPLE_PHONE_E164,
      user_type: 'user' as const,
      country: 'Ghana',
      country_code: '+233',
    })
    expect(result.success).toBe(true)
  })

  it('CreateAccountSchema rejects email without TLD', () => {
    const result = CreateAccountSchema.safeParse({
      email: invalidNoTld,
      password: 'Test123!',
      phone_number: EXAMPLE_PHONE_E164,
      user_type: 'user' as const,
      country: 'Ghana',
      country_code: '+233',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === INVALID_EMAIL_MESSAGE)).toBe(true)
    }
  })
})
