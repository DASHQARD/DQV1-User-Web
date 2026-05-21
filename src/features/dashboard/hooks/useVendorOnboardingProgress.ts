import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUserProfile } from '@/hooks'
import { vendorQueries } from '@/features'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import {
  getVendorOnboardingProgress,
  isVendorNavItemDisabled,
  isVendorSettingsDisabled,
  type VendorOnboardingProgressResult,
} from '@/features/dashboard/utils/vendorOnboardingProgress'

export function useVendorOnboardingProgress(): VendorOnboardingProgressResult & {
  vendorIdFromUrl: string | null
  isBranchManager: boolean
  isCorporateSwitchedToVendor: boolean
  branchesCount: number
  hasFirstBranch: boolean
  addAccountParam: (path: string) => string
  getIsNavItemDisabled: (path: string) => boolean
  isSettingsDisabled: boolean
} {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const userType = userProfileData?.user_type
  const isBranchManager = userType === 'branch'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const isCorporateSwitchedToVendor = isCorporateSuperAdmin && Boolean(vendorIdFromUrl)

  const { useBranchesService, useGetBranchesByVendorIdService } = vendorQueries()
  const { useGetCorporateBranchesByVendorIdService, useGetCorporateBranchesListService } =
    corporateQueries()

  const vendorId = userProfileData?.vendor_id ? String(userProfileData.vendor_id) : null

  const { data: vendorBranches } = useGetBranchesByVendorIdService(
    isCorporateSuperAdmin ? null : vendorId,
    false,
  )
  const { data: corporateBranchesByVendor } = useGetCorporateBranchesByVendorIdService(
    isCorporateSwitchedToVendor ? vendorIdFromUrl : null,
  )
  const { data: corporateBranchesList } = useGetCorporateBranchesListService()
  const { data: legacyBranches } = useBranchesService()

  const branchesCount = useMemo(() => {
    const source = isCorporateSwitchedToVendor
      ? corporateBranchesByVendor
      : isCorporateSuperAdmin
        ? corporateBranchesList
        : vendorBranches ?? legacyBranches
    if (!source) return 0
    const list = Array.isArray(source) ? source : (source as { data?: unknown[] })?.data || []
    return list.length
  }, [
    isCorporateSwitchedToVendor,
    isCorporateSuperAdmin,
    corporateBranchesByVendor,
    corporateBranchesList,
    vendorBranches,
    legacyBranches,
  ])

  const progress = useMemo(
    () =>
      getVendorOnboardingProgress({
        userProfile: userProfileData,
        branchesCount,
        isBranchManager,
        isCorporateSwitchedToVendor,
      }),
    [userProfileData, branchesCount, isBranchManager, isCorporateSwitchedToVendor],
  )

  const addAccountParam = (path: string) => {
    const params = new URLSearchParams()
    params.set('account', 'vendor')
    if (vendorIdFromUrl) params.set('vendor_id', vendorIdFromUrl)
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}${params.toString()}`
  }

  const hasFirstBranch = branchesCount > 0

  const getIsNavItemDisabled = useCallback(
    (path: string) =>
      isVendorNavItemDisabled(path, {
        isOnboardingComplete: progress.isComplete,
        hasFirstBranch,
      }),
    [progress.isComplete, hasFirstBranch],
  )

  const isSettingsDisabled = isVendorSettingsDisabled({
    isOnboardingComplete: progress.isComplete,
  })

  return {
    ...progress,
    branchesCount,
    hasFirstBranch,
    vendorIdFromUrl,
    isBranchManager,
    isCorporateSwitchedToVendor,
    addAccountParam,
    getIsNavItemDisabled,
    isSettingsDisabled,
  }
}
