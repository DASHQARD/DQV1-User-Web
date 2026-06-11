import {
  INVALID_PHONE_MESSAGE,
  isDialCodeOnlyPhone,
  isValidInternationalPhoneDigits,
} from '@/utils/schemas/shared'

export type TawkFormSubmitData = {
  name?: string
  email?: string
  phone?: string
  message?: string
  questions?: unknown
}

/** Tawk phone inputs sometimes include spaces (e.g. "+ 23355123"). */
export function normalizeTawkPhoneInput(value: string): string {
  return value.replace(/\s+/g, '').trim()
}

export function extractTawkPhone(data: TawkFormSubmitData | null | undefined): string {
  if (!data) return ''
  if (typeof data.phone === 'string' && data.phone.trim()) {
    return normalizeTawkPhoneInput(data.phone)
  }

  const questions = data.questions
  if (!Array.isArray(questions)) return ''

  for (const entry of questions) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const label = String(record.label ?? record.question ?? record.name ?? '').toLowerCase()
    const answer = record.answer ?? record.value ?? record.response
    if (label.includes('phone') && typeof answer === 'string' && answer.trim()) {
      return normalizeTawkPhoneInput(answer)
    }
  }

  return ''
}

/**
 * Validates an optional Tawk phone field:
 * - empty is allowed
 * - dial-code-only (e.g. +233) is rejected
 * - incomplete numbers are rejected
 */
export function getTawkPhoneValidationError(phone: string): string | null {
  const normalized = normalizeTawkPhoneInput(phone)
  if (!normalized) return null

  if (isDialCodeOnlyPhone(normalized)) {
    return 'Please enter your full mobile number after the country code (e.g. +233551234567).'
  }

  if (!isValidInternationalPhoneDigits(normalized)) {
    return INVALID_PHONE_MESSAGE
  }

  return null
}

export function validateTawkFormSubmit(
  data: TawkFormSubmitData,
): { ok: true; phone: string } | { ok: false; message: string } {
  const phone = extractTawkPhone(data)
  const error = getTawkPhoneValidationError(phone)
  if (error) {
    return { ok: false, message: error }
  }

  if (phone && typeof data.phone === 'string') {
    data.phone = phone
  }

  return { ok: true, phone }
}
