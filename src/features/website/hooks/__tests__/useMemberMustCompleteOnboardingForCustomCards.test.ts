import { describe, it, expect } from 'vitest'
import { isShoppingOnboardingSatisfied } from '../useMemberMustCompleteOnboardingForCustomCards'

describe('isShoppingOnboardingSatisfied', () => {
  it('allows consumer user when personal details are completed', () => {
    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'user',
        onboarding_progress: { personal_details_completed: true },
      }),
    ).toBe(true)
  })

  it('allows approved corporate super admin when required steps are completed even if onboarding_completed is false', () => {
    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'corporate super admin',
        status: 'approved',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
          business_details_completed: true,
          business_documents_completed: true,
          onboarding_completed: false,
        },
      }),
    ).toBe(true)
  })

  it('blocks corporate super admin when not approved', () => {
    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'corporate super admin',
        status: 'pending',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
          business_details_completed: true,
          business_documents_completed: true,
          onboarding_completed: false,
        },
      }),
    ).toBe(false)
  })

  it('blocks corporate super admin when business documents are incomplete', () => {
    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'corporate super admin',
        status: 'approved',
        onboarding_progress: {
          personal_details_completed: true,
          upload_id_completed: true,
          business_details_completed: true,
          business_documents_completed: false,
          onboarding_completed: false,
        },
      }),
    ).toBe(false)
  })

  it('requires onboarding_completed for other user types', () => {
    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'vendor',
        status: 'approved',
        onboarding_progress: { onboarding_completed: false },
      }),
    ).toBe(false)

    expect(
      isShoppingOnboardingSatisfied({
        user_type: 'vendor',
        status: 'approved',
        onboarding_progress: { onboarding_completed: true },
      }),
    ).toBe(true)
  })
})
