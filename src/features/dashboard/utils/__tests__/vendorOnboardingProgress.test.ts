import { describe, it, expect } from 'vitest'
import {
  getVendorOnboardingProgress,
  hasVendorPaymentDetails,
  isVendorNavItemDisabled,
  isVendorPathBlocked,
  isVendorSettingsDisabled,
} from '../vendorOnboardingProgress'
import { ROUTES } from '@/utils/constants'

const baseProfile = {
  onboarding_progress: {
    personal_details_completed: true,
    upload_id_completed: true,
    business_details_completed: true,
    business_documents_completed: true,
    payment_details_completed: false,
  },
  momo_accounts: [],
  bank_accounts: [],
} as const

describe('hasVendorPaymentDetails', () => {
  it('is false when profile has no payment accounts or flag', () => {
    expect(hasVendorPaymentDetails(baseProfile as any)).toBe(false)
  })

  it('is true when payment_details_completed is set', () => {
    expect(
      hasVendorPaymentDetails({
        ...baseProfile,
        onboarding_progress: {
          ...baseProfile.onboarding_progress,
          payment_details_completed: true,
        },
      } as any),
    ).toBe(true)
  })
})

describe('getVendorOnboardingProgress', () => {
  it('locks payment until the vendor account is verified', () => {
    const result = getVendorOnboardingProgress({
      userProfile: { ...baseProfile, status: 'inactive' } as any,
      branchesCount: 0,
      isCorporateSwitchedToVendor: false,
    })
    expect(result.nextStep).toBeNull()
    expect(result.steps.find((step) => step.id === 'payment')?.locked).toBe(true)
  })

  it('uses 4 steps for regular vendors including payment details when verified', () => {
    const result = getVendorOnboardingProgress({
      userProfile: { ...baseProfile, status: 'verified' } as any,
      branchesCount: 0,
      isCorporateSwitchedToVendor: false,
    })
    expect(result.totalCount).toBe(4)
    expect(result.completedCount).toBe(2)
    expect(result.progressPercentage).toBe(50)
    expect(result.nextStep?.id).toBe('payment')
    const pending = result.steps.filter((s) => !s.completed).map((s) => s.id)
    expect(pending).toEqual(['payment', 'branch'])
  })

  it('uses 4 steps for corporate super admin switched to vendor when verified', () => {
    const result = getVendorOnboardingProgress({
      userProfile: { ...baseProfile, status: 'verified' } as any,
      branchesCount: 0,
      isCorporateSwitchedToVendor: true,
    })
    expect(result.totalCount).toBe(4)
    expect(result.completedCount).toBe(2)
    expect(result.progressPercentage).toBe(50)
    expect(result.nextStep?.id).toBe('payment')
    const pending = result.steps.filter((s) => !s.completed).map((s) => s.id)
    expect(pending).toEqual(['payment', 'branch'])
  })

  it('is 100% when all steps are complete', () => {
    const result = getVendorOnboardingProgress({
      userProfile: {
        ...baseProfile,
        onboarding_progress: {
          ...baseProfile.onboarding_progress,
          payment_details_completed: true,
        },
      } as any,
      branchesCount: 1,
      isCorporateSwitchedToVendor: true,
    })
    expect(result.progressPercentage).toBe(100)
    expect(result.isComplete).toBe(true)
  })
})

describe('vendor nav access', () => {
  it('blocks branches until first branch exists', () => {
    expect(
      isVendorNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES, {
        isOnboardingComplete: false,
        hasFirstBranch: false,
      }),
    ).toBe(true)
    expect(
      isVendorNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES, {
        isOnboardingComplete: false,
        hasFirstBranch: true,
      }),
    ).toBe(false)
  })

  it('blocks operational nav until onboarding is complete', () => {
    expect(
      isVendorNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE, {
        isOnboardingComplete: false,
        hasFirstBranch: true,
      }),
    ).toBe(true)
    expect(
      isVendorNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE, {
        isOnboardingComplete: true,
        hasFirstBranch: true,
      }),
    ).toBe(false)
  })

  it('blocks settings until onboarding is complete', () => {
    expect(isVendorSettingsDisabled({ isOnboardingComplete: false })).toBe(true)
    expect(isVendorSettingsDisabled({ isOnboardingComplete: true })).toBe(false)
  })

  it('blocks experience sub-routes until onboarding is complete', () => {
    expect(
      isVendorPathBlocked('/dashboard/vendor/experience/overview', {
        isOnboardingComplete: false,
        hasFirstBranch: true,
      }),
    ).toBe(true)
  })

  it('allows compliance routes during onboarding', () => {
    expect(
      isVendorPathBlocked('/dashboard/vendor/compliance/profile', {
        isOnboardingComplete: false,
        hasFirstBranch: false,
      }),
    ).toBe(false)
  })
})
