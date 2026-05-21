import { describe, expect, it } from 'vitest'
import {
  getBranchOnboardingDiscoveryScore,
  getBranchOnboardingProgress,
  isBranchOnboardingComplete,
} from '../branchOnboardingProgress'

describe('branchOnboardingProgress', () => {
  it('is incomplete when only payment details exist', () => {
    const progress = getBranchOnboardingProgress({
      momo_accounts: [{ number: '024' }],
    })
    expect(progress.hasPaymentDetails).toBe(true)
    expect(progress.hasPersonalDetailsAndID).toBe(false)
    expect(isBranchOnboardingComplete(progress)).toBe(false)
    expect(getBranchOnboardingDiscoveryScore(progress)).toBe(50)
  })

  it('is complete when personal details, ID, and payment exist', () => {
    const progress = getBranchOnboardingProgress({
      fullname: 'Jane Doe',
      street_address: '1 Main St',
      dob: '1990-01-01',
      id_type: 'passport',
      id_number: 'P123',
      id_images: [{ file_url: 'uploads/id.jpg' }],
      bank_accounts: [{ account_number: '123' }],
    })
    expect(isBranchOnboardingComplete(progress)).toBe(true)
    expect(getBranchOnboardingDiscoveryScore(progress)).toBe(100)
  })
})
