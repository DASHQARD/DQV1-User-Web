/** Shared public catalog query params (cards + vendors). */
export const PUBLIC_CATALOG_CARDS_QUERY = { limit: 50 } as const

/** Single vendors fetch for enrichment, filters, and browse pages. */
export const PUBLIC_VENDORS_QUERY = { limit: 100 } as const

export const PUBLIC_CATALOG_STALE_MS = 5 * 60 * 1000
