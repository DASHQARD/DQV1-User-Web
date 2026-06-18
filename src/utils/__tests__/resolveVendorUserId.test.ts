import { describe, expect, it } from 'vitest'

import { resolveVendorUserIdForCorporateSwitch } from '../resolveVendorUserId'

describe('resolveVendorUserIdForCorporateSwitch', () => {
  it('returns vendor_user_id for matching vendor_id', () => {
    expect(
      resolveVendorUserIdForCorporateSwitch('42', [
        { vendor_id: 42, vendor_user_id: 9001 },
        { vendor_id: 99, vendor_user_id: 9002 },
      ]),
    ).toBe(9001)
  })

  it('matches vendor by gvid when vendor_id param is a GVID', () => {
    expect(
      resolveVendorUserIdForCorporateSwitch('0493-01', [
        { vendor_id: '019eb501-f5dd-7c95-b770-e0c5559cf03c', gvid: '0493-01', vendor_user_id: 9001 },
      ]),
    ).toBe(9001)
  })

  it('returns null when no match', () => {
    expect(resolveVendorUserIdForCorporateSwitch('42', [{ vendor_id: 1 }])).toBeNull()
  })
})
