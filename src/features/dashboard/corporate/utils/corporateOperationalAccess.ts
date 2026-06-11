type CorporateOnboardingProfile = {
  user_type?: string
  status?: string
  onboarding_progress?: {
    personal_details_completed?: boolean
    upload_id_completed?: boolean
    business_details_completed?: boolean
    business_documents_completed?: boolean
  }
}

/** Corporate management APIs (e.g. GET /vendor-management/all-vendors) require full onboarding + approval. */
export function isCorporateManagementApiEnabled(
  userProfile: CorporateOnboardingProfile | null | undefined,
): boolean {
  if (!userProfile) return false

  const userType = userProfile.user_type
  if (userType === 'branch' || userType === 'vendor' || userType === 'corporate_vendor') {
    return false
  }
  if (userType !== 'corporate super admin' && userType !== 'corporate admin') {
    return false
  }

  const progress = userProfile.onboarding_progress
  const hasProfileAndId = Boolean(
    progress?.personal_details_completed && progress?.upload_id_completed,
  )
  const hasBusinessDetailsAndDocs = Boolean(
    progress?.business_details_completed && progress?.business_documents_completed,
  )

  const onboardingComplete =
    userType === 'corporate admin'
      ? hasProfileAndId
      : hasProfileAndId && hasBusinessDetailsAndDocs

  const isApprovedOrVerified =
    userProfile.status === 'approved' || userProfile.status === 'verified'

  return onboardingComplete && isApprovedOrVerified
}
