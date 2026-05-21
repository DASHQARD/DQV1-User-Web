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

export type DateRangeApiParamStyle = 'snake' | 'camel'

/**
 * Map PaginatedTable date filter (camelCase UI) to API query params.
 * Most list endpoints use snake_case; redemptions use camelCase.
 */
export function appendDateRangeApiParams(
  target: Record<string, unknown>,
  source: { dateFrom?: string; dateTo?: string },
  style: DateRangeApiParamStyle = 'snake',
): void {
  if (style === 'camel') {
    if (source.dateFrom) target.dateFrom = source.dateFrom
    if (source.dateTo) target.dateTo = source.dateTo
    return
  }
  if (source.dateFrom) target.date_from = source.dateFrom
  if (source.dateTo) target.date_to = source.dateTo
}

export function sentenceCase(str: string) {
  return str?.replace(/\.\s+([a-z])[^\\.]|^(\s*[a-z])[^\\.]/g, (s) =>
    s.replace(/([a-z])/, (s) => s.toUpperCase()),
  )
}

export function getTarget(inputObj: Record<string, any>, path: string | string[]): any {
  const pathArr = Array.isArray(path) ? path : path?.split('.')
  return pathArr.reduce((target, currentPath) => target?.[currentPath], inputObj)
}

export function getStatusVariant(status?: string) {
  switch (status) {
    case 'success':
      return 'success'
    case 'active':
      return 'success'
    case 'accepted':
      return 'success'
    case 'verified':
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
    case 'cancelled':
      return 'error'
    case 'rejected':
      return 'error'
    case 'suspended':
      return 'error'
    default:
      return 'warning'
  }
}
