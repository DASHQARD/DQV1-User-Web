import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useBusinessLogoUrl, usePresignedMediaUrl, useUserProfile } from '@/hooks'
import { getBusinessLogoFileKey } from '@/utils/businessLogo'
import { useAuth } from '@/features/auth'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { corporateQueries } from './useCorporateQueries'

export function useCorporateVendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout: clearAuthState, user } = useAuthStore()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation } = useLogoutService()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const {
    useGetAllVendorsManagementService,
    useGetCorporateBranchesListService,
    useGetCorporateBranchesByVendorIdService,
    useGetCorporatePaymentsService,
  } = corporateQueries()
  const { data: allVendorsResponse } = useGetAllVendorsManagementService({ limit: 100 })

  const allVendorsCreatedByCorporate = useMemo(() => {
    if (!allVendorsResponse) return []
    return Array.isArray(allVendorsResponse?.data) ? allVendorsResponse.data : []
  }, [allVendorsResponse])

  const hasVendorsPendingVerification = useMemo(() => {
    return (
      allVendorsCreatedByCorporate as Array<{
        approval_status?: string
        status?: string
      }>
    ).some((vendor) => {
      const isApproved =
        vendor.approval_status === 'approved' || vendor.approval_status === 'auto_approved'
      const isActive = vendor.status === 'active'
      return !isApproved || !isActive
    })
  }, [allVendorsCreatedByCorporate])

  const currentVendorId = searchParams.get('vendor_id')
  const currentVendor = useMemo(() => {
    if (!currentVendorId || allVendorsCreatedByCorporate.length === 0) return null
    return (
      allVendorsCreatedByCorporate.find(
        (vendor: { vendor_id?: number; id?: number }) =>
          String(vendor.vendor_id) === currentVendorId || String(vendor.id) === currentVendorId,
      ) ?? null
    )
  }, [currentVendorId, allVendorsCreatedByCorporate])

  const { url: logoUrl } = useBusinessLogoUrl(userProfileData)

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

  const currentVendorLogoKey = useMemo(() => {
    const vendorLogo = currentVendor && (currentVendor as { vendor_logo?: string }).vendor_logo
    return vendorLogo || getBusinessLogoFileKey(userProfileData)
  }, [currentVendor, userProfileData])

  const { url: currentVendorLogoUrl } = usePresignedMediaUrl(currentVendorLogoKey)

  const userType = (user as { user_type?: string })?.user_type || userProfileData?.user_type
  const isVendor = userType === 'vendor'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const displayName = 'Vendor'

  const { data: corporateBranchesList } = useGetCorporateBranchesListService()
  const { data: corporateBranchesByVendor } = useGetCorporateBranchesByVendorIdService(
    currentVendorId ?? null,
  )
  useGetCorporatePaymentsService()

  const corporateBranches = currentVendorId ? corporateBranchesByVendor : corporateBranchesList
  console.log('corporateBranches', corporateBranches)
  const branchesArray = useMemo(() => {
    if (!corporateBranches) return []
    return Array.isArray(corporateBranches)
      ? corporateBranches
      : (corporateBranches as { data?: unknown[] })?.data || []
  }, [corporateBranches])

  const discoveryScore = useMemo(() => {
    const progress = userProfileData?.onboarding_progress
    if (!progress) return 0
    const hasProfileAndID = progress.personal_details_completed && progress.upload_id_completed
    const hasBusinessDetailsAndDocs =
      progress.business_details_completed && progress.business_documents_completed
    const hasBranches = branchesArray.length > 0
    const completedCount =
      (hasProfileAndID ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0) + (hasBranches ? 1 : 0)
    return Math.round((completedCount / 3) * 100)
  }, [userProfileData?.onboarding_progress, branchesArray.length])

  const canAccessCorporate = useMemo(() => {
    if (userType === 'corporate_vendor' || userType === 'corporate super admin') return true
    if (userProfileData?.corporate_id) return true
    return false
  }, [userType, userProfileData?.corporate_id])

  const corporateBusiness = userProfileData?.business_details?.[0]
  const corporateName = corporateBusiness?.name || 'Corporate Account'

  const vendorName = useMemo(() => {
    if (currentVendor) {
      return (
        (currentVendor as { vendor_name?: string; business_name?: string }).vendor_name ||
        (currentVendor as { vendor_name?: string; business_name?: string }).business_name ||
        'Vendor Account'
      )
    }
    return userProfileData?.business_details?.[0]?.name || 'Vendor Account'
  }, [currentVendor, userProfileData?.business_details])
  const vendorGvid = (currentVendor as { gvid?: string })?.gvid ?? ''

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
    const base = `${path}${separator}account=vendor`
    return currentVendorId ? `${base}&vendor_id=${currentVendorId}` : base
  }

  const handleSwitchToVendor = (vendorId: string | number) => {
    setIsPopoverOpen(false)
    const isAlreadyOnVendorView =
      searchParams.get('account') === 'vendor' &&
      location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.VENDOR.HOME)
    if (isAlreadyOnVendorView) {
      const next = new URLSearchParams(searchParams)
      next.set('vendor_id', String(vendorId))
      setSearchParams(next, { replace: true })
    } else {
      navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor&vendor_id=${vendorId}`)
    }
  }

  const logout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        clearAuthState()
      },
    })
  }

  return {
    location,
    navigate,
    searchParams,
    logout,
    isCollapsed,
    setIsCollapsed,
    isPopoverOpen,
    setIsPopoverOpen,
    logoUrl,
    currentVendorLogoUrl,
    allVendorsCreatedByCorporate,
    hasVendorsPendingVerification,
    currentVendorId,
    currentVendor,
    vendorLogoUrls,
    userType,
    isVendor,
    isCorporateSuperAdmin,
    displayName,
    corporateName,
    vendorName,
    vendorGvid,
    branchesArray,
    discoveryScore,
    canAccessCorporate,
    isBranchesExpanded,
    setIsBranchesExpanded,
    isActive,
    isBranchActive,
    addAccountParam,
    handleSwitchToVendor,
  }
}
