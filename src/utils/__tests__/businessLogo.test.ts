import { describe, expect, it } from 'vitest'

import { getBusinessLogoFileKey } from '../businessLogo'

describe('getBusinessLogoFileKey', () => {
  it('prefers business_documents logo', () => {
    const key = getBusinessLogoFileKey({
      business_documents: [{ type: 'logo', file_url: 'doc-logo.jpg' }],
      business_details: [{ logo: 'details-logo.jpg' }],
    })
    expect(key).toBe('doc-logo.jpg')
  })

  it('falls back to business_details logo', () => {
    const key = getBusinessLogoFileKey({
      business_documents: [{ type: 'certificate_of_incorporation', file_url: 'cert.jpg' }],
      business_details: [{ logo: 'details-logo.jpg' }],
    })
    expect(key).toBe('details-logo.jpg')
  })

  it('returns null when no logo exists', () => {
    expect(getBusinessLogoFileKey({ business_details: [{ name: 'Fuse' } as Record<string, unknown>] })).toBeNull()
  })
})
