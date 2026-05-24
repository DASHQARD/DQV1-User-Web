import type { UpdateBranchDetailsPayload } from '@/types'
import type { Branch } from '@/utils/schemas'

const PATCH_FIELDS = ['branch_name', 'branch_location', 'branch_phone', 'branch_email'] as const

type BranchDetailsField = (typeof PATCH_FIELDS)[number]

/** Build a partial PATCH body containing only fields that changed. */
export function buildBranchDetailsPatch(
  original: Branch | null | undefined,
  edited: Branch | null | undefined,
): UpdateBranchDetailsPayload {
  const payload: UpdateBranchDetailsPayload = {}

  for (const field of PATCH_FIELDS) {
    const originalValue = normalizeBranchField(original, field)
    const editedValue = normalizeBranchField(edited, field)
    if (editedValue !== originalValue) {
      payload[field] = editedValue
    }
  }

  return payload
}

function normalizeBranchField(
  branch: Branch | null | undefined,
  field: BranchDetailsField,
): string {
  const value = branch?.[field]
  return typeof value === 'string' ? value.trim() : ''
}
