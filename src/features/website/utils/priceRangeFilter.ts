/** Allow empty or non-negative integer strings while the user is typing */
export function normalizePriceInput(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  if (!/^\d+$/.test(trimmed)) return undefined
  return trimmed
}

export function parsePriceValue(value?: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return Math.max(0, parsed)
}

/** True when both bounds are set and minimum exceeds maximum. */
export function isInvertedPriceRange(minRaw?: string, maxRaw?: string): boolean {
  const min = parsePriceValue(minRaw)
  const max = parsePriceValue(maxRaw)
  return min !== null && max !== null && min > max
}

export function getPriceRangeValidationError(minRaw?: string, maxRaw?: string): string | null {
  if (!isInvertedPriceRange(minRaw, maxRaw)) return null
  return 'Maximum must be greater than or equal to minimum'
}

/** Omit max_price from API params when the range is inverted (avoids 422 from /cards-info). */
export function applyApiSafePriceRange<T extends { min_price?: string; max_price?: string }>(
  query: T,
): T {
  if (!isInvertedPriceRange(query.min_price, query.max_price)) {
    return query
  }
  return { ...query, max_price: '' }
}

/**
 * Swap min/max strings when both are set and inverted.
 * Do not call this on input blur while the user is typing — partial max values (e.g. "1"
 * when entering "100") get swapped with min and become "50", then "500" on the next digit.
 * Card filtering uses getNormalizedRange in useDashQards instead.
 */
export function reconcilePriceRange(
  minRaw?: string,
  maxRaw?: string,
): { min_price?: string; max_price?: string } {
  const min = parsePriceValue(minRaw)
  const max = parsePriceValue(maxRaw)
  if (min === null || max === null || min <= max) {
    return {
      min_price: minRaw || undefined,
      max_price: maxRaw || undefined,
    }
  }
  return {
    min_price: maxRaw,
    max_price: minRaw,
  }
}
