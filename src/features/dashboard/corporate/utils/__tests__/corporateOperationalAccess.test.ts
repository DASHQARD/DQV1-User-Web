import { describe, expect, it } from 'vitest'

import { isCorporateManagementApiEnabled } from '../corporateOperationalAccess'

describe('isCorporateManagementApiEnabled', () => {
  it('returns false for incomplete corporate super admin onboarding', () => {
    expect(
      isCorporateManagementApiEnabled({
        user_type: 'corporate super admin',
        status: 'pending',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
          business_details_completed: false,
          business_documents_completed: false,
        },
      }),
    ).toBe(false)
  })

  it('returns true when corporate super admin onboarding is complete and approved', () => {
    expect(
      isCorporateManagementApiEnabled({
        user_type: 'corporate super admin',
        status: 'approved',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
          business_details_completed: true,
          business_documents_completed: true,
        },
      }),
    ).toBe(true)
  })

  it('returns true for onboarded corporate admin with profile and id only', () => {
    expect(
      isCorporateManagementApiEnabled({
        user_type: 'corporate admin',
        status: 'verified',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
        },
      }),
    ).toBe(true)
  })
})
