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
