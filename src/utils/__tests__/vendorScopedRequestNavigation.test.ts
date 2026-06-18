import { describe, it, expect } from 'vitest'
import {
  resolveVendorIdForCorporateApproval,
  resolveVendorIdFromRequest,
} from '../resolveVendorIdFromRequest'
import {
  buildCorporateVendorManagementUrl,
  buildVendorScopedRequestActionUrl,
} from '../vendorScopedRequestNavigation'
import { MODALS, ROUTES } from '@/utils/constants'

describe('resolveVendorIdFromRequest', () => {
  it('reads vendor_id from nested request_data', () => {
    expect(
      resolveVendorIdFromRequest({
        request_data: { proposed_data: { vendor_id: 'vendor-abc' } },
      }),
    ).toBe('vendor-abc')
  })
})

describe('resolveVendorIdForCorporateApproval', () => {
  const vendors = [
    {
      vendor_id: 'v-7407',
      vendor_name: 'Marvel Universe Merch',
      gvid: '7407-01',
    },
  ]

  it('matches vendor by gvid when list row omits vendor_id', () => {
    expect(
      resolveVendorIdForCorporateApproval({ gvid: '7407-01' }, vendors),
    ).toBe('v-7407')
  })

  it('matches vendor by business name in entity_details', () => {
    expect(
      resolveVendorIdForCorporateApproval(
        { entity_details: { vendor_name: 'Marvel Universe Merch' } },
        vendors,
      ),
    ).toBe('v-7407')
  })
})

describe('vendorScopedRequestNavigation', () => {
  it('builds vendor requests approve URL with vendor context and modal params', () => {
    const url = buildVendorScopedRequestActionUrl(
      'approve',
      { id: 'req-1', request_id: 'RQ-001', status: 'pending' },
      'v-7407',
    )
    expect(url.startsWith(`${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?`)).toBe(true)
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('account')).toBe('vendor')
    expect(params.get('vendor_id')).toBe('v-7407')
    expect(params.get(MODALS.REQUEST.PARAM_NAME)).toBe(MODALS.REQUEST.CHILDREN.APPROVE)
    expect(JSON.parse(params.get('modalData') ?? '{}')).toMatchObject({
      id: 'req-1',
      approvalVendorId: 'v-7407',
    })
  })

  it('builds corporate vendor management URL', () => {
    expect(buildCorporateVendorManagementUrl()).toBe(ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS)
  })
})
