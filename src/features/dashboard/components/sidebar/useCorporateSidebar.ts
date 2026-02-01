import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { usePersistedModalState, useUserProfile, usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { MODALS } from '@/utils/constants'
import { corporateQueries } from '../../corporate/hooks/useCorporateQueries'
import { vendorQueries } from '../../vendor'

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
  const { logout } = useAuthStore()

  const { useGetUserProfileService } = useUserProfile()
  const { data: user } = useGetUserProfileService()

  const { useGetAllVendorsDetailsService } = vendorQueries()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()

  const { useGetRequestsCorporateService } = corporateQueries()
  const { data: requestsCorporateResponse } = useGetRequestsCorporateService({ limit: 100 })

  const pendingRequestsCount = useMemo(() => {
    if (!requestsCorporateResponse) return 0
    const list = Array.isArray(requestsCorporateResponse?.data)
      ? requestsCorporateResponse.data
      : []
    return list.filter((r: { status?: string }) => String(r?.status).toLowerCase() === 'pending')
      .length
  }, [requestsCorporateResponse])

  const allVendorsCreatedByCorporate = useMemo(() => {
    const vendorsData = Array.isArray(allVendorsDetails)
      ? allVendorsDetails
      : ((allVendorsDetails as { data?: unknown[] })?.data ?? [])
    return vendorsData.filter(
      (vendor: { corporate_user_id?: number }) => vendor.corporate_user_id === user?.id,
    )
  }, [allVendorsDetails, user?.id])

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

  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [vendorLogoUrls, setVendorLogoUrls] = useState<Record<number, string>>({})

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

  useEffect(() => {
    const logoDocument = user?.business_documents?.find(
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
  }, [user?.business_documents, fetchPresignedURL])

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
      if (
        item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
        item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE ||
        item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.NOTIFICATIONS ||
        item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS ||
        item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS
      ) {
        return isApprovedOrVerified
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
        (item.path === ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS && isStatusPending),
    }))
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
