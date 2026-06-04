import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useBusinessLogoUrl, usePresignedMediaUrl, useUserProfile } from '@/hooks'
import { getBusinessLogoFileKey } from '@/utils/businessLogo'
import { useAuth } from '@/features/auth'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import {
  getVendorOnboardingProgress,
  isVendorNavItemDisabled,
  isVendorSettingsDisabled,
} from '@/features/dashboard/utils/vendorOnboardingProgress'
import { useVendorOperationalAccess } from '@/features/dashboard/hooks/useVendorOperationalAccess'
import { useVendorPendingApprovalsCount } from '@/features/dashboard/hooks/useVendorPendingApprovalsCount'
import { vendorQueries } from './useVendorQueries'

export function useVendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { logout: clearAuthState, user } = useAuthStore()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation } = useLogoutService()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { isOperationalAccessEnabled } = useVendorOperationalAccess()

  const userType = (user as { user_type?: string })?.user_type || userProfileData?.user_type
  const isVendor = userType === 'vendor'
  const displayName = 'Vendor'

  const { useBranchesService, useGetAllVendorsDetailsService } = vendorQueries()
  const { data: branches } = useBranchesService()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()

  const currentVendorId = searchParams.get('vendor_id')
  const isCorporateSuperAdminForRequests = userType === 'corporate super admin'

  const { pendingCount: pendingRequestsCount } = useVendorPendingApprovalsCount()

  const branchesArray = Array.isArray(branches)
    ? branches
    : (branches as { data?: unknown[] })?.data || []

  const vendorsCreatedByCorporate = useMemo(() => {
    const vendorsData = Array.isArray(allVendorsDetails)
      ? allVendorsDetails
      : (allVendorsDetails as { data?: unknown[] })?.data || []
    return (vendorsData as { corporate_user_id?: string; approval_status?: string }[]).filter(
      (vendor) =>
        vendor.corporate_user_id === userProfileData?.id &&
        vendor.approval_status === 'auto_approved',
    )
  }, [allVendorsDetails, userProfileData?.id])

  const canAccessCorporate = useMemo(() => {
    if (userType === 'corporate_vendor' || userType === 'corporate super admin') return true
    if (userProfileData?.corporate_id) return true
    if (vendorsCreatedByCorporate && vendorsCreatedByCorporate.length > 0) return true
    return false
  }, [userType, userProfileData?.corporate_id, vendorsCreatedByCorporate])

  const corporateBusiness = userProfileData?.business_details?.[0]
  const corporateName = corporateBusiness?.name || 'Corporate Account'
  const corporateId = userProfileData?.corporate_id_from_business || ''

  const isCorporateSuperAdmin = isCorporateSuperAdminForRequests

  const isCorporateSwitchedToVendor = isCorporateSuperAdmin && Boolean(currentVendorId)

  const vendorOnboarding = useMemo(() => {
    return getVendorOnboardingProgress({
      userProfile: userProfileData,
      branchesCount: branchesArray.length,
      isBranchManager: userType === 'branch',
      isCorporateSwitchedToVendor,
    })
  }, [userProfileData, branchesArray.length, userType, isCorporateSwitchedToVendor])

  const discoveryScore = vendorOnboarding.progressPercentage
  const hasFirstBranch = branchesArray.length > 0

  const getIsNavItemDisabled = useCallback(
    (path: string) =>
      isVendorNavItemDisabled(path, {
        isOnboardingComplete: vendorOnboarding.isComplete,
        hasFirstBranch,
      }),
    [vendorOnboarding.isComplete, hasFirstBranch],
  )

  const isSettingsDisabled = isVendorSettingsDisabled({
    isOnboardingComplete: vendorOnboarding.isComplete,
  })

  const currentVendor = useMemo(() => {
    if (!currentVendorId || vendorsCreatedByCorporate.length === 0) return null
    return (
      (vendorsCreatedByCorporate as { vendor_id?: number; id?: number }[]).find(
        (vendor) =>
          String(vendor.vendor_id) === currentVendorId || String(vendor.id) === currentVendorId,
      ) ?? null
    )
  }, [currentVendorId, vendorsCreatedByCorporate])

  const { url: logoUrl } = useBusinessLogoUrl(userProfileData, {
    enabled: isOperationalAccessEnabled,
  })

  const vendorLogoUrls = useMemo(() => {
    const map: Record<number, string> = {}
    ;(vendorsCreatedByCorporate as { vendor_logo?: string; vendor_id?: number }[]).forEach(
      (vendor) => {
        if (vendor.vendor_logo && vendor.vendor_id != null) map[vendor.vendor_id] = vendor.vendor_logo
      },
    )
    return map
  }, [vendorsCreatedByCorporate])

  const currentVendorLogoKey = useMemo(() => {
    const vendorLogo = (currentVendor as { vendor_logo?: string })?.vendor_logo
    return vendorLogo || getBusinessLogoFileKey(userProfileData)
  }, [currentVendor, userProfileData])

  const { url: currentVendorLogoUrl } = usePresignedMediaUrl(currentVendorLogoKey, {
    enabled: isOperationalAccessEnabled,
  })

  const vendorsToSwitchTo = useMemo(() => {
    if (!currentVendorId) return vendorsCreatedByCorporate
    return (vendorsCreatedByCorporate as { vendor_id?: number; id?: number }[]).filter(
      (vendor) =>
        String(vendor.vendor_id) !== currentVendorId && String(vendor.id) !== currentVendorId,
    )
  }, [vendorsCreatedByCorporate, currentVendorId])

  const vendorName = useMemo(() => {
    const v = currentVendor as { vendor_name?: string; business_name?: string } | null
    return (
      v?.vendor_name ||
      v?.business_name ||
      userProfileData?.business_details?.[0]?.name ||
      'Vendor Account'
    )
  }, [currentVendor, userProfileData?.business_details])
  const vendorGvid = (currentVendor as { gvid?: string })?.gvid || ''

  const [isBranchesExpanded, setIsBranchesExpanded] = useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path
    if (location.pathname === path) return true
    if (path === ROUTES.IN_APP.DASHBOARD.VENDOR.HOME) {
      return location.pathname === path || location.pathname === '/dashboard/vendor'
    }
    if (path === ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES) {
      return location.pathname.startsWith(path + '/') || location.pathname === path
    }
    if (location.pathname.startsWith(path + '/')) {
      if (path === ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT) {
        return !location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH)
      }
      return true
    }
    return false
  }

  const isBranchActive = (branchId: string) => {
    return location.pathname === `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branchId}`
  }

  useEffect(() => {
    if (location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES + '/')) {
      setIsBranchesExpanded(true)
    }
  }, [location.pathname])

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  const handleSwitchToVendor = (vendorId: string | number) => {
    setIsPopoverOpen(false)
    navigate(
      `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor${vendorId ? `&vendor_id=${vendorId}` : ''}`,
    )
  }

  const logout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        clearAuthState()
        navigate(ROUTES.IN_APP.HOME, { replace: true })
      },
    })
  }

  return {
    location,
    navigate,
    logout,
    isCollapsed,
    setIsCollapsed,
    isPopoverOpen,
    setIsPopoverOpen,
    logoUrl,
    currentVendorLogoUrl,
    vendorLogoUrls,
    userType,
    isVendor,
    displayName,
    corporateName,
    corporateId,
    vendorsCreatedByCorporate,
    vendorsToSwitchTo,
    currentVendorId,
    currentVendor,
    vendorName,
    vendorGvid,
    branchesArray,
    discoveryScore,
    vendorOnboarding,
    getIsNavItemDisabled,
    isSettingsDisabled,
    canAccessCorporate,
    pendingRequestsCount,
    isBranchesExpanded,
    setIsBranchesExpanded,
    isActive,
    isBranchActive,
    addAccountParam,
    handleSwitchToVendor,
  }
}
