import { describe, expect, it } from 'vitest'
import {
  buildVendorProfilePath,
  buildVendorProfilePathFromGvid,
  buildVendorProfileSearchParams,
} from '../vendorProfilePath'

describe('vendorProfilePath', () => {
  it('builds gvid-only vendor profile links when gvid is available', () => {
    expect(
      buildVendorProfilePath({
        vendor_id: '019e8cb0-9405-74a1-ab7b-e3c13b423a04',
        gvid: '4158-01',
      }),
    ).toBe('/vendor?gvid=4158-01')
  })

  it('falls back to vendor_id when gvid is missing', () => {
    expect(buildVendorProfileSearchParams({ vendor_id: 'vendor-uuid' })).toBe(
      'vendor_id=vendor-uuid',
    )
  })

  it('builds path from gvid helper', () => {
    expect(buildVendorProfilePathFromGvid('4158-01')).toBe('/vendor?gvid=4158-01')
  })
})
