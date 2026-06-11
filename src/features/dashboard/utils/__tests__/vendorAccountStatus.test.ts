import { describe, expect, it } from 'vitest'
import {
  canFetchVendorPaymentDetails,
  canManageVendorPaymentDetails,
  isVendorAccountApproved,
  isVendorPendingAdminApproval,
} from '../vendorAccountStatus'

const baseProfile = {
  user_type: 'vendor',
  status: 'inactive',
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

describe('isVendorAccountApproved', () => {
  it('returns false for inactive', () => {
    expect(isVendorAccountApproved('inactive')).toBe(false)
  })

  it('returns true for active, approved, and verified', () => {
    expect(isVendorAccountApproved('active')).toBe(true)
    expect(isVendorAccountApproved('approved')).toBe(true)
    expect(isVendorAccountApproved('verified')).toBe(true)
  })
})

describe('isVendorPendingAdminApproval', () => {
  it('is true when onboarding is complete but status is inactive', () => {
    expect(
      isVendorPendingAdminApproval(
        {
          ...baseProfile,
          onboarding_progress: {
            ...baseProfile.onboarding_progress,
            payment_details_completed: true,
          },
        } as any,
        true,
      ),
    ).toBe(true)
  })

  it('is false while signup onboarding and dashboard steps are incomplete', () => {
    expect(isVendorPendingAdminApproval(baseProfile as any, false)).toBe(false)
  })

  it('is true when API signup onboarding is complete but dashboard steps remain', () => {
    expect(
      isVendorPendingAdminApproval(
        {
          ...baseProfile,
          onboarding_progress: {
            ...baseProfile.onboarding_progress,
            onboarding_completed: true,
          },
        } as any,
        false,
      ),
    ).toBe(true)
  })

  it('is false when account is approved', () => {
    expect(
      isVendorPendingAdminApproval({ ...baseProfile, status: 'active' } as any, true),
    ).toBe(false)
  })
})

describe('canManageVendorPaymentDetails', () => {
  it('requires an approved vendor account', () => {
    expect(canManageVendorPaymentDetails(baseProfile as any)).toBe(false)
    expect(
      canManageVendorPaymentDetails({ ...baseProfile, status: 'verified' } as any),
    ).toBe(true)
    expect(canManageVendorPaymentDetails({ ...baseProfile, user_type: 'branch' } as any)).toBe(
      false,
    )
  })
})

describe('canFetchVendorPaymentDetails', () => {
  it('requires both saved payment and approved status', () => {
    expect(canFetchVendorPaymentDetails(baseProfile as any)).toBe(false)
    expect(
      canFetchVendorPaymentDetails({
        ...baseProfile,
        status: 'active',
        momo_accounts: [{ provider: 'mtn', momo_number: '024' }],
      } as any),
    ).toBe(true)
    expect(
      canFetchVendorPaymentDetails({
        ...baseProfile,
        status: 'inactive',
        momo_accounts: [{ provider: 'mtn', momo_number: '024' }],
      } as any),
    ).toBe(false)
  })
})
