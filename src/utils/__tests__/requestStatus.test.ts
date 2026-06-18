import { describe, expect, it } from 'vitest'

import {
  canApproveAtCurrentLevel,
  canCorporateUserApproveRequest,
  countAwaitingApprovalRequests,
  countPendingRequestsForContext,
  isRequestApproved,
  isRequestAwaitingApproval,
  isRequestRejected,
  parseRequestsListResponse,
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

  it('vendor context cannot approve requests awaiting corporate admin', () => {
    const request = {
      status: 'Awaiting Corporate Approval',
      current_approver_level: 'corporate_admin',
    }
    expect(canApproveAtCurrentLevel(request, 'vendor')).toBe(false)
    expect(canApproveAtCurrentLevel(request, 'corporate-vendor-scoped')).toBe(false)
    expect(canApproveAtCurrentLevel(request, 'corporate')).toBe(true)
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

  it('parseRequestsListResponse supports array and { data } shapes', () => {
    expect(parseRequestsListResponse([{ status: 'pending' }])).toHaveLength(1)
    expect(parseRequestsListResponse({ data: [{ status: 'approved' }] })).toHaveLength(1)
    expect(parseRequestsListResponse(null)).toEqual([])
  })

  it('countPendingRequestsForContext counts only actionable requests', () => {
    const list = [
      { status: 'Awaiting Vendor Approval', current_approver_level: 'vendor_admin' },
      { status: 'awaiting corporate approval', current_approver_level: 'corporate_admin' },
      { status: 'approved', current_approver_level: 'vendor_admin' },
    ]
    expect(countPendingRequestsForContext(list, 'vendor')).toBe(1)
    expect(countPendingRequestsForContext(list, 'corporate')).toBe(1)
    expect(countPendingRequestsForContext(list, 'corporate-vendor-scoped')).toBe(1)
  })
})
