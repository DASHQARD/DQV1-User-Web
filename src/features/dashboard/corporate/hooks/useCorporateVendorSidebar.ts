import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useUserProfile, usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { corporateQueries } from './useCorporateQueries'
import { vendorQueries } from '@/features/dashboard/vendor'

export function useCorporateVendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout, user } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const { useGetAllVendorsDetailsService } = vendorQueries()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()

  const allVendorsCreatedByCorporate = useMemo(() => {
    const vendorsData = Array.isArray(allVendorsDetails)
      ? allVendorsDetails
      : ((allVendorsDetails as { data?: unknown[] })?.data ?? [])
    const corporateId = userProfileData?.id ?? (user as { id?: string })?.id
    return (
      vendorsData as { corporate_user_id?: string; vendor_id?: number; id?: number }[]
    ).filter((vendor) => String(vendor.corporate_user_id) === String(corporateId))
  }, [allVendorsDetails, userProfileData?.id, user])

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

  const [vendorLogoUrls, setVendorLogoUrls] = useState<Record<number, string>>({})
  useEffect(() => {
    if (allVendorsCreatedByCorporate.length === 0) return
    const fetchLogos = async () => {
      const logoPromises = allVendorsCreatedByCorporate.map(
        async (vendor: { vendor_logo?: string; vendor_id?: number; id?: number }) => {
          if (!vendor.vendor_logo) return null
          try {
            const url = await fetchPresignedURL(vendor.vendor_logo)
            return { vendorId: vendor.vendor_id ?? vendor.id, url }
          } catch {
            return null
          }
        },
      )
      const results = await Promise.all(logoPromises)
      const logoMap: Record<number, string> = {}
      results.forEach((result) => {
        if (result && result.vendorId != null) logoMap[result.vendorId] = result.url
      })
      setVendorLogoUrls(logoMap)
    }
    fetchLogos()
  }, [allVendorsCreatedByCorporate, fetchPresignedURL])

  const userType = (user as { user_type?: string })?.user_type || userProfileData?.user_type
  const isVendor = userType === 'vendor'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const displayName = 'Vendor'

  const {
    useGetCorporateBranchesListService,
    useGetCorporateBranchesByVendorIdService,
    useGetCorporatePaymentsService,
  } = corporateQueries()
  const { data: corporateBranchesList } = useGetCorporateBranchesListService()
  const { data: corporateBranchesByVendor } = useGetCorporateBranchesByVendorIdService(
    currentVendorId ?? null,
  )
  useGetCorporatePaymentsService()

  const corporateBranches = currentVendorId ? corporateBranchesByVendor : corporateBranchesList
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

  const [currentVendorLogoUrl, setCurrentVendorLogoUrl] = useState<string | null>(null)
  useEffect(() => {
    const vendorLogo = currentVendor && (currentVendor as { vendor_logo?: string }).vendor_logo
    if (vendorLogo) {
      let cancelled = false
      fetchPresignedURL(vendorLogo)
        .then((url) => {
          if (!cancelled) setCurrentVendorLogoUrl(url)
        })
        .catch(() => {
          if (!cancelled) setCurrentVendorLogoUrl(null)
        })
      return () => {
        cancelled = true
      }
    }
    const logoDocument = userProfileData?.business_documents?.find(
      (doc: { type: string }) => doc.type === 'logo',
    )
    if (!logoDocument?.file_url) {
      setCurrentVendorLogoUrl(null)
      return
    }
    let cancelled = false
    fetchPresignedURL(logoDocument.file_url)
      .then((url) => {
        if (!cancelled) setCurrentVendorLogoUrl(url)
      })
      .catch(() => {
        if (!cancelled) setCurrentVendorLogoUrl(null)
      })
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
    const base = `${path}${separator}account=vendor`
    return currentVendorId ? `${base}&vendor_id=${currentVendorId}` : base
  }

  const handleSwitchToVendor = (vendorId: number) => {
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
