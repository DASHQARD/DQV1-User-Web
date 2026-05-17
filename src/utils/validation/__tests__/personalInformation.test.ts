import { describe, expect, it } from 'vitest'

import { PersonalInformationSchema } from '@/utils/schemas/settings'

import {
  isValidGhanaCardNumber,
  isValidStreetAddress,
} from '../personalInformation'

describe('personalInformation validation', () => {
  describe('isValidStreetAddress', () => {
    it('rejects placeholder values', () => {
      expect(isValidStreetAddress('street')).toBe(false)
      expect(isValidStreetAddress('address')).toBe(false)
    })

    it('accepts complete addresses', () => {
      expect(isValidStreetAddress('12 Independence Avenue')).toBe(true)
      expect(isValidStreetAddress('House 4 Ring Road')).toBe(true)
    })
  })

  describe('isValidGhanaCardNumber', () => {
    it('accepts standard Ghana Card formats', () => {
      expect(isValidGhanaCardNumber('GHA-123456789-0')).toBe(true)
      expect(isValidGhanaCardNumber('GHA1234567890')).toBe(true)
    })

    it('rejects invalid numbers', () => {
      expect(isValidGhanaCardNumber('id number')).toBe(false)
      expect(isValidGhanaCardNumber('GHA-123')).toBe(false)
    })
  })

  describe('PersonalInformationSchema', () => {
    const validPayload = {
      full_name: 'Amara Akwa',
      street_address: '12 Independence Avenue',
      dob: '2000-02-15',
      id_type: 'ghana_card',
      id_number: 'GHA-123456789-0',
    }

    it('accepts valid personal information', () => {
      expect(PersonalInformationSchema.safeParse(validPayload).success).toBe(true)
    })

    it('rejects invalid street address and id number', () => {
      const result = PersonalInformationSchema.safeParse({
        ...validPayload,
        street_address: 'street',
        id_number: 'id number',
      })
      expect(result.success).toBe(false)
      if (result.success) return
      const paths = result.error.issues.map((issue) => issue.path[0])
      expect(paths).toContain('street_address')
      expect(paths).toContain('id_number')
    })

    it('rejects single-word full names', () => {
      const result = PersonalInformationSchema.safeParse({
        ...validPayload,
        full_name: 'Amara',
      })
      expect(result.success).toBe(false)
    })
  })
})
