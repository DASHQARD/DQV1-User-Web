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
