/** Branch manager onboarding — must match BranchHome dashboard steps. */
export type BranchOnboardingProgress = {
  hasPersonalDetails: boolean
  hasIDImages: boolean
  hasPersonalDetailsAndID: boolean
  hasPaymentDetails: boolean
}

export function getBranchOnboardingProgress(
  userProfileData: Record<string, unknown> | null | undefined,
): BranchOnboardingProgress {
  const hasPersonalDetails =
    Boolean(userProfileData?.fullname) &&
    Boolean(userProfileData?.street_address) &&
    Boolean(userProfileData?.dob) &&
    Boolean(userProfileData?.id_type) &&
    Boolean(userProfileData?.id_number)

  const idImages = userProfileData?.id_images
  const hasIDImages = Array.isArray(idImages) && idImages.length > 0

  const momoAccounts = userProfileData?.momo_accounts
  const bankAccounts = userProfileData?.bank_accounts
  const hasPaymentDetails =
    (Array.isArray(momoAccounts) && momoAccounts.length > 0) ||
    (Array.isArray(bankAccounts) && bankAccounts.length > 0)

  return {
    hasPersonalDetails,
    hasIDImages,
    hasPersonalDetailsAndID: hasPersonalDetails && hasIDImages,
    hasPaymentDetails,
  }
}

export function isBranchOnboardingComplete(progress: BranchOnboardingProgress): boolean {
  return progress.hasPersonalDetailsAndID && progress.hasPaymentDetails
}

export function getBranchOnboardingDiscoveryScore(progress: BranchOnboardingProgress): number {
  const steps = [progress.hasPersonalDetailsAndID, progress.hasPaymentDetails]
  const completedCount = steps.filter(Boolean).length
  return Math.round((completedCount / steps.length) * 100)
}
