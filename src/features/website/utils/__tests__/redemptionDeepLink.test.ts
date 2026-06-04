import { describe, it, expect } from 'vitest'
import {
  buildRedemptionUrl,
  parseRedemptionSearchParams,
  vendorIdFlowRequiresBranch,
} from '../redemptionDeepLink'

describe('redemptionDeepLink', () => {
  it('builds redeem URL with query params', () => {
    expect(
      buildRedemptionUrl({
        method: 'vendor_id',
        card_type: 'DashGo',
        vendor_gvid: 'GH-0001',
        branch_id: 'branch-1',
      }),
    ).toBe('/redeem?method=vendor_id&card_type=dashgo&vendor_gvid=GH-0001&branch_id=branch-1')
  })

  it('parses search params', () => {
    const params = parseRedemptionSearchParams(
      new URLSearchParams('method=vendor_mobile_money&card_type=dashpro'),
    )
    expect(params.method).toBe('vendor_mobile_money')
    expect(params.card_type).toBe('dashpro')
  })

  it('vendorIdFlowRequiresBranch when branches exist and none selected', () => {
    expect(vendorIdFlowRequiresBranch(2, null)).toBe(true)
    expect(vendorIdFlowRequiresBranch(2, 'b1')).toBe(false)
    expect(vendorIdFlowRequiresBranch(0, null)).toBe(false)
  })
})
