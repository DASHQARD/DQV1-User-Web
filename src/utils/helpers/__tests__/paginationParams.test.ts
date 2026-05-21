import { describe, expect, it } from 'vitest'
import { appendDateRangeApiParams } from '../common'

describe('appendDateRangeApiParams', () => {
  it('maps UI dates to API snake_case by default', () => {
    const params: Record<string, unknown> = { limit: 10 }
    appendDateRangeApiParams(params, {
      dateFrom: '2026-05-20',
      dateTo: '2026-05-21',
    })
    expect(params).toEqual({
      limit: 10,
      date_from: '2026-05-20',
      date_to: '2026-05-21',
    })
  })

  it('maps UI dates to API camelCase when style is camel', () => {
    const params: Record<string, unknown> = { limit: 10 }
    appendDateRangeApiParams(
      params,
      { dateFrom: '2026-05-20', dateTo: '2026-05-20' },
      'camel',
    )
    expect(params).toEqual({
      limit: 10,
      dateFrom: '2026-05-20',
      dateTo: '2026-05-20',
    })
  })

  it('skips empty date values', () => {
    const params: Record<string, unknown> = {}
    appendDateRangeApiParams(params, {})
    expect(params).toEqual({})
  })
})
