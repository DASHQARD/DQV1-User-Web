import { describe, it, expect } from 'vitest'
import {
  buildRedemptionUrl,
  buildRedemptionUrlFromCard,
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

  it('parses gvid alias and infers vendor_id method for QR deep links', () => {
    const params = parseRedemptionSearchParams(new URLSearchParams('gvid=7407-01'))
    expect(params.method).toBe('vendor_id')
    expect(params.vendor_gvid).toBe('7407-01')
  })

  it('prefers vendor_gvid over gvid when both are present', () => {
    const params = parseRedemptionSearchParams(
      new URLSearchParams('gvid=7407-01&vendor_gvid=GH-0001'),
    )
    expect(params.vendor_gvid).toBe('GH-0001')
  })

  it('infers vendor_id method from vendor_id param without explicit method', () => {
    const params = parseRedemptionSearchParams(new URLSearchParams('vendor_id=vendor-uuid-1'))
    expect(params.method).toBe('vendor_id')
    expect(params.vendor_id).toBe('vendor-uuid-1')
  })

  it('buildRedemptionUrlFromCard uses vendor mobile money for DashPro', () => {
    expect(
      buildRedemptionUrlFromCard({
        card_type: 'DashPro',
        vendor_id: 99,
        branch_id: 'branch-1',
        card_id: 'card-1',
      }),
    ).toBe('/redeem?method=vendor_mobile_money&card_type=dashpro')
  })

  it('buildRedemptionUrlFromCard uses vendor id for DashGo', () => {
    expect(
      buildRedemptionUrlFromCard({
        card_type: 'DashGo',
        vendor_id: 12,
        branch_id: 'branch-2',
        card_id: 'card-2',
      }),
    ).toBe('/redeem?method=vendor_id&card_type=dashgo&vendor_id=12&branch_id=branch-2&card_id=card-2')
  })

  it('vendorIdFlowRequiresBranch when branches exist and none selected', () => {
    expect(vendorIdFlowRequiresBranch(2, null)).toBe(true)
    expect(vendorIdFlowRequiresBranch(2, 'b1')).toBe(false)
    expect(vendorIdFlowRequiresBranch(0, null)).toBe(false)
  })
})
