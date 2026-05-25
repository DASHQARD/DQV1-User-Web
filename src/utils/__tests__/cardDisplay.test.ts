import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/constants', () => ({
  ENV_VARS: { API_BASE_URL: 'https://api.example.com/api/v1' },
}))

import { getCardFileUrl, getCardMediaSource, getImageUrl, isCardStorageFileKey, isPdfFile } from '../cardDisplay'

describe('cardDisplay file URLs', () => {
  it('returns absolute URLs unchanged', () => {
    const url = 'https://cdn.example.com/terms.pdf'
    expect(getImageUrl(url)).toBe(url)
    expect(getCardFileUrl(url)).toBe(url)
  })

  it('prefixes relative upload paths with API host', () => {
    expect(getImageUrl('vendor/terms.pdf')).toBe('https://api.example.com/uploads/vendor/terms.pdf')
    expect(getImageUrl('/uploads/vendor/terms.pdf')).toBe(
      'https://api.example.com/uploads/vendor/terms.pdf',
    )
  })

  it('resolves storage keys to uploads URLs', () => {
    const key = '1779334283870-logo.jpg'
    expect(isCardStorageFileKey(key)).toBe(true)
    expect(getCardMediaSource(key)).toEqual({
      directUrl: 'https://api.example.com/uploads/1779334283870-logo.jpg',
      storageKey: null,
    })
  })

  it('detects PDF files for preview', () => {
    expect(isPdfFile('https://x.com/doc.pdf', 'Terms.pdf')).toBe(true)
    expect(isPdfFile('https://x.com/doc', 'resume.docx')).toBe(false)
  })
})
