/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | string, currency: string = 'GHS'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return `${currency} 0.00`

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
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
 */
export function getFormattedLastLogin(): string {
  const lastLogin = localStorage.getItem('lastLoginTime')
  if (!lastLogin) return 'First time login'

  try {
    const lastLoginDate = new Date(lastLogin)
    return formatRelativeTime(lastLoginDate)
  } catch {
    return 'Unknown'
  }
}

/**
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

/**
 * Format date as full date with time (e.g., "Monday, January 15, 2024 at 14:30")
 */
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
