import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
import isEmail from 'validator/lib/isEmail'
import z from 'zod'

export const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address'

const emailValidatorOptions = {
  require_tld: true,
  allow_utf8_local_part: false,
  allow_ip_domains: false,
}

/**
 * Validates mailbox addresses (requires a TLD, e.g. rejects user@example).
 */
export function isValidEmailAddress(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  return isEmail(trimmed, emailValidatorOptions)
}

export function getOptionalStringSchema() {
  return z.string().optional().nullable()
}

export function getRequiredStringSchema(label: string = 'Field', message?: string) {
  return z
    .string()
    .trim()
    .min(1, message || `${label} is required`)
}
export function getRequiredNumberSchema(label: string = 'Field') {
  return z.number().min(1, `${label} is required`)
}

export function getRequiredEmailSchema(label: string = 'Email') {
  return getRequiredStringSchema(label).refine(
    (val) => isValidEmailAddress(val),
    INVALID_EMAIL_MESSAGE,
  )
}

/** Optional email — validates format only when a value is entered. */
export function getOptionalEmailSchema() {
  return z
    .string()
    .optional()
    .refine((val) => {
      const trimmed = val?.trim() ?? ''
      if (!trimmed) return true
      return isValidEmailAddress(trimmed)
    }, INVALID_EMAIL_MESSAGE)
}

export function getRequiredAlphaNumericStringSchema(label: string = 'Field') {
  return z
    .string()
    .min(8, { message: `${label} must be at least 8 characters long.` })
    .refine((val) => /\d/.test(val), {
      message: `${label} must include at least one number.`,
    })
    .refine((val) => /[a-zA-Z]/.test(val), {
      message: `${label} must include at least one letter.`,
    })
    .refine((val) => /[!@#$%^&*]/.test(val), {
      message: `${label} must contain at least one symbol.`,
    })
}

export function getRequiredOTPSchema(label: string = 'OTP') {
  return z.string().min(6, `${label} must be 6 digits`)
}

export const INVALID_PHONE_MESSAGE = 'Please enter a valid phone number'

/** Country dial codes only (e.g. +233 with no subscriber digits). */
export function isDialCodeOnlyPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length > 0 && digits.length <= 4
}

/**
 * Validates phone strings from BasePhoneInput / E.164 values using libphonenumber-js.
 * Rejects dial-code-only values and incomplete national numbers (e.g. +233 + 7 digits).
 */
export function isValidInternationalPhoneDigits(
  value: string,
  defaultCountry: CountryCode = 'GH',
): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (isDialCodeOnlyPhone(trimmed)) return false

  const parsed = trimmed.startsWith('+')
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, defaultCountry)

  return parsed?.isValid() === true
}

export function getRequiredInternationalPhoneSchema(label: string = 'Phone number') {
  return z.string().superRefine((val, ctx) => {
    const trimmed = val.trim()
    if (!trimmed || isDialCodeOnlyPhone(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} is required`,
      })
      return
    }
    if (!isValidInternationalPhoneDigits(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVALID_PHONE_MESSAGE,
      })
    }
  })
}

export function getOptionalInternationalPhoneSchema() {
  return z
    .string()
    .optional()
    .refine((val) => {
      const trimmed = val?.trim() ?? ''
      if (!trimmed || isDialCodeOnlyPhone(trimmed)) return true
      return isValidInternationalPhoneDigits(trimmed)
    }, INVALID_PHONE_MESSAGE)
}

const nigerianPhoneRegex =
  /^(?:\+234|0)(?:070|080|081|090|091|70[1-9]|80[2-9]|81[0-9]|90[1-9]|91[0-2])\d{7}$/

export function getOptionalNigerianPhoneSchema() {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || nigerianPhoneRegex.test(val), 'Invalid Nigerian phone number format')
}

export function getFullNameSchema() {
  return z.string().refine(
    (value) => {
      const names = value.trim().split(/\s+/)
      return names.length >= 2 && names[0] && names[names.length - 1]
    },
    {
      message: 'Please provide both first name and last name.',
    },
  )
}

export function getValidNigerianPhoneNumber() {
  return z.string().regex(/^(\+?234|0)?[789]\d{9}$/, { message: 'Invalid phone number' })
}

export const getDigitSchema = (field = 'Field', minLength = 1) => {
  return z.string().refine((val) => /^\d+$/.test(val) && val.length >= minLength, {
    message: `The ${field} must be at least ${minLength} digits long`,
  })
}

export const freezeWalletSchema = z.object({
  frozen: z.boolean(),
  reason: getRequiredStringSchema('Reason'),
})
export const dailyLimitSchema = z.object({
  approved: z.boolean(),
  reason: getRequiredStringSchema('Reason'),
})

export const toggleCustomerStatusSchema = z.object({
  status: getRequiredStringSchema('Status'),
  reason: getRequiredStringSchema('Reason'),
})
export const deleteCustomerSchema = z.object({
  reason: getRequiredStringSchema('Reason'),
})
export const deleteAgentSchema = z.object({
  reason: getRequiredStringSchema('Reason'),
})
