import { roundRedemptionAmount } from '@/features/website/utils/guestRedemption'
import type { CardsRedemptionPayload, UserRedemptionCardsPayload } from '@/types/redemptions'

import type { VendorSearchResult } from '@/types/redemptions'

/** GVID format per redemption API (e.g. GH-0001) */
export const GVID_PATTERN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

export function isFullGvidInput(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 3 && GVID_PATTERN.test(trimmed)
}

/**
 * Use GET /search/vendors/:gvid only for complete vendor GVIDs (e.g. GH-0001).
 * Numeric fragments like "4158-01" should use ?search= instead (partial GVID/name).
 */
export function isExactGvidPathLookup(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= 4 && /^[A-Za-z]{2,}-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(trimmed)
}

export function extractVendorSearchRows(
  response: { data?: VendorSearchResult[] } | null | undefined,
): VendorSearchResult[] {
  const rows = response?.data
  return Array.isArray(rows) ? rows : []
}

/** Prefer exact-path results; fall back to partial ?search= when exact returns []. */
export function mergeVendorSearchResults(
  partial: VendorSearchResult[],
  exact: VendorSearchResult[],
  usedExactPath: boolean,
): VendorSearchResult[] {
  if (!usedExactPath) return partial
  if (exact.length > 0) return exact
  return partial
}

export function findVendorSearchMatch(
  term: string,
  results: VendorSearchResult[],
): VendorSearchResult | null {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return null

  return (
    results.find((row) => {
      if (row.gvid?.toLowerCase() === normalized) return true
      if (String(row.vendor_id ?? '').toLowerCase() === normalized) return true
      if (String(row.id ?? '').toLowerCase() === normalized) return true
      return (row.branches ?? []).some(
        (branch) =>
          branch.full_branch_id?.toLowerCase() === normalized ||
          branch.branch_code?.toLowerCase() === normalized ||
          branch.id?.toLowerCase() === normalized,
      )
    }) ?? null
  )
}

export function isRedemptionApiSuccess(
  response: { status?: string; statusCode?: number } | null | undefined,
): boolean {
  if (!response) return false
  if (response.status === 'success') return true
  const code = response.statusCode
  return code === 200 || code === 201 || code === 202
}

type BuildCardsRedemptionInput =
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashGo' | 'DashPro'
      amount: number
      phone_number?: string
    }
  | {
      branch_id: string
      vendor_gvid: string
      card_type: 'DashX' | 'DashPass'
      card_id: string
      phone_number?: string
    }

/** POST /redemptions/cards or /redemptions/users/cards — Method A */
export function buildCardsRedemptionPayload(
  input: BuildCardsRedemptionInput,
): CardsRedemptionPayload | UserRedemptionCardsPayload {
  const branch_id = input.branch_id.trim()
  const vendor_gvid = input.vendor_gvid.trim()

  if (input.card_type === 'DashGo' || input.card_type === 'DashPro') {
    const base = {
      branch_id,
      vendor_gvid,
      card_type: input.card_type,
      amount: roundRedemptionAmount(input.amount),
    }
    return input.phone_number
      ? { ...base, phone_number: input.phone_number }
      : base
  }

  const cardInput = input as Extract<
    BuildCardsRedemptionInput,
    { card_type: 'DashX' | 'DashPass' }
  >
  const base = {
    branch_id,
    vendor_gvid,
    card_type: cardInput.card_type,
    card_id: cardInput.card_id.trim(),
  }
  return cardInput.phone_number ? { ...base, phone_number: cardInput.phone_number } : base
}

export function redeemableCardTypeToUi(
  cardType: string,
): 'dashpro' | 'dashgo' | 'dashx' | 'dashpass' | null {
  const normalized = cardType.toLowerCase()
  if (normalized === 'dashpro') return 'dashpro'
  if (normalized === 'dashgo') return 'dashgo'
  if (normalized === 'dashx') return 'dashx'
  if (normalized === 'dashpass') return 'dashpass'
  return null
}
