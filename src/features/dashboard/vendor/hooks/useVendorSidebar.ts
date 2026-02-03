import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useUserProfile, usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { vendorQueries } from './useVendorQueries'

export function useVendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { logout, user } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const userType = (user as { user_type?: string })?.user_type || userProfileData?.user_type
  const isVendor = userType === 'vendor'
  const displayName = 'Vendor'

  const { useBranchesService, useGetAllVendorsDetailsService, useGetRequestsVendorService } =
    vendorQueries()
  const { data: branches } = useBranchesService()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()
  const { data: requestsResponse } = useGetRequestsVendorService({ limit: 100 })

  const pendingRequestsCount = useMemo(() => {
    if (!requestsResponse) return 0
    const list = Array.isArray(requestsResponse)
      ? requestsResponse
      : Array.isArray((requestsResponse as { data?: unknown[] })?.data)
        ? (requestsResponse as { data: unknown[] }).data
        : []
    return list.filter((r: { status?: string }) => String(r?.status).toLowerCase() === 'pending')
      .length
  }, [requestsResponse])

  const branchesArray = Array.isArray(branches)
    ? branches
    : (branches as { data?: unknown[] })?.data || []

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

  const [vendorLogoUrls, setVendorLogoUrls] = useState<Record<number, string>>({})
  useEffect(() => {
    if (vendorsCreatedByCorporate.length === 0) return
    const fetchLogos = async () => {
      const logoPromises = (
        vendorsCreatedByCorporate as { vendor_logo?: string; vendor_id?: number }[]
      ).map(async (vendor) => {
        if (!vendor.vendor_logo) return null
        try {
          const url = await fetchPresignedURL(vendor.vendor_logo)
          return { vendorId: vendor.vendor_id, url }
        } catch {
          return null
        }
      })
      const results = await Promise.all(logoPromises)
      const logoMap: Record<number, string> = {}
      results.forEach((result) => {
        if (result && result.vendorId != null) logoMap[result.vendorId] = result.url
      })
      setVendorLogoUrls(logoMap)
    }
    fetchLogos()
  }, [vendorsCreatedByCorporate, fetchPresignedURL])

  useEffect(() => {
    const logoDocument = userProfileData?.business_documents?.find(
      (doc: { type: string }) => doc.type === 'logo',
    )
    if (!logoDocument?.file_url) {
      setLogoUrl(null)
      return
    }
    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDocument.file_url)
        if (!cancelled) setLogoUrl(url)
      } catch (error) {
        console.error('Failed to fetch logo presigned URL', error)
        if (!cancelled) setLogoUrl(null)
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  const corporateBusiness = userProfileData?.business_details?.[0]
  const corporateName = corporateBusiness?.name || 'Corporate Account'
  const corporateId = userProfileData?.corporate_id_from_business || ''

  const currentVendorId = searchParams.get('vendor_id')
  const currentVendor = useMemo(() => {
    if (!currentVendorId || vendorsCreatedByCorporate.length === 0) return null
    return (
      (vendorsCreatedByCorporate as { vendor_id?: number; id?: number }[]).find(
        (vendor) =>
          String(vendor.vendor_id) === currentVendorId || String(vendor.id) === currentVendorId,
      ) ?? null
    )
  }, [currentVendorId, vendorsCreatedByCorporate])

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

  const [currentVendorLogoUrl, setCurrentVendorLogoUrl] = useState<string | null>(null)
  useEffect(() => {
    const logoSource = (currentVendor as { vendor_logo?: string })?.vendor_logo
      ? (currentVendor as { vendor_logo: string }).vendor_logo
      : userProfileData?.business_documents?.find((doc: { type: string }) => doc.type === 'logo')
          ?.file_url

    if (!logoSource) {
      setCurrentVendorLogoUrl(null)
      return
    }
    let cancelled = false
    const loadVendorLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoSource)
        if (!cancelled) setCurrentVendorLogoUrl(url)
      } catch (error) {
        console.error('Failed to fetch vendor logo presigned URL', error)
        if (!cancelled) setCurrentVendorLogoUrl(null)
      }
    }
    loadVendorLogo()
    return () => {
      cancelled = true
    }
  }, [currentVendor, userProfileData?.business_documents, fetchPresignedURL])

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

  const handleSwitchToVendor = (vendorId: number) => {
    setIsPopoverOpen(false)
    navigate(
      `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor${vendorId ? `&vendor_id=${vendorId}` : ''}`,
    )
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
