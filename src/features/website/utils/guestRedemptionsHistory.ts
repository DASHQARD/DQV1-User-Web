/** Row from GET /guest-redemptions → data.data[] */
export type GuestRedemptionHistoryItem = {
  redemption_id?: string
  source?: 'guest' | 'user' | string
  transaction_reference?: string
  redemption_date?: string
  redemption_method?: string
  amount?: string | number
  status?: string
  recipient_id?: string
  redemption_code?: string | null
  guest_phone?: string
  card_type?: string
  product?: string
  card_id?: string
  branch_id?: string | null
  branch_name?: string | null
  branch_location?: string | null
  vendor_name?: string | null
}

export type GuestRedemptionsPagination = {
  limit?: number
  after?: string | null
  hasMore?: boolean
}

export type GuestRedemptionsListResult = {
  items: GuestRedemptionHistoryItem[]
  pagination: GuestRedemptionsPagination
}

/**
 * Unwrap GET /guest-redemptions list (paginated).
 * API shape: { data: { data: [...], limit, after, hasMore } } inside standard envelope.
 */
export function parseGuestRedemptionsResponse(response: unknown): GuestRedemptionsListResult {
  const empty: GuestRedemptionsListResult = {
    items: [],
    pagination: {},
  }

  if (!response) return empty

  if (Array.isArray(response)) {
    return { items: response as GuestRedemptionHistoryItem[], pagination: {} }
  }

  const root = response as Record<string, unknown>

  // Paginated payload may live at root or under .data (envelope)
  const payload =
    Array.isArray(root.data) || root.hasMore != null || root.limit != null
      ? root
      : (root.data as Record<string, unknown> | undefined)

  if (!payload || typeof payload !== 'object') return empty

  const itemsRaw = payload.data
  const items = Array.isArray(itemsRaw) ? (itemsRaw as GuestRedemptionHistoryItem[]) : []

  return {
    items,
    pagination: {
      limit: typeof payload.limit === 'number' ? payload.limit : undefined,
      after: typeof payload.after === 'string' ? payload.after : payload.after === null ? null : undefined,
      hasMore: typeof payload.hasMore === 'boolean' ? payload.hasMore : undefined,
    },
  }
}

export function formatRedemptionStatusLabel(status?: string): string {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

export function redemptionStatusTone(
  status?: string,
): 'success' | 'failed' | 'pending' | 'neutral' {
  const normalized = String(status ?? '').toLowerCase()
  if (normalized === 'success' || normalized === 'successful') return 'success'
  if (normalized === 'failed' || normalized === 'rejected') return 'failed'
  if (normalized === 'pending' || normalized === 'processing') return 'pending'
  return 'neutral'
}
