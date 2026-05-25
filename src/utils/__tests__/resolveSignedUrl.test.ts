import { describe, expect, it } from 'vitest'
import { isAbsoluteMediaUrl } from '../resolveSignedUrl'

describe('resolveSignedUrl', () => {
  it('isAbsoluteMediaUrl detects browser-loadable URLs', () => {
    expect(isAbsoluteMediaUrl('https://example.com/a.jpg')).toBe(true)
    expect(isAbsoluteMediaUrl('http://example.com/a.jpg')).toBe(true)
    expect(isAbsoluteMediaUrl('data:image/png;base64,abc')).toBe(true)
    expect(isAbsoluteMediaUrl('blob:http://localhost/abc')).toBe(true)
    expect(isAbsoluteMediaUrl('1779330705116-key.png')).toBe(false)
    expect(isAbsoluteMediaUrl(null)).toBe(false)
  })
})
