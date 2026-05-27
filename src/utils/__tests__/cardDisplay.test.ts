import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/constants', () => ({
  ENV_VARS: { API_BASE_URL: 'https://api.example.com/api/v1' },
}))

import {
  getCardFileUrl,
  getCardMediaSource,
  getImageUrl,
  isCardStorageFileKey,
  isIssuedCardDisplayCode,
  isInternalProductCode,
  getCardDisplayName,
  formatCardDisplayTitle,
  titleFromDescription,
  isPdfFile,
} from '../cardDisplay'

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
    expect(getCardDisplayName('X-9688-01-01-001-000002', undefined, { type: 'DashX' })).toBe(
      'DASHX Gift Card',
    )
    expect(getCardDisplayName(undefined, 'Branch Gift Card')).toBe('Branch Gift Card')
  })

  it('detects internal catalog product codes', () => {
    expect(isInternalProductCode('GHA-482761934-2')).toBe(true)
    expect(isInternalProductCode('Nike Gift Card')).toBe(false)
  })

  it('derives a title from description when product is an internal code', () => {
    const description =
      'Celebrate football with the FIFA Legends World Cup Card — a premium themed gift card.'
    expect(getCardDisplayName('GHA-482761934-2', undefined, { description, type: 'DashX' })).toBe(
      'FIFA Legends World Cup Card',
    )
    expect(titleFromDescription(description)).toBe('FIFA Legends World Cup Card')
  })

  it('title-cases lowercase card names', () => {
    expect(formatCardDisplayTitle('test request approval flow')).toBe(
      'Test Request Approval Flow',
    )
    expect(formatCardDisplayTitle('no risk no story.')).toBe('No Risk No Story.')
    expect(formatCardDisplayTitle('arsenal branch')).toBe('Arsenal Branch')
  })

  it('preserves already formatted and branded names', () => {
    expect(formatCardDisplayTitle('Nike Gift Card')).toBe('Nike Gift Card')
    expect(formatCardDisplayTitle('WanderPass Travel Gift Card')).toBe(
      'WanderPass Travel Gift Card',
    )
    expect(formatCardDisplayTitle('dashx rewards')).toBe('DASHX Rewards')
  })
})
