import {
  GIFT_CARD_AMOUNT_MAX,
  GIFT_CARD_AMOUNT_MIN,
} from '@/utils/giftCardAmount'
import type { LocalGuestCartLine } from '@/stores/guestLocalCart'

/** Max single-card amount for guest checkout (per product FAQ). */
export const GUEST_CHECKOUT_MAX_CARD_AMOUNT = 1000

/** Minimum for custom DashPro/DashGo at guest checkout (stricter than generic GHS 1 min). */
export const GUEST_CUSTOM_CARD_MIN_AMOUNT = 50

export type GuestLocalCartValidationIssue = {
  lineId: string
  product: string
  message: string
}

export type GuestLocalCartValidationResult = {
  valid: boolean
  issues: GuestLocalCartValidationIssue[]
}

function lineProductLabel(line: LocalGuestCartLine): string {
  if (line.lineKind === 'dashpro') return 'DashPro'
  if (line.lineKind === 'dashgo') return line.product || 'DashGo'
  return line.product || `Card #${line.card_id}`
}

function validateLinePrice(line: LocalGuestCartLine): string | null {
  const price = line.price
  if (!Number.isFinite(price)) {
    return 'Enter a valid amount for this gift card.'
  }
  const isCustom = line.lineKind === 'dashpro' || line.lineKind === 'dashgo'
  const minAmount = isCustom ? GUEST_CUSTOM_CARD_MIN_AMOUNT : GIFT_CARD_AMOUNT_MIN
  if (price < minAmount) {
    return `Minimum amount is GHS ${minAmount.toLocaleString('en-GH')}.`
  }
  if (price > GIFT_CARD_AMOUNT_MAX) {
    return `Maximum amount is GHS ${GIFT_CARD_AMOUNT_MAX.toLocaleString('en-GH')}.`
  }
  if (price > GUEST_CHECKOUT_MAX_CARD_AMOUNT) {
    return `Guest purchases are limited to GHS ${GUEST_CHECKOUT_MAX_CARD_AMOUNT.toLocaleString('en-GH')} per card.`
  }
  return null
}

/** Client-side checks before OTP / server sync at guest checkout. */
export function validateGuestLocalCartForCheckout(
  lines: LocalGuestCartLine[],
): GuestLocalCartValidationResult {
  const issues: GuestLocalCartValidationIssue[] = []

  for (const line of lines) {
    const product = lineProductLabel(line)
    const priceIssue = validateLinePrice(line)
    if (priceIssue) {
      issues.push({ lineId: line.lineId, product, message: priceIssue })
      continue
    }

    if (line.lineKind === 'dashgo') {
      if (!line.vendor_id?.trim()) {
        issues.push({
          lineId: line.lineId,
          product,
          message: 'DashGo is missing vendor details. Edit it in your bag.',
        })
      } else if (!line.redemption_branches?.length) {
        issues.push({
          lineId: line.lineId,
          product,
          message: 'DashGo is missing branch details. Edit it in your bag.',
        })
      }
    }
  }

  return { valid: issues.length === 0, issues }
}

export function formatGuestLocalCartValidationMessage(
  issues: GuestLocalCartValidationIssue[],
): string {
  if (issues.length === 0) return ''
  if (issues.length === 1) {
    return `${issues[0].product}: ${issues[0].message}`
  }
  return issues.map((i) => `${i.product}: ${i.message}`).join(' ')
}
