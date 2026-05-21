/** Normalize API responses from POST /file/generate/signed-url. */
export function resolveSignedUrlFromResponse(response: unknown): string | null {
  if (!response) return null
  if (typeof response === 'string') {
    return response.startsWith('http://') || response.startsWith('https://') ? response : null
  }
  if (typeof response !== 'object') return null

  const record = response as Record<string, unknown>
  if (typeof record.url === 'string') return record.url
  if (typeof record.signed_url === 'string') return record.signed_url
  if (typeof record.signedUrl === 'string') return record.signedUrl
  if (typeof record.file_url === 'string') return record.file_url

  const data = record.data
  if (typeof data === 'string') {
    return data.startsWith('http://') || data.startsWith('https://') ? data : null
  }
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>
    if (typeof nested.url === 'string') return nested.url
    if (typeof nested.signed_url === 'string') return nested.signed_url
    if (typeof nested.signedUrl === 'string') return nested.signedUrl
    if (typeof nested.file_url === 'string') return nested.file_url
  }

  return null
}

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
