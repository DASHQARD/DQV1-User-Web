import { describe, expect, it } from 'vitest'
import { isAbsoluteMediaUrl, resolveSignedUrlFromResponse } from '../resolveSignedUrl'

describe('resolveSignedUrl', () => {
  it('resolveSignedUrlFromResponse handles string and nested shapes', () => {
    expect(resolveSignedUrlFromResponse('https://example.com/a.jpg')).toBe(
      'https://example.com/a.jpg',
    )
    expect(resolveSignedUrlFromResponse({ url: 'https://example.com/b.jpg' })).toBe(
      'https://example.com/b.jpg',
    )
    expect(
      resolveSignedUrlFromResponse({ data: { signed_url: 'https://example.com/c.jpg' } }),
    ).toBe('https://example.com/c.jpg')
    expect(
      resolveSignedUrlFromResponse({ data: { file_url: 'https://example.com/d.jpg' } }),
    ).toBe('https://example.com/d.jpg')
  })

  it('isAbsoluteMediaUrl detects http(s) and data urls', () => {
    expect(isAbsoluteMediaUrl('https://x.com/a.png')).toBe(true)
    expect(isAbsoluteMediaUrl('1779330705116-key.png')).toBe(false)
  })
})
