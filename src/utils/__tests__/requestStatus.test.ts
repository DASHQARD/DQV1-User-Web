import { describe, expect, it } from 'vitest'

import {
  canApproveAtCurrentLevel,
  canCorporateUserApproveRequest,
  countAwaitingApprovalRequests,
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

  it('canCorporateUserApproveRequest allows CSA at vendor_admin level with vendor_id', () => {
    expect(
      canCorporateUserApproveRequest(
        {
          status: 'awaiting vendor approval',
          current_approver_level: 'vendor_admin',
          vendor_id: 12,
        },
        'corporate super admin',
      ),
    ).toBe(true)
  })

  it('canApproveAtCurrentLevel respects approver context', () => {
    const request = {
      status: 'awaiting vendor approval',
      current_approver_level: 'vendor_admin',
    }
    expect(canApproveAtCurrentLevel(request, 'vendor')).toBe(true)
    expect(canApproveAtCurrentLevel(request, 'corporate-vendor-scoped')).toBe(true)
    expect(canApproveAtCurrentLevel(request, 'corporate')).toBe(false)
  })

  it('countAwaitingApprovalRequests', () => {
    expect(
      countAwaitingApprovalRequests([
        { status: 'pending' },
        { status: 'awaiting admin approval' },
        { status: 'approved' },
      ]),
    ).toBe(2)
  })
})
