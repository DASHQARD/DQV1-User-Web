import type { RequestApprovalContext, RequestApproverLevel } from '@/types/requests'

/** True when a request is still waiting on an approver action. */
export function isRequestAwaitingApproval(status: string | null | undefined): boolean {
  const normalized = String(status ?? '')
    .toLowerCase()
    .trim()
  if (!normalized) return false
  if (normalized === 'pending') return true
  if (normalized.includes('awaiting') && normalized.includes('approval')) return true
  return false
}

export function normalizeApproverLevel(
  level: string | null | undefined,
): RequestApproverLevel | null {
  const normalized = String(level ?? '')
    .toLowerCase()
    .trim()
  if (normalized === 'vendor_admin') return 'vendor_admin'
  if (normalized === 'corporate_admin') return 'corporate_admin'
  if (normalized === 'admin') return 'admin'
  return null
}

/** Whether the current UI context may act on the request's pending approval level. */
export function canApproveAtCurrentLevel(
  request: { status?: string; current_approver_level?: string },
  context: RequestApprovalContext,
): boolean {
  if (!isRequestAwaitingApproval(request.status)) return false
  const level = normalizeApproverLevel(request.current_approver_level)
  if (context === 'corporate-vendor-scoped' || context === 'vendor') {
    return level === 'vendor_admin'
  }
  if (context === 'corporate') {
    return level === 'corporate_admin'
  }
  return false
}

/** Corporate inbox: corporate_admin level, or CSA acting for vendor at vendor_admin level. */
export function canCorporateUserApproveRequest(
  request: Record<string, unknown> & { status?: string; current_approver_level?: string },
  userType: string | null | undefined,
): boolean {
  if (canApproveAtCurrentLevel(request, 'corporate')) return true

  if (userType === 'corporate super admin' && canApproveAtCurrentLevel(request, 'corporate-vendor-scoped')) {
    return true
  }

  return false
}

export function countAwaitingApprovalRequests(
  requests: Array<{ status?: string }> | null | undefined,
): number {
  if (!requests?.length) return 0
  return requests.filter((r) => isRequestAwaitingApproval(r.status)).length
}

export function isRequestRejected(status: string | null | undefined): boolean {
  return String(status ?? '')
    .toLowerCase()
    .trim() === 'rejected'
}

export function isRequestApproved(status: string | null | undefined): boolean {
  return String(status ?? '')
    .toLowerCase()
    .trim() === 'approved'
}
