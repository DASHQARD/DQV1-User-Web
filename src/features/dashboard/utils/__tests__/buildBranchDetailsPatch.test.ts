import { describe, expect, it } from 'vitest'
import { buildBranchDetailsPatch } from '../buildBranchDetailsPatch'
import type { Branch } from '@/utils/schemas'

const baseBranch = {
  id: '1',
  branch_name: 'Main',
  branch_location: 'Accra',
  branch_phone: '+233200000000',
  branch_email: 'branch@example.com',
} as Branch

describe('buildBranchDetailsPatch', () => {
  it('returns only changed fields', () => {
    expect(
      buildBranchDetailsPatch(baseBranch, {
        ...baseBranch,
        branch_location: 'Kumasi',
      }),
    ).toEqual({ branch_location: 'Kumasi' })
  })

  it('returns empty object when nothing changed', () => {
    expect(buildBranchDetailsPatch(baseBranch, baseBranch)).toEqual({})
  })
})
