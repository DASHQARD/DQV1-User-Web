import { describe, expect, it } from 'vitest'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants/phone'
import {
  extractTawkPhone,
  getTawkPhoneValidationError,
  normalizeTawkPhoneInput,
  validateTawkFormSubmit,
} from '../tawkFormValidation'

describe('tawkFormValidation', () => {
  it('normalizes spaced country codes', () => {
    expect(normalizeTawkPhoneInput('+ 23355123')).toBe('+23355123')
  })

  it('rejects dial-code-only values with a clear message', () => {
    expect(getTawkPhoneValidationError('+233')).toMatch(/full mobile number/i)
    expect(getTawkPhoneValidationError('+ 233')).toMatch(/full mobile number/i)
  })

  it('rejects incomplete subscriber numbers', () => {
    expect(getTawkPhoneValidationError('+23355123')).toBeTruthy()
    expect(getTawkPhoneValidationError('+2335596178')).toBeTruthy()
  })

  it('accepts complete numbers and allows empty phone', () => {
    expect(getTawkPhoneValidationError('')).toBeNull()
    expect(getTawkPhoneValidationError(EXAMPLE_PHONE_E164)).toBeNull()
  })

  it('validateTawkFormSubmit normalizes phone on success', () => {
    const data = { phone: '+ 233551234567' }
    const result = validateTawkFormSubmit(data)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(data.phone).toBe('+233551234567')
    }
  })

  it('extractTawkPhone reads phone from questions fallback', () => {
    expect(
      extractTawkPhone({
        questions: [{ label: 'Phone', answer: '+233551234567' }],
      }),
    ).toBe('+233551234567')
  })
})
