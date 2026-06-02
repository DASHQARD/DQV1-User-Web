import { describe, expect, it } from 'vitest'
import {
  buildCardsRedemptionPayload,
  isFullGvidInput,
  isRedemptionApiSuccess,
} from '../cardsRedemption'

describe('cardsRedemption', () => {
  it('isFullGvidInput accepts GH-0001 style ids', () => {
    expect(isFullGvidInput('GH-0001')).toBe(true)
    expect(isFullGvidInput('ab')).toBe(false)
    expect(isFullGvidInput('GH 0001')).toBe(false)
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
