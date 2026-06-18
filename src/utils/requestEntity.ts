import type {
  ApprovalChainItem,
  RequestApproverLevel,
  RequestEntity,
  RequestInboxRole,
} from '@/types/requests'

export function parseApprovalChain(
  request: Record<string, unknown> | null | undefined,
): ApprovalChainItem[] {
  const chain = request?.approval_chain
  if (!Array.isArray(chain)) return []
  return chain.filter((item): item is ApprovalChainItem => item != null && typeof item === 'object')
}

export function formatApproverLevelLabel(level: string | null | undefined): string {
  const normalized = String(level ?? '')
    .trim()
    .toLowerCase()
  if (!normalized) return 'Approver'
  return normalized.replace(/_/g, ' ')
}

export function extractRequestIdFromResponse(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null
  const root = response as Record<string, unknown>
  const data = root.data
  const candidates = [
    root.request_id,
    root.id,
    data && typeof data === 'object' ? (data as Record<string, unknown>).request_id : null,
    data && typeof data === 'object' ? (data as Record<string, unknown>).id : null,
  ]
  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim()) {
      return String(candidate).trim()
    }
  }
  return null
}

export function resolveRequestInboxRole(
  userType: string | null | undefined,
  vendorIdFromUrl?: string | null,
): RequestInboxRole {
  if (userType === 'corporate super admin' && vendorIdFromUrl?.trim()) {
    return 'corporate-vendor-scoped'
  }
  if (
    userType === 'corporate super admin' ||
    userType === 'corporate admin' ||
    userType === 'corporate'
  ) {
    return 'corporate'
  }
  return 'vendor'
}

export function getAwaitingApprovalNotice(
  request: Pick<RequestEntity, 'status' | 'current_approver_level'> | null | undefined,
  canAct: boolean,
): string | null {
  if (!request || canAct) return null
  const level = formatApproverLevelLabel(request.current_approver_level)
  const status = String(request.status ?? '').toLowerCase()
  if (!status.includes('awaiting') && status !== 'pending') return null
  return `This request is awaiting ${level} approval. You can view progress here; another role must approve it.`
}

export function isAdminApproverLevel(level: string | null | undefined): boolean {
  return (
    String(level ?? '')
      .toLowerCase()
      .trim() === 'admin'
  )
}

export function getNextApproverLevelAfter(
  chain: ApprovalChainItem[],
  currentLevel: RequestApproverLevel,
): RequestApproverLevel | null {
  const index = chain.findIndex((item) => String(item.level ?? '').toLowerCase() === currentLevel)
  if (index < 0 || index >= chain.length - 1) return null
  const next = String(chain[index + 1]?.level ?? '').toLowerCase()
  if (next === 'vendor_admin' || next === 'corporate_admin' || next === 'admin') {
    return next
  }
  return null
}
