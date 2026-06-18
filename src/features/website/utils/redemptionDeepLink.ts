import { ROUTES } from '@/utils/constants'

export type RedemptionMethodParam = 'vendor_id' | 'vendor_mobile_money'

export type RedemptionDeepLinkParams = {
  method?: RedemptionMethodParam
  card_type?: string
  vendor_gvid?: string
  vendor_id?: string
  branch_id?: string
  card_id?: string
}

export function buildRedemptionUrl(params: RedemptionDeepLinkParams): string {
  const search = new URLSearchParams()
  if (params.method) search.set('method', params.method)
  if (params.card_type) search.set('card_type', params.card_type.toLowerCase())
  if (params.vendor_gvid) search.set('vendor_gvid', params.vendor_gvid)
  if (params.vendor_id) search.set('vendor_id', String(params.vendor_id))
  if (params.branch_id) search.set('branch_id', String(params.branch_id))
  if (params.card_id) search.set('card_id', String(params.card_id))
  const query = search.toString()
  return query ? `${ROUTES.IN_APP.REDEEM}?${query}` : ROUTES.IN_APP.REDEEM
}

export function parseRedemptionSearchParams(
  searchParams: URLSearchParams,
): RedemptionDeepLinkParams {
  const methodParam = searchParams.get('method')
  const vendor_gvid =
    searchParams.get('vendor_gvid')?.trim() || searchParams.get('gvid')?.trim() || undefined
  const vendor_id = searchParams.get('vendor_id')?.trim() || undefined
  const resolvedMethod =
    methodParam === 'vendor_id' || methodParam === 'vendor_mobile_money'
      ? methodParam
      : vendor_gvid || vendor_id
        ? 'vendor_id'
        : undefined

  return {
    method: resolvedMethod,
    card_type: searchParams.get('card_type') ?? undefined,
    vendor_gvid,
    vendor_id,
    branch_id: searchParams.get('branch_id') ?? undefined,
    card_id: searchParams.get('card_id') ?? undefined,
  }
}

/**
 * Bare vendor QR landing (`/redeem?gvid=…`) with no card/method deep-link params.
 * User should choose purchase vs redeem before auto-entering redemption details.
 */
export function isVendorQrScanEntry(searchParams: URLSearchParams): boolean {
  const hasGvid = Boolean(
    searchParams.get('gvid')?.trim() || searchParams.get('vendor_gvid')?.trim(),
  )
  if (!hasGvid) return false

  if (searchParams.get('method')) return false
  if (searchParams.get('card_type')) return false
  if (searchParams.get('card_id')) return false
  if (searchParams.get('branch_id')) return false

  return true
}

/** Branch is required when the vendor has one or more branches. */
export function vendorIdFlowRequiresBranch(
  branchCount: number,
  selectedBranchId: string | null,
): boolean {
  return branchCount > 0 && selectedBranchId === null
}

/** Deep link from My Cards / corporate card details into redemption. */
export function buildRedemptionUrlFromCard(card: {
  card_type: string
  vendor_id?: string | number
  branch_id?: string | number
  card_id?: string | number
  gvid?: string
}): string {
  const cardType = card.card_type?.toLowerCase()

  if (cardType === 'dashpro') {
    return buildRedemptionUrl({
      method: 'vendor_mobile_money',
      card_type: 'dashpro',
    })
  }

  const includeCardId =
    card.card_id != null &&
    (cardType === 'dashx' || cardType === 'dashpass' || cardType === 'dashgo')
  return buildRedemptionUrl({
    method: 'vendor_id',
    card_type: cardType,
    vendor_id: card.vendor_id != null ? String(card.vendor_id) : undefined,
    vendor_gvid: card.gvid,
    branch_id: card.branch_id != null ? String(card.branch_id) : undefined,
    card_id: includeCardId ? String(card.card_id) : undefined,
  })
}
