import { useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useBusinessLogoUrl, useUserProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { corporateQueries } from './useCorporateQueries'

type VendorRow = {
  id?: number | string
  vendor_id?: number | string
  vendor_name?: string
  business_name?: string
  vendor_logo?: string
  gvid?: string
  approval_status?: string
  status?: string
}

function resolveVendorId(vendor: VendorRow): string | number | undefined {
  return vendor.vendor_id ?? vendor.id
}

export function useCorporateSwitchWorkspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetAllVendorsManagementService } = corporateQueries()
  const { data: allVendorsResponse } = useGetAllVendorsManagementService(
    isCorporateSuperAdmin ? { limit: 100 } : undefined,
  )

  const allVendorsCreatedByCorporate = useMemo(() => {
    if (!allVendorsResponse) return []
    return Array.isArray(allVendorsResponse?.data) ? allVendorsResponse.data : []
  }, [allVendorsResponse])

  const hasVendorsPendingVerification = useMemo(() => {
    return allVendorsCreatedByCorporate.some((vendor: VendorRow) => {
      const isApproved =
        vendor.approval_status === 'approved' || vendor.approval_status === 'auto_approved'
      const isActive = vendor.status === 'active'
      return !isApproved || !isActive
    })
  }, [allVendorsCreatedByCorporate])

  const vendorLogoUrls = useMemo(() => {
    const map: Record<string, string> = {}
    allVendorsCreatedByCorporate.forEach((vendor: VendorRow) => {
      const vendorId = resolveVendorId(vendor)
      if (vendor.vendor_logo && vendorId != null) map[String(vendorId)] = vendor.vendor_logo
    })
    return map
  }, [allVendorsCreatedByCorporate])

  const { url: corporateLogoUrl } = useBusinessLogoUrl(userProfileData)
  const corporateName = userProfileData?.business_details?.[0]?.name || 'Corporate Account'

  const currentVendorId = searchParams.get('vendor_id')
  const isVendorView = searchParams.get('account') === 'vendor'

  const handleSwitchToVendor = useCallback(
    (vendorId: string | number) => {
      const isAlreadyOnVendorView =
        searchParams.get('account') === 'vendor' &&
        location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.VENDOR.HOME)
      if (isAlreadyOnVendorView) {
        const next = new URLSearchParams(searchParams)
        next.set('account', 'vendor')
        next.set('vendor_id', String(vendorId))
        setSearchParams(next, { replace: true })
      } else {
        navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor&vendor_id=${vendorId}`)
      }
    },
    [location.pathname, navigate, searchParams, setSearchParams],
  )

  const handleSwitchToCorporate = useCallback(() => {
    navigate(`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`)
  }, [navigate])

  return {
    isCorporateSuperAdmin,
    allVendorsCreatedByCorporate,
    hasVendorsPendingVerification,
    vendorLogoUrls,
    corporateLogoUrl,
    corporateName,
    currentVendorId,
    isVendorView,
    handleSwitchToVendor,
    handleSwitchToCorporate,
    resolveVendorId,
  }
}
