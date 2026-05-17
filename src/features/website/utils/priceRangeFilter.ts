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

/** On blur, swap min/max when inverted so both fields stay valid */
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
