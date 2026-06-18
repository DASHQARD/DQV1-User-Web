import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vendorQueries } from '@/features'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { useUserProfile } from '@/hooks'

export function getBranchRecordId(branch: {
  id?: string | number
  branch_id?: string | number
}): string {
  const id = branch.id ?? branch.branch_id
  return id != null && String(id).trim() ? String(id).trim() : ''
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

  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl
  const useVendorScoped = !isCorporateSuperAdmin && !isBranchManager && !!vendorId

  const { data: vendorBranchesResponse, isLoading: isLoadingVendorBranches } =
    useGetBranchesByVendorIdService(useVendorScoped ? vendorId : null, false)
  const { data: corporateBranchesByVendorResponse, isLoading: isLoadingCorporateBranches } =
    useGetCorporateBranchesByVendorIdService(useCorporateVendorScoped ? vendorIdFromUrl : null)
  const { data: genericBranchesResponse, isLoading: isLoadingGenericBranches } =
    useBranchesService()

  const branchesResponse = useCorporateVendorScoped
    ? corporateBranchesByVendorResponse
    : useVendorScoped
      ? vendorBranchesResponse
      : genericBranchesResponse

  const isLoadingBranches = useCorporateVendorScoped
    ? isLoadingCorporateBranches
    : useVendorScoped
      ? isLoadingVendorBranches
      : isLoadingGenericBranches

  const branchesArray = useMemo(() => {
    if (!branchesResponse) return []
    return Array.isArray(branchesResponse)
      ? branchesResponse
      : (branchesResponse as { data?: unknown[] })?.data || []
  }, [branchesResponse])

  return {
    branchesArray,
    isLoadingBranches,
    isCorporateSuperAdmin,
    isBranchManager,
    vendorIdFromUrl,
  }
}
