import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { vendorQueries } from '@/features/dashboard/vendor'
import { useUserProfile, usePersistedModalState } from '@/hooks'
import { ROUTES, MODALS } from '@/utils/constants'

import { useDashboardMetrics } from './useDashboardMetrics'

export function useCorporateHome() {
  const { metrics, formatCurrency, isLoading } = useDashboardMetrics()
  const navigate = useNavigate()
  const { useGetUserProfileService } = useUserProfile()
  const {
    data: userProfileData,
    isLoading: isUserProfileLoading,
    isFetching: isUserProfileFetching,
  } = useGetUserProfileService()
  const { useGetAllVendorsDetailsService } = vendorQueries()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()
  const vendorAccountModal = usePersistedModalState<{ user?: unknown }>({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT,
  })

  const myVendorAccounts = useMemo(() => {
    const vendorsData = Array.isArray(allVendorsDetails)
      ? allVendorsDetails
      : ((allVendorsDetails as { data?: unknown[] })?.data ?? [])
    return vendorsData.filter(
      (v: { corporate_user_id?: number }) => v.corporate_user_id === userProfileData?.id,
    ) as Array<{
      id?: number
      vendor_name?: string
      business_name?: string
      approval_status?: string
      status?: string
    }>
  }, [allVendorsDetails, userProfileData?.id])

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=corporate`
  }

  const isCorporateAdmin = userProfileData?.user_type === 'corporate admin'
  const isOnboardingStatusLoading =
    (isUserProfileLoading || isUserProfileFetching) && !userProfileData

  const onboardingProgress = {
    hasProfile: Boolean(userProfileData?.onboarding_progress?.personal_details_completed),
    hasID: Boolean(userProfileData?.onboarding_progress?.upload_id_completed),
    hasProfileAndID: Boolean(
      userProfileData?.onboarding_progress?.personal_details_completed &&
        userProfileData?.onboarding_progress?.upload_id_completed,
    ),
    hasBusinessDetails: Boolean(userProfileData?.onboarding_progress?.business_details_completed),
    hasBusinessDocs: Boolean(userProfileData?.onboarding_progress?.business_documents_completed),
    hasBusinessDetailsAndDocs: Boolean(
      userProfileData?.onboarding_progress?.business_details_completed &&
        userProfileData?.onboarding_progress?.business_documents_completed,
    ),
  }

  const { hasProfileAndID, hasBusinessDetailsAndDocs } = onboardingProgress

  const completedCount = isCorporateAdmin
    ? hasProfileAndID
      ? 1
      : 0
    : (hasProfileAndID ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0)
  const totalCount = isCorporateAdmin ? 1 : 2
  const progressPercentage = (completedCount / totalCount) * 100
  const isComplete = completedCount === totalCount

  const userStatus = userProfileData?.status
  const isPendingAndKYCComplete = userStatus === 'pending' && isComplete

  const isOnboardingComplete = progressPercentage === 100
  const isApprovedOrVerified = userStatus === 'approved' || userStatus === 'verified'
  const canAccessRestrictedFeatures = isOnboardingComplete && isApprovedOrVerified

  const getNextIncompleteStep = () => {
    if (!hasProfileAndID) {
      return ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.PROFILE_INFORMATION
    }
    if (isCorporateAdmin) {
      return ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.ROOT
    }
    if (!hasBusinessDetailsAndDocs) {
      return ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.BUSINESS_DETAILS
    }
    return ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.ROOT
  }

  const handleContinue = () => {
    const nextStep = getNextIncompleteStep()
    navigate(addAccountParam(nextStep))
  }

  const getNextStepName = () => {
    if (!hasProfileAndID) return 'Profile Information & ID Upload'
    if (isCorporateAdmin) return null
    if (!hasBusinessDetailsAndDocs) return 'Business Details & Documents'
    return null
  }

  const navigateToProfileStep = () => {
    navigate(addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.PROFILE_INFORMATION))
  }

  const navigateToBusinessStep = () => {
    navigate(addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.BUSINESS_DETAILS))
  }

  const openCreateVendorAccount = () => {
    vendorAccountModal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT, {
      user: userProfileData,
    })
  }

  /** For UX: 'incomplete' | 'pending_approval' | 'full_access' to drive status banner messaging */
  const accountStatusBanner: 'incomplete' | 'pending_approval' | 'full_access' = !isComplete
    ? 'incomplete'
    : !isApprovedOrVerified
      ? 'pending_approval'
      : 'full_access'

  return {
    metrics,
    formatCurrency,
    isLoading,
    isOnboardingStatusLoading,
    isCorporateAdmin,
    onboardingProgress: {
      ...onboardingProgress,
      hasProfileAndID,
      hasBusinessDetailsAndDocs,
    },
    completedCount,
    totalCount,
    progressPercentage,
    isComplete,
    isPendingAndKYCComplete,
    canAccessRestrictedFeatures,
    accountStatusBanner,
    userStatus,
    handleContinue,
    getNextStepName,
    navigateToProfileStep,
    navigateToBusinessStep,
    openCreateVendorAccount,
    myVendorAccounts,
  }
}
