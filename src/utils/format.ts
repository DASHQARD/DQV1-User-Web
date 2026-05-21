/** ISO 4217 code used across the app and API for Ghana Cedi */
export const DEFAULT_CURRENCY = 'GHS'

/** Currency code prefix for inputs and labels (same as DEFAULT_CURRENCY) */
export const CURRENCY_PREFIX = DEFAULT_CURRENCY

/**
 * Format a number as currency using the ISO code (e.g. "GHS 100.00"), not the cedi symbol (GH₵).
 */
export function formatCurrency(
  amount: number | string,
  currency: string = DEFAULT_CURRENCY,
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return `${currency} 0.00`

  const formatted = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)

  return formatted.replace(/\u00a0/g, ' ')
}

type FormatCurrencyLabelOptions = {
  minDecimals?: number
  maxDecimals?: number
}

/**
 * Format as "GHS 100" for buttons, prefixes, and inline copy without Intl symbol (GH₵).
 */
export function formatCurrencyLabel(
  amount: number | string,
  currency: string = DEFAULT_CURRENCY,
  options?: FormatCurrencyLabelOptions,
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return `${currency} 0`

  const minDecimals = options?.minDecimals ?? 0
  const maxDecimals = options?.maxDecimals ?? 2
  const formatted = numAmount.toLocaleString('en-GH', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  })

  return `${currency} ${formatted}`
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
  const years = Math.floor(diffInSeconds / 31536000)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

/**
 * Get formatted last login time from localStorage

 * Update last login time in localStorage
 */
export function updateLastLoginTime(): void {
  localStorage.setItem('lastLoginTime', new Date().toISOString())
}

/**
 * Format date as "MMM D, YYYY" (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(dateObj.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj)
}

/** Compact date and time for tables (e.g. "May 21, 2026, 2:28 AM"). */
export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(dateObj.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}

/**
 * Format date as full date with time (e.g., "Monday, January 15, 2024 at 14:30")
 */
/** Human-readable branch label when API omits branch_name (e.g. branches_with_cards). */
export function formatBranchLabel(branch: {
  branch_id?: string | number
  branch_name?: string | null
  name?: string | null
  branch_location?: string | null
}): string {
  const name = branch.branch_name ?? branch.name
  const location = branch.branch_location
  const id = branch.branch_id != null ? String(branch.branch_id) : ''

  if (name && location) return `${name} — ${location}`
  if (name) return name
  if (location) return location
  if (id) return `Branch ${id.slice(0, 8)}`
  return 'Branch'
}

export function formatFullDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(dateObj.getTime())) return 'N/A'

  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateObj)
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateObj)
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours().toString().padStart(2, '0')
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')

  return `${weekday}, ${month} ${day}, ${year} at ${hours}:${minutes}`
}
