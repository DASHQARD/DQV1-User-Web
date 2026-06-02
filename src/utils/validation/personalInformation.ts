import { z } from 'zod'

import { ID_TYPE_OPTIONS } from '@/utils/constants/idType'

export const ID_TYPE_VALUES = ID_TYPE_OPTIONS.map((option) => option.value)

const STREET_ADDRESS_PLACEHOLDERS = new Set([
  'street',
  'address',
  'test',
  'n/a',
  'na',
  'none',
  'unknown',
  'placeholder',
])

const ID_NUMBER_PLACEHOLDERS = new Set(['id number', 'id', 'number', 'n/a', 'na', 'none', 'test'])

/** Ghana Card: GHA-123456789-0 or GHA1234567890 */
const GHANA_CARD_REGEX = /^GHA-?\d{9}-?\d$/i

export function getAgeFromDateOfBirth(dobString: string): number | null {
  if (!dobString || typeof dobString !== 'string') return null
  const trimmed = dobString.trim()
  let birth: Date
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    birth = new Date(`${trimmed}T12:00:00`)
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [a, b, year] = trimmed.split('/').map(Number)
    const month = Math.min(a, b) - 1
    const day = Math.max(a, b)
    birth = new Date(year, month, day)
  } else {
    birth = new Date(trimmed)
  }
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function isValidDateOfBirth(dobString: string, minimumAge = 18): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobString.trim())) return false
  const age = getAgeFromDateOfBirth(dobString)
  return age !== null && age >= minimumAge
}

export function isValidStreetAddress(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 5) return false
  if (STREET_ADDRESS_PLACEHOLDERS.has(trimmed.toLowerCase())) return false
  if (!/[a-zA-Z]/.test(trimmed)) return false
  const words = trimmed.split(/\s+/).filter(Boolean)
  return words.length >= 2 || /\d/.test(trimmed)
}

export function normalizeGhanaCardNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidGhanaCardNumber(value: string): boolean {
  const normalized = normalizeGhanaCardNumber(value)
  return GHANA_CARD_REGEX.test(normalized)
}

export function isPlaceholderIdNumber(value: string): boolean {
  return ID_NUMBER_PLACEHOLDERS.has(value.trim().toLowerCase())
}

/** Corporate "National ID" uses Ghana Card number format (GHA-123456789-0). */
export function isValidNationalIdNumber(value: string): boolean {
  return isValidGhanaCardNumber(value)
}

export function isValidIdNumberForType(idType: string, idNumber: string): boolean {
  const trimmed = idNumber.trim()
  if (!trimmed || isPlaceholderIdNumber(trimmed)) return false

  if (idType === 'ghana_card' || idType === 'national_id') {
    return isValidGhanaCardNumber(trimmed)
  }

  return trimmed.length >= 4
}

export function validatePersonalInformationIdNumber(
  data: { id_type: string; id_number: string },
  ctx: z.RefinementCtx,
): void {
  const trimmed = data.id_number.trim()
  if (!trimmed) return

  if (isPlaceholderIdNumber(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid ID number',
      path: ['id_number'],
    })
    return
  }

  if (data.id_type === 'ghana_card' && !isValidGhanaCardNumber(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid Ghana Card number (e.g. GHA-123456789-0)',
      path: ['id_number'],
    })
    return
  }

  if (data.id_type === 'national_id' && !isValidGhanaCardNumber(trimmed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid National ID number (e.g. GHA-123456789-0)',
      path: ['id_number'],
    })
  }
}
