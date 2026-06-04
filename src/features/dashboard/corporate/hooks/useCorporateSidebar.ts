import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useBusinessLogoUrl, usePersistedModalState, useUserProfile } from '@/hooks'
import { useAuth } from '@/features/auth'
import { useAuthStore } from '@/stores'
import { MODALS, ROUTES } from '@/utils/constants'
import {
  countPendingRequestsForContext,
  parseRequestsListResponse,
} from '@/utils/requestStatus'
import { corporateQueries } from './useCorporateQueries'

export interface CorporateNavItem {
  path: string
  label: string
  icon: string
  disabled?: boolean
}

export interface CorporateNavSection {
  section: string
  items: CorporateNavItem[]
}

export function useCorporateSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout: clearAuthState } = useAuthStore()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation } = useLogoutService()

  const { useGetUserProfileService } = useUserProfile()
  const { data: user } = useGetUserProfileService()

  const { useGetAllVendorsManagementService, useGetRequestsCorporateService } = corporateQueries()
  const { data: allVendorsResponse } = useGetAllVendorsManagementService({ limit: 100 })
  const { data: requestsCorporateResponse } = useGetRequestsCorporateService({
    limit: 100,
  })

  const pendingRequestsCount = useMemo(() => {
    return countPendingRequestsForContext(
      parseRequestsListResponse(requestsCorporateResponse),
      'corporate',
    )
  }, [requestsCorporateResponse])

  const allVendorsCreatedByCorporate = useMemo(() => {
    if (!allVendorsResponse) return []
    return Array.isArray(allVendorsResponse?.data) ? allVendorsResponse.data : []
  }, [allVendorsResponse])

  const hasVendorsPendingVerification = useMemo(() => {
    return allVendorsCreatedByCorporate.some(
      (vendor: { approval_status?: string; status?: string }) => {
        const isApproved =
          vendor.approval_status === 'approved' || vendor.approval_status === 'auto_approved'
        const isActive = vendor.status === 'active'
        return !isApproved || !isActive
      },
    )
  }, [allVendorsCreatedByCorporate])

  const { url: logoUrl } = useBusinessLogoUrl(user)

  const vendorLogoUrls = useMemo(() => {
    const map: Record<number, string> = {}
    allVendorsCreatedByCorporate.forEach(
      (vendor: { vendor_logo?: string; vendor_id?: number; id?: number }) => {
        const vendorId = vendor.vendor_id ?? vendor.id
        if (vendor.vendor_logo && vendorId != null) map[vendorId] = vendor.vendor_logo
      },
    )
    return map
  }, [allVendorsCreatedByCorporate])

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const vendorAccountModal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT,
  })

  const displayName = user?.user_type

  const onboardingProgress = useMemo(() => {
    const isCorporateAdmin = user?.user_type === 'corporate admin'
    const hasProfileAndID = Boolean(
      user?.onboarding_progress?.personal_details_completed &&
        user?.onboarding_progress?.upload_id_completed,
    )
    const hasBusinessDetailsAndDocs = Boolean(
      user?.onboarding_progress?.business_details_completed &&
        user?.onboarding_progress?.business_documents_completed,
    )
    const completedCount = isCorporateAdmin
      ? hasProfileAndID
        ? 1
        : 0
      : (hasProfileAndID ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0)
    const totalCount = isCorporateAdmin ? 1 : 2
    return Math.round((completedCount / totalCount) * 100)
  }, [user?.onboarding_progress, user?.user_type])

  const isOnboardingComplete = onboardingProgress === 100
  const isApprovedOrVerified = user?.status === 'approved' || user?.status === 'verified'
  const canAccessRestrictedFeatures = isOnboardingComplete && isApprovedOrVerified
  const isCorporateAdmin = user?.user_type === 'corporate admin'
  const isStatusPending = user?.status === 'pending'

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path
    if (path === ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME) return location.pathname === path
    if (location.pathname === path) return true
    if (location.pathname.startsWith(path + '/')) {
      if (path === ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT) {
        return !location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH)
      }
      return true
    }
    return false
  }

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=corporate`
  }

  const getProcessedItems = (section: CorporateNavSection): CorporateNavItem[] => {
    const filtered = section.items.filter((item) => {
      if (
        (item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.NOTIFICATIONS) &&
        isCorporateAdmin
      ) {
        return false
      }
      return true
    })

    return filtered.map((item) => ({
      ...item,
      disabled:
        ((item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.RECIPIENTS) &&
          !canAccessRestrictedFeatures) ||
        ((item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS) &&
          !isOnboardingComplete) ||
        ((item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS ||
          item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS) &&
          !canAccessRestrictedFeatures) ||
        (item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS && isStatusPending),
    }))
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
    user,
    allVendorsCreatedByCorporate,
    hasVendorsPendingVerification,
    pendingRequestsCount,
    logoUrl,
    vendorLogoUrls,
    isCollapsed,
    setIsCollapsed,
    isPopoverOpen,
    setIsPopoverOpen,
    vendorAccountModal,
    displayName,
    onboardingProgress,
    isOnboardingComplete,
    isApprovedOrVerified,
    canAccessRestrictedFeatures,
    isCorporateAdmin,
    isActive,
    addAccountParam,
    getProcessedItems,
    logout,
    navigate,
  }
}
