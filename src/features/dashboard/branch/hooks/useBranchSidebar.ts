import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import type { BranchInfoResponse } from '../services'
import { branchQueries } from './useBranchQueries'

export function useBranchSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const { useGetBranchInfoService } = branchQueries()
  const { data: branchInfoResponse } = useGetBranchInfoService()

  console.log('branch info response', branchInfoResponse)

  const data =
    (branchInfoResponse as BranchInfoResponse | undefined)?.data ??
    (branchInfoResponse as BranchInfoResponse['data'] | undefined)
  const branch = data?.branch
  const branchManager = data?.branch_manager
  const paymentDetails = data?.payment_details ?? null
  const businessDetails = data?.business_details

  const branchName = branch?.branch_name ?? null
  const branchManagerName = branch?.branch_manager_name ?? branchManager?.fullname ?? null
  const branchLocation = branch?.branch_location ?? null

  const hasManagerDetails = useMemo(
    () =>
      Boolean(branchManager?.fullname) &&
      Boolean(branchManager?.email) &&
      Boolean(branchManager?.phonenumber),
    [branchManager],
  )

  const hasPayment = useMemo(() => {
    if (!paymentDetails) return false
    return Boolean(
      paymentDetails.momo_number ?? paymentDetails.account_number ?? paymentDetails.bank_name,
    )
  }, [paymentDetails])

  const isOnboardingComplete = useMemo(
    () => hasManagerDetails && hasPayment,
    [hasManagerDetails, hasPayment],
  )

  const isBranchApproved = branch?.status === 'approved'

  const canAccessExperienceAndRedemptions = isOnboardingComplete || isBranchApproved

  const discoveryScore = useMemo(() => {
    const steps = [hasManagerDetails, hasPayment]
    const completedCount = steps.filter(Boolean).length
    return Math.round((completedCount / steps.length) * 100)
  }, [hasManagerDetails, hasPayment])

  useEffect(() => {
    const logoKey = businessDetails?.logo
    if (!logoKey) {
      setLogoUrl(null)
      return
    }
    let cancelled = false
    const loadLogo = async () => {
      try {
        const result = await fetchPresignedURL(logoKey)
        if (cancelled) return
        const url =
          typeof result === 'string' ? result : ((result as { url?: string })?.url ?? null)
        setLogoUrl(url)
      } catch {
        if (!cancelled) setLogoUrl(null)
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [businessDetails?.logo, fetchPresignedURL])

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path
    if (location.pathname === path) return true
    if (path === ROUTES.IN_APP.DASHBOARD.BRANCH.HOME) {
      return location.pathname === path || location.pathname === ROUTES.IN_APP.DASHBOARD.BRANCH.HOME
    }
    if (location.pathname.startsWith(path + '/')) return true
    return false
  }

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=branch`
  }

  return {
    location,
    navigate,
    logout,
    isCollapsed,
    setIsCollapsed,
    logoUrl,
    branchName,
    branchManagerName,
    branchLocation,
    discoveryScore,
    isOnboardingComplete,
    canAccessExperienceAndRedemptions,
    isActive,
    addAccountParam,
  }
}
