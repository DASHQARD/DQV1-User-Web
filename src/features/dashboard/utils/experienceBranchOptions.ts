import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vendorQueries } from '@/features'
import { branchQueries } from '@/features/dashboard/branch/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { useUserProfile } from '@/hooks'

export type ExperienceBranchRecord = {
  id?: string | number
  branch_id?: string | number
  branch_name?: string
  branch_location?: string
}

export function getBranchRecordId(branch: ExperienceBranchRecord): string {
  const id = branch.id ?? branch.branch_id
  return id != null && String(id).trim() ? String(id).trim() : ''
}

/** Branch managers load branch from GET /branches/info; profile branches may be empty. */
export function resolveBranchManagerBranchId(
  branch: ExperienceBranchRecord | null | undefined,
  profileBranches?: Array<ExperienceBranchRecord> | null,
): string {
  const fromBranch = branch ? getBranchRecordId(branch) : ''
  if (fromBranch) return fromBranch
  return getBranchRecordId(profileBranches?.[0] ?? {})
}

/** Branches for experience create/edit — CSA vendor context uses GET /branches/corporate?vendor_id=. */
export function useExperienceFormBranches() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const isBranchManager = userType === 'branch'
  const vendorId = userProfileData?.vendor_id ? String(userProfileData.vendor_id) : null

  const { useGetBranchesByVendorIdService, useBranchesService } = vendorQueries()
  const { useGetCorporateBranchesByVendorIdService } = corporateQueries()
  const { useGetBranchInfoService } = branchQueries()

  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl
  const useVendorScoped = !isCorporateSuperAdmin && !isBranchManager && !!vendorId

  const { data: branchInfoResponse, isLoading: isLoadingBranchInfo } = useGetBranchInfoService()
  const { data: vendorBranchesResponse, isLoading: isLoadingVendorBranches } =
    useGetBranchesByVendorIdService(useVendorScoped ? vendorId : null, false)
  const { data: corporateBranchesByVendorResponse, isLoading: isLoadingCorporateBranches } =
    useGetCorporateBranchesByVendorIdService(useCorporateVendorScoped ? vendorIdFromUrl : null)
  const { data: genericBranchesResponse, isLoading: isLoadingGenericBranches } =
    useBranchesService()

  const branchManagerBranch = useMemo((): ExperienceBranchRecord | null => {
    if (!isBranchManager) return null
    const fromInfo = branchInfoResponse?.data?.branch
    if (fromInfo) return fromInfo as ExperienceBranchRecord
    const fromProfile = userProfileData?.branches?.[0]
    return fromProfile ? (fromProfile as ExperienceBranchRecord) : null
  }, [isBranchManager, branchInfoResponse, userProfileData?.branches])

  const branchManagerBranchId = useMemo(
    () => resolveBranchManagerBranchId(branchManagerBranch, userProfileData?.branches),
    [branchManagerBranch, userProfileData?.branches],
  )

  const branchesResponse = useCorporateVendorScoped
    ? corporateBranchesByVendorResponse
    : useVendorScoped
      ? vendorBranchesResponse
      : isBranchManager
        ? null
        : genericBranchesResponse

  const isLoadingBranches = isBranchManager
    ? isLoadingBranchInfo
    : useCorporateVendorScoped
      ? isLoadingCorporateBranches
      : useVendorScoped
        ? isLoadingVendorBranches
        : isLoadingGenericBranches

  const branchesArray = useMemo(() => {
    if (isBranchManager && branchManagerBranch) {
      return [branchManagerBranch]
    }
    if (!branchesResponse) return []
    return Array.isArray(branchesResponse)
      ? (branchesResponse as ExperienceBranchRecord[])
      : (branchesResponse as { data?: ExperienceBranchRecord[] })?.data || []
  }, [isBranchManager, branchManagerBranch, branchesResponse])

  return {
    branchesArray,
    branchManagerBranch,
    branchManagerBranchId,
    isLoadingBranches,
    isCorporateSuperAdmin,
    isBranchManager,
    vendorIdFromUrl,
  }
}
