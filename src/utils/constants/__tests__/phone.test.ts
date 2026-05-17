import { describe, expect, it } from 'vitest'
import {
  EXAMPLE_PHONE_E164,
  EXAMPLE_PHONE_LOCAL,
  EXAMPLE_PHONE_PLACEHOLDER,
  examplePhoneE164AtIndex,
} from '../phone'

describe('phone constants', () => {
  it('uses canonical Ghana example from product UI', () => {
    expect(EXAMPLE_PHONE_LOCAL).toBe('5512345678')
    expect(EXAMPLE_PHONE_E164).toBe('+2335512345678')
    expect(EXAMPLE_PHONE_PLACEHOLDER).toContain(EXAMPLE_PHONE_LOCAL)
  })

  it('examplePhoneE164AtIndex increments local number', () => {
    expect(examplePhoneE164AtIndex(0)).toBe('+2335512345678')
    expect(examplePhoneE164AtIndex(1)).toBe('+2335512345679')
  })
})
