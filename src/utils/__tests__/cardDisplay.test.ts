import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/constants', () => ({
  ENV_VARS: { API_BASE_URL: 'https://api.example.com/api/v1' },
}))

import { getCardFileUrl, getCardMediaSource, getImageUrl, isCardStorageFileKey, isIssuedCardDisplayCode, getCardDisplayName, isPdfFile } from '../cardDisplay'

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

describe('card display names', () => {
  it('detects issued card display codes', () => {
    expect(isIssuedCardDisplayCode('X-9688-01-01-001-000002')).toBe(true)
    expect(isIssuedCardDisplayCode('P-9688-01-01-001-000001')).toBe(true)
    expect(isIssuedCardDisplayCode('G-9688-01-01-000007')).toBe(true)
    expect(isIssuedCardDisplayCode('Yoga Session')).toBe(false)
  })

  it('prefers product names and skips issued codes', () => {
    expect(getCardDisplayName('X-9688-01-01-001-000002', 'Spa Day')).toBe('Spa Day')
    expect(getCardDisplayName('X-9688-01-01-001-000002')).toBe('')
    expect(getCardDisplayName(undefined, 'Branch Gift Card')).toBe('Branch Gift Card')
  })
})
