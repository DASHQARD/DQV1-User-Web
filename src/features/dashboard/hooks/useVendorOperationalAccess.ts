import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { useUserProfile } from '@/hooks'
import {
  getBranchOnboardingProgress,
  isBranchOnboardingComplete,
} from '@/features/dashboard/branch/utils/branchOnboardingProgress'
import { getCorporateBranchesByVendorId } from '@/features/dashboard/corporate/services'
import { getBranchesByVendorId } from '@/features/dashboard/vendor/services/branches'
import { isVendorAccountApproved } from '@/features/dashboard/utils/vendorAccountStatus'
import { getVendorOnboardingProgress } from '@/features/dashboard/utils/vendorOnboardingProgress'

/** Whether vendor/branch operational APIs (counts, cards, requests, redemptions) may run. */
export function useVendorOperationalAccess() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfile, isLoading: isLoadingProfile } = useGetUserProfileService()

  const userType = userProfile?.user_type
  const isBranchManager = userType === 'branch'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const isCorporateSwitchedToVendor = isCorporateSuperAdmin && Boolean(vendorIdFromUrl)
  const vendorId = userProfile?.vendor_id ? String(userProfile.vendor_id) : null

  const { data: vendorBranches, isLoading: isLoadingVendorBranches } = useQuery({
    queryKey: ['branches-by-vendor-id', vendorId, false],
    queryFn: () => getBranchesByVendorId(vendorId!, false),
    enabled: !!vendorId && userType === 'vendor',
  })

  const { data: corporateBranchesByVendor, isLoading: isLoadingCorporateBranches } = useQuery({
    queryKey: ['corporate-branches-by-vendor', vendorIdFromUrl],
    queryFn: () => getCorporateBranchesByVendorId(vendorIdFromUrl!),
    enabled: isCorporateSwitchedToVendor && !!vendorIdFromUrl,
  })

  const branchesCount = useMemo(() => {
    const source = isCorporateSwitchedToVendor ? corporateBranchesByVendor : vendorBranches
    if (!source) return 0
    const list = Array.isArray(source) ? source : (source as { data?: unknown[] })?.data || []
    return list.length
  }, [isCorporateSwitchedToVendor, corporateBranchesByVendor, vendorBranches])

  const isOnboardingComplete = useMemo(() => {
    if (!userProfile) return false
    if (isBranchManager) {
      return isBranchOnboardingComplete(getBranchOnboardingProgress(userProfile))
    }
    return getVendorOnboardingProgress({
      userProfile,
      branchesCount,
      isBranchManager: false,
      isCorporateSwitchedToVendor,
    }).isComplete
  }, [userProfile, branchesCount, isBranchManager, isCorporateSwitchedToVendor])

  const isAccountApproved = isVendorAccountApproved(userProfile?.status)
  const isPendingAdminApproval =
    Boolean(userProfile) &&
    !isAccountApproved &&
    (Boolean(userProfile?.onboarding_progress?.onboarding_completed) || isOnboardingComplete)

  const isOperationalAccessEnabled =
    Boolean(userProfile) && isOnboardingComplete && isAccountApproved

  const isLoading =
    isLoadingProfile ||
    (userType === 'vendor' && isLoadingVendorBranches) ||
    (isCorporateSwitchedToVendor && isLoadingCorporateBranches)

  return {
    isOperationalAccessEnabled,
    isOnboardingComplete,
    isAccountApproved,
    isPendingAdminApproval,
    isLoading,
    userProfile,
    userType,
    isBranchManager,
    isCorporateSuperAdmin,
    isCorporateSwitchedToVendor,
  }
}
