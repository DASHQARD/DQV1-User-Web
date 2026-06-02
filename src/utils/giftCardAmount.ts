import { z } from 'zod'

/** Min/max gift card amounts (GHS) used across DashGo / DashPro and vendor card flows. */
export const GIFT_CARD_AMOUNT_MIN = 1
export const GIFT_CARD_AMOUNT_MAX = 10_000

/** Zod schema for gift card / experience price fields. */
export const giftCardPriceSchema = z
  .number({ message: 'Amount must be a number' })
  .min(
    GIFT_CARD_AMOUNT_MIN,
    `Minimum amount is GHS ${GIFT_CARD_AMOUNT_MIN.toLocaleString('en-GH')}`,
  )
  .max(
    GIFT_CARD_AMOUNT_MAX,
    `Maximum amount is GHS ${GIFT_CARD_AMOUNT_MAX.toLocaleString('en-GH')}`,
  )

function preprocessGiftCardPriceValue(val: unknown): unknown {
  if (val === '' || val === undefined || val === null) return undefined
  if (typeof val === 'number' && Number.isNaN(val)) return undefined
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed) return undefined
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return val
}

/** For react-hook-form number fields — treats empty / NaN as missing before min/max checks. */
export const giftCardPriceFieldSchema = z.preprocess(
  preprocessGiftCardPriceValue,
  giftCardPriceSchema,
) as z.ZodType<number>

/** Display value for number inputs (empty instead of a leading 0). */
export function toGiftCardPriceInputValue(value: unknown): string {
  if (value === '' || value === undefined || value === null) return ''
  if (typeof value === 'number') {
    if (Number.isNaN(value) || value === 0) return ''
    return String(value)
  }
  return ''
}

export function fromGiftCardPriceInputChange(raw: string): number | undefined {
  if (raw === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Parse amount input without scientific notation from oversized digit strings.
 */
export function parseGiftCardAmountInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '.') return null
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null

  const [intPart = '0'] = trimmed.split('.')
  // More than five integer digits cannot be a valid GHS gift card amount (max 10,000).
  if (intPart.length > 5) return null

  const num = Number(trimmed)
  if (!Number.isFinite(num)) return null
  return num
}

/** Clamp to allowed gift card range; non-finite values fall back to minimum. */
export function clampGiftCardAmount(amount: number): number {
  if (!Number.isFinite(amount)) return GIFT_CARD_AMOUNT_MIN
  const rounded = Math.round(amount * 100) / 100
  return Math.min(GIFT_CARD_AMOUNT_MAX, Math.max(GIFT_CARD_AMOUNT_MIN, rounded))
}

/**
 * Sanitize free-text amount input: strip invalid chars, limit decimals, cap at max.
 */
export function normalizeGiftCardAmountInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  let cleaned = trimmed.replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')
  if (dotIndex !== -1) {
    cleaned = cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '')
  }

  const [intPart = '', decPart] = cleaned.split('.')
  const limitedInt = intPart.slice(0, 5)
  let result = decPart !== undefined ? `${limitedInt}.${decPart.slice(0, 2)}` : limitedInt

  if (result.endsWith('.')) {
    result = result.slice(0, -1)
  }

  const parsed = parseGiftCardAmountInput(result)
  if (parsed !== null && parsed > GIFT_CARD_AMOUNT_MAX) {
    return String(GIFT_CARD_AMOUNT_MAX)
  }

  return result
}

/** Safe amount for card preview and API payloads. */
export function resolveGiftCardAmount(value: string): number {
  const parsed = parseGiftCardAmountInput(normalizeGiftCardAmountInput(value))
  if (parsed === null) return GIFT_CARD_AMOUNT_MIN
  return clampGiftCardAmount(parsed)
}

/** Formatted amount for card preview (always within min/max, 2 decimal places). */
export function formatGiftCardAmountPreview(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '.') return '0.00'

  const normalized = normalizeGiftCardAmountInput(value)
  const parsed = parseGiftCardAmountInput(normalized)
  const amount = parsed !== null ? clampGiftCardAmount(parsed) : GIFT_CARD_AMOUNT_MIN

  return amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function isGiftCardAmountSubmittable(value: string): boolean {
  const parsed = parseGiftCardAmountInput(normalizeGiftCardAmountInput(value))
  return parsed !== null && parsed >= GIFT_CARD_AMOUNT_MIN && parsed <= GIFT_CARD_AMOUNT_MAX
}

export function getGiftCardAmountValidationMessage(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = normalizeGiftCardAmountInput(value)
  const parsed = parseGiftCardAmountInput(normalized)

  if (parsed === null) {
    return 'Enter a valid amount (up to 2 decimal places)'
  }
  if (parsed < GIFT_CARD_AMOUNT_MIN) {
    return `Minimum amount is GHS ${GIFT_CARD_AMOUNT_MIN}`
  }
  if (parsed > GIFT_CARD_AMOUNT_MAX) {
    return `Maximum amount is GHS ${GIFT_CARD_AMOUNT_MAX.toLocaleString('en-GH')}`
  }
  return null
}

export function giftCardAmountRangeHint(currency = 'GHS'): string {
  return `${currency} ${GIFT_CARD_AMOUNT_MIN.toLocaleString('en-GH')} – ${GIFT_CARD_AMOUNT_MAX.toLocaleString('en-GH')}`
}
