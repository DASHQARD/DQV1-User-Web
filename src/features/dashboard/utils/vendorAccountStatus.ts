import type { UserProfileResponse } from '@/types/user'

import { hasVendorPaymentDetails } from './vendorOnboardingProgress'

export { hasVendorPaymentDetails } from './vendorOnboardingProgress'

/** Account statuses that allow full vendor dashboard and payout API access. */
export function isVendorAccountApproved(status?: string | null): boolean {
  const normalized = String(status ?? '').toLowerCase()
  return normalized === 'active' || normalized === 'approved' || normalized === 'verified'
}

/**
 * Vendor account is waiting on DashQard admin activation.
 * True when signup/compliance onboarding is done (API `onboarding_completed`) or all
 * dashboard setup steps are done, and `status` is not yet active/approved/verified.
 */
export function isVendorPendingAdminApproval(
  userProfile: UserProfileResponse | null | undefined,
  isDashboardOnboardingComplete = false,
): boolean {
  if (!userProfile || userProfile.user_type === 'branch') return false
  if (isVendorAccountApproved(userProfile.status)) return false

  const apiSignupOnboardingComplete = Boolean(
    userProfile.onboarding_progress?.onboarding_completed,
  )

  return apiSignupOnboardingComplete || isDashboardOnboardingComplete
}

/** GET /payment-details — only when payout info exists and the account is approved. */
export function canFetchVendorPaymentDetails(
  userProfile: UserProfileResponse | null | undefined,
): boolean {
  return hasVendorPaymentDetails(userProfile) && isVendorAccountApproved(userProfile?.status)
}
