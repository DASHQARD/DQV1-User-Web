export function toKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function getQueryString(obj?: Record<string, any>) {
  if (!obj || typeof obj !== 'object') return ''

  return Object.entries(obj)
    .filter(([, value]) => value != null && value !== '') // Exclude null, undefined, and empty string
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

export function sentenceCase(str: string) {
  return str?.replace(/\.\s+([a-z])[^\\.]|^(\s*[a-z])[^\\.]/g, (s) =>
    s.replace(/([a-z])/, (s) => s.toUpperCase()),
  )
}

export function getStatusVariant(status?: string) {
  switch (status) {
    case 'active':
      return 'success'
    case 'paid':
      return 'success'
    case 'successful':
      return 'success'
    case 'approved':
      return 'success'
    case 'processing':
      return 'warning'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    case 'inactive':
      return 'error'
    case 'deactivate':
      return 'error'
    case 'deactivated':
      return 'error'
    case 'rejected':
      return 'error'
    default:
      return 'warning'
  }
}
