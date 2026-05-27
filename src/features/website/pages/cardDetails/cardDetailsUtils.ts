import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { normalizePublicVendorsResponse } from '@/features/website/utils/mapPublicVendorsForFilter'
import type { CardPriceBreakdown } from '@/features/website/types/cardDetails'

export type { CardPriceBreakdown }

export function parseCardPrice(value: unknown): number | null {
  const parsed = parseFloat(String(value ?? ''))
  if (Number.isNaN(parsed) || parsed < 0) return null
  return parsed
}

export function getCardPriceBreakdown(card: {
  price?: unknown
  base_price?: unknown
  markup_price?: unknown
  currency?: string
}): CardPriceBreakdown | null {
  const totalPrice = parseCardPrice(card.price)
  const basePrice = parseCardPrice(card.base_price)
  const markupPrice = parseCardPrice(card.markup_price)
  if (totalPrice == null || basePrice == null || markupPrice == null) return null
  if (basePrice <= 0 && markupPrice <= 0) return null
  return {
    basePrice,
    markupPrice,
    totalPrice,
    currency: card.currency || 'GHS',
  }
}

export function getVendorNameById(
  vendorsResponse: unknown,
  vendorId: string | number | undefined,
): string | null {
  if (vendorId == null || vendorId === '') return null
  const id = String(vendorId)
  const vendor = normalizePublicVendorsResponse(vendorsResponse).find(
    (v) => String(v.vendor_id ?? v.id) === id,
  )
  if (!vendor) return null
  return vendor.business_name || vendor.vendor_name || vendor.branch_name || null
}

export function formatTermDisplayName(fileName: string, index: number): string {
  const trimmed = fileName.trim()
  if (!trimmed) return `Document ${index + 1}`
  const withoutExt = trimmed.replace(/\.pdf$/i, '').trim()
  const lower = withoutExt.toLowerCase()
  if (lower.includes('terms') || lower.includes('condition')) {
    return index === 0 ? 'Terms & Conditions' : `Terms & Conditions (${index + 1})`
  }
  const cleaned = withoutExt.replace(/[[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleaned.length > 48) return `${cleaned.slice(0, 45)}…`
  return formatCardDisplayTitle(cleaned) || `Document ${index + 1}`
}

export function getCardTypeAccent(type: string | undefined): {
  badgeClass: string
  ringClass: string
} {
  const normalized = type?.toLowerCase()?.trim()
  switch (normalized) {
    case 'dashpass':
      return {
        badgeClass: 'bg-primary-600 text-white',
        ringClass: 'ring-primary-500',
      }
    case 'dashpro':
      return {
        badgeClass: 'bg-amber-600 text-white',
        ringClass: 'ring-amber-500',
      }
    case 'dashgo':
      return {
        badgeClass: 'bg-emerald-600 text-white',
        ringClass: 'ring-emerald-500',
      }
    case 'dashx':
    default:
      return {
        badgeClass: 'bg-violet-600 text-white',
        ringClass: 'ring-violet-500',
      }
  }
}

export const DESCRIPTION_COLLAPSE_THRESHOLD = 280

/** Panel chrome on md+; flat on mobile. */
export const CARD_DETAILS_PANEL =
  'max-md:border-0 max-md:p-0 max-md:shadow-none max-md:bg-transparent max-md:rounded-none rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm'
