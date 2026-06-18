import { describe, expect, it } from 'vitest'
import {
  getBranchRecordId,
  resolveBranchManagerBranchId,
} from '@/features/dashboard/utils/experienceBranchOptions'

describe('getBranchRecordId', () => {
  it('prefers id then branch_id', () => {
    expect(getBranchRecordId({ id: 'uuid-1', branch_id: 'legacy-1' })).toBe('uuid-1')
    expect(getBranchRecordId({ branch_id: 'legacy-1' })).toBe('legacy-1')
    expect(getBranchRecordId({})).toBe('')
  })
})

describe('resolveBranchManagerBranchId', () => {
  it('prefers branch info over profile', () => {
    expect(
      resolveBranchManagerBranchId(
        { id: 'from-info' },
        [{ id: 'from-profile' }],
      ),
    ).toBe('from-info')
  })

  it('falls back to profile branches', () => {
    expect(resolveBranchManagerBranchId(null, [{ id: 'from-profile' }])).toBe('from-profile')
  })
})
