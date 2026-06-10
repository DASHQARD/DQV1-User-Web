import { describe, expect, it } from 'vitest'
import {
  buildCardsRedemptionPayload,
  findVendorSearchMatch,
  isExactGvidPathLookup,
  isFullGvidInput,
  isRedemptionApiSuccess,
  mergeVendorSearchResults,
} from '../cardsRedemption'

describe('cardsRedemption', () => {
  it('isFullGvidInput accepts GH-0001 style ids', () => {
    expect(isFullGvidInput('GH-0001')).toBe(true)
    expect(isFullGvidInput('ab')).toBe(false)
    expect(isFullGvidInput('GH 0001')).toBe(false)
  })

  it('isExactGvidPathLookup distinguishes full GVID from numeric fragments', () => {
    expect(isExactGvidPathLookup('GH-0001')).toBe(true)
    expect(isExactGvidPathLookup('4158-01')).toBe(false)
    expect(isExactGvidPathLookup('KFC')).toBe(false)
  })

  it('mergeVendorSearchResults falls back to partial when exact path is empty', () => {
    const partial = [{ vendor_id: '1', vendor_name: 'KFC', gvid: 'GH-4158' }]
    expect(mergeVendorSearchResults(partial, [], true)).toEqual(partial)
    expect(mergeVendorSearchResults(partial, partial, true)).toEqual(partial)
  })

  it('findVendorSearchMatch matches branch full_branch_id', () => {
    const match = findVendorSearchMatch('GH-0001-0001', [
      {
        vendor_id: 'v1',
        vendor_name: 'Test',
        gvid: 'GH-0001',
        branches: [{ id: 'b1', branch_name: 'Main', full_branch_id: 'GH-0001-0001' }],
      },
    ])
    expect(match?.vendor_name).toBe('Test')
  })

  it('isRedemptionApiSuccess treats 202 as success', () => {
    expect(isRedemptionApiSuccess({ status: 'success', statusCode: 202 })).toBe(true)
    expect(isRedemptionApiSuccess({ status: 'error', statusCode: 400 })).toBe(false)
  })

  it('buildCardsRedemptionPayload omits card_id for DashPro', () => {
    const payload = buildCardsRedemptionPayload({
      branch_id: 'branch-1',
      vendor_gvid: 'GH-0001',
      card_type: 'DashPro',
      amount: 50,
    })
    expect(payload).toEqual({
      branch_id: 'branch-1',
      vendor_gvid: 'GH-0001',
      card_type: 'DashPro',
      amount: 50,
    })
  })

  it('buildCardsRedemptionPayload includes card_id for DashGo', () => {
    const payload = buildCardsRedemptionPayload({
      branch_id: 'branch-1',
      vendor_gvid: 'GH-0001',
      card_type: 'DashGo',
      card_id: 'gift-card-uuid',
      amount: 99.83,
    })
    expect(payload).toEqual({
      branch_id: 'branch-1',
      vendor_gvid: 'GH-0001',
      card_type: 'DashGo',
      card_id: 'gift-card-uuid',
      amount: 99.83,
    })
  })

  it('buildCardsRedemptionPayload includes card_id for DashX', () => {
    const payload = buildCardsRedemptionPayload({
      branch_id: 'branch-1',
      vendor_gvid: 'GH-0001',
      card_type: 'DashX',
      card_id: 'card-uuid',
    })
    expect(payload).toMatchObject({
      card_type: 'DashX',
      card_id: 'card-uuid',
    })
    expect('amount' in payload).toBe(false)
  })
})
