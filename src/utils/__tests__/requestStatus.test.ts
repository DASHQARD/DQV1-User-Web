import { describe, expect, it } from 'vitest'

import {
  isRequestApproved,
  isRequestAwaitingApproval,
  isRequestRejected,
} from '../requestStatus'

describe('requestStatus', () => {
  it('isRequestAwaitingApproval matches pending and awaiting-* statuses', () => {
    expect(isRequestAwaitingApproval('pending')).toBe(true)
    expect(isRequestAwaitingApproval('Awaiting Vendor Approval')).toBe(true)
    expect(isRequestAwaitingApproval('awaiting corporate approval')).toBe(true)
    expect(isRequestAwaitingApproval('approved')).toBe(false)
  })

  it('isRequestRejected and isRequestApproved', () => {
    expect(isRequestRejected('rejected')).toBe(true)
    expect(isRequestApproved('Approved')).toBe(true)
  })
})
