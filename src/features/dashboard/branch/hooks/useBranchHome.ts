import React from 'react'
import { useUserProfile } from '@/hooks'
import { vendorQueries } from '@/features'
import { branchQueries } from './useBranchQueries'

const RECENT_REDEMPTIONS_LIMIT = 5

export function useBranchHome() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading: isLoadingUserProfile } = useGetUserProfileService()

  const { useGetBranchExperiencesService } = branchQueries()
  const { data: branchExperiencesResponse, isLoading: isLoadingBranchExperiences } =
    useGetBranchExperiencesService()

  const { useGetVendorCardCountsService } = vendorQueries()
  const { data: cardCountsData, isLoading: isLoadingCardCounts } = useGetVendorCardCountsService()

  const { useGetBranchRedemptionsService } = branchQueries()
  const { data: branchRedemptionsResponse, isLoading: isLoadingRedemptions } =
    useGetBranchRedemptionsService()

  const branchExperiences = React.useMemo(() => {
    if (!branchExperiencesResponse) return []
    return Array.isArray(branchExperiencesResponse?.data) ? branchExperiencesResponse.data : []
  }, [branchExperiencesResponse])

  const recentRedemptions = React.useMemo(() => {
    if (!branchRedemptionsResponse?.data) return []
    const redemptions = [...(branchRedemptionsResponse.data || [])]
    return redemptions
      .sort((a, b) => {
        const aRecord = a as unknown as Record<string, unknown>
        const bRecord = b as unknown as Record<string, unknown>
        const dateA = new Date(
          (aRecord.redemption_date || aRecord.created_at || a.updated_at || 0) as string | number,
        ).getTime()
        const dateB = new Date(
          (bRecord.redemption_date || bRecord.created_at || b.updated_at || 0) as string | number,
        ).getTime()
        return dateB - dateA
      })
      .slice(0, RECENT_REDEMPTIONS_LIMIT)
  }, [branchRedemptionsResponse])

  const addAccountParam = React.useCallback((path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=branch`
  }, [])

  const branchOnboardingProgress = React.useMemo(() => {
    const hasPersonalDetails =
      Boolean(userProfileData?.fullname) &&
      Boolean(userProfileData?.street_address) &&
      Boolean(userProfileData?.dob) &&
      Boolean(userProfileData?.id_type) &&
      Boolean(userProfileData?.id_number)

    const hasIDImages = Boolean(userProfileData?.id_images?.length)
    const hasPaymentDetails =
      Boolean(userProfileData?.momo_accounts?.length) ||
      Boolean(userProfileData?.bank_accounts?.length)

    return {
      hasPersonalDetails,
      hasIDImages,
      hasPersonalDetailsAndID: hasPersonalDetails && hasIDImages,
      hasPaymentDetails,
    }
  }, [userProfileData])

  const branchOnboardingComplete = React.useMemo(
    () =>
      branchOnboardingProgress.hasPersonalDetailsAndID &&
      branchOnboardingProgress.hasPaymentDetails,
    [branchOnboardingProgress],
  )

  const branchOnboardingSteps = React.useMemo(() => {
    const completed =
      (branchOnboardingProgress.hasPersonalDetailsAndID ? 1 : 0) +
      (branchOnboardingProgress.hasPaymentDetails ? 1 : 0)
    const total = 2
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    }
  }, [branchOnboardingProgress])

  const cardCounts = React.useMemo(() => {
    if (!cardCountsData) {
      return { DashX: 0, DashPass: 0, total: 0 }
    }
    const DashX = cardCountsData.DashX || 0
    const DashPass = cardCountsData.DashPass || 0
    return {
      DashX,
      DashPass,
      total: DashX + DashPass,
    }
  }, [cardCountsData])

  const metrics = React.useMemo(() => {
    const redemptions = (branchRedemptionsResponse?.data || []) as unknown as Array<
      Record<string, unknown>
    >
    const totalDashXRedeemed: number = redemptions
      .filter((r) => (r.card_type as string)?.toLowerCase() === 'dashx')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
    const totalDashPassRedeemed: number = redemptions
      .filter((r) => (r.card_type as string)?.toLowerCase() === 'dashpass')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
    const pendingPayout: number = redemptions
      .filter((r) => (r.status as string)?.toLowerCase() === 'pending')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)

    return {
      totalRedemptions: cardCounts.total,
      totalDashXRedeemed,
      totalDashPassRedeemed,
      pendingPayout,
    }
  }, [branchRedemptionsResponse, cardCounts])

  const isLoading =
    isLoadingUserProfile ||
    isLoadingBranchExperiences ||
    isLoadingRedemptions ||
    isLoadingCardCounts

  return {
    isLoading,
    isLoadingRedemptions,
    isLoadingBranchExperiences,
    branchExperiences,
    recentRedemptions,
    addAccountParam,
    branchOnboardingProgress,
    branchOnboardingComplete,
    branchOnboardingSteps,
    cardCounts,
    metrics,
  }
}
