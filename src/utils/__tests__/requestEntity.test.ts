import { describe, it, expect } from 'vitest'
import {
  extractRequestIdFromResponse,
  formatApproverLevelLabel,
  getAwaitingApprovalNotice,
  parseApprovalChain,
  resolveRequestInboxRole,
} from '../requestEntity'

describe('requestEntity', () => {
  it('parseApprovalChain returns empty array when missing', () => {
    expect(parseApprovalChain(null)).toEqual([])
    expect(parseApprovalChain({})).toEqual([])
  })

  it('parseApprovalChain filters valid items', () => {
    expect(
      parseApprovalChain({
        approval_chain: [
          { level: 'vendor_admin', status: 'approved' },
          null,
          'bad',
        ],
      }),
    ).toEqual([{ level: 'vendor_admin', status: 'approved' }])
  })

  it('extractRequestIdFromResponse reads nested shapes', () => {
    expect(extractRequestIdFromResponse({ request_id: 'r-1' })).toBe('r-1')
    expect(extractRequestIdFromResponse({ data: { id: 42 } })).toBe('42')
    expect(extractRequestIdFromResponse({})).toBeNull()
  })

  it('formatApproverLevelLabel humanizes levels', () => {
    expect(formatApproverLevelLabel('corporate_admin')).toBe('corporate admin')
  })

  it('resolveRequestInboxRole maps user types', () => {
    expect(resolveRequestInboxRole('vendor')).toBe('vendor')
    expect(resolveRequestInboxRole('corporate admin')).toBe('corporate')
    expect(resolveRequestInboxRole('corporate super admin', 'v-1')).toBe('corporate-vendor-scoped')
  })

  it('getAwaitingApprovalNotice explains when user cannot act', () => {
    expect(
      getAwaitingApprovalNotice(
        { status: 'Awaiting Corporate Approval', current_approver_level: 'corporate_admin' },
        false,
      ),
    ).toMatch(/awaiting corporate admin approval/i)
    expect(
      getAwaitingApprovalNotice(
        { status: 'Awaiting Corporate Approval', current_approver_level: 'corporate_admin' },
        true,
      ),
    ).toBeNull()
  })
})
