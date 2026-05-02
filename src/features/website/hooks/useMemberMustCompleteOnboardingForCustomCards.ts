import { useAuthStore } from '@/stores'
import { useUserProfile } from '@/hooks'

type ProfileShape = {
  user_type?: string
  onboarding_progress?: {
    current_stage?: string
    personal_details_completed?: boolean
    onboarding_completed?: boolean
  }
}

/** Consumer accounts need personal-details stage satisfied; other roles use full onboarding. */
function isShoppingOnboardingSatisfied(profile: ProfileShape | null | undefined): boolean {
  const p = profile?.onboarding_progress
  if (!p) return false
  const userType = profile?.user_type
  if (userType === 'user') {
    return p.current_stage === 'personal_details' || p.personal_details_completed === true
  }
  return p.onboarding_completed === true
}

/**
 * Logged-in members (not guest OTP) must meet onboarding rules before:
 * custom DashPro/DashGo on /dashqards, assigning recipients on checkout / bag, etc.
 *
 * For `user_type === 'user'`, reaching `current_stage === 'personal_details'` (or having
 * `personal_details_completed`) is enough. Other user types still require `onboarding_completed`.
 */
export function useMemberMustCompleteOnboardingForCustomCards() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const { useGetUserProfileService } = useUserProfile()
  const { data: profile, isLoading, isFetching } = useGetUserProfileService()

  const isMemberAccount = isAuthenticated && !isGuestAuth
  const profilePending = isMemberAccount && profile == null && (isLoading || isFetching)
  const mustCompleteOnboarding =
    isMemberAccount &&
    !profilePending &&
    profile != null &&
    !isShoppingOnboardingSatisfied(profile as ProfileShape)

  /** True while we are still loading profile for a member (avoid flashing actions). */
  const recipientActionsBlocked = isMemberAccount && (profilePending || mustCompleteOnboarding)

  return { profilePending, mustCompleteOnboarding, recipientActionsBlocked }
}
