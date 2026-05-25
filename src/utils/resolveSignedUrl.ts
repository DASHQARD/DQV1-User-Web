/** True when value is already a browser-loadable absolute URL. */
export function isAbsoluteMediaUrl(value: string | null | undefined): boolean {
  if (!value) return false
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  )
}
