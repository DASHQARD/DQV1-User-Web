import { describe, expect, it } from 'vitest'

import { getVendorLogoDirectUrl, getVendorLogoStorageKey } from '../vendorLogo'

describe('vendorLogo', () => {
  it('uses pre-signed logo URL directly', () => {
    const url = 'https://dashqard-bucket.s3.eu-west-1.amazonaws.com/logo.png?X-Amz-Signature=abc'
    expect(getVendorLogoDirectUrl({ logo: url })).toBe(url)
    expect(getVendorLogoStorageKey({ logo: url, logo_key: 'key.png' })).toBeNull()
  })

  it('falls back to logo_key for presigned fetch', () => {
    expect(
      getVendorLogoStorageKey({
        logo_key: '1779196527983-Variant5.png',
      }),
    ).toBe('1779196527983-Variant5.png')
  })
})
