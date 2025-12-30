import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
  getAllVendors,
  getAllVendorsManagement,
  getBranches,
  getBranchesByVendorId,
  getSingleVendorInfo,
  getAuditLogsVendor,
  getRequestsVendor,
  getCardsByVendorId,
  getCardById,
} from '../services'
import { userProfile } from '@/hooks'

export function vendorQueries() {
  function useGetAllVendorsService() {
    return useQuery({
      queryKey: ['all-vendors'],
      queryFn: getAllVendors,
    })
  }

  function useGetAllVendorsDetailsService() {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const userStatus = (user as any)?.status
    const isCorporateAdmin =
      (userType === 'corporate super admin' || userType === 'corporate admin') &&
      userStatus !== 'pending'

    return useQuery({
      queryKey: ['all-vendors-details'],
      queryFn: getAllVendorsManagement,
      enabled: isCorporateAdmin,
    })
  }

  function useGetSingleVendorInfoService(id: string) {
    return useQuery({
      queryKey: ['single-vendor-info'],
      queryFn: () => getSingleVendorInfo(id),
      enabled: !!id,
    })
  }

  function useBranchesService() {
    return useQuery({
      queryKey: ['branches'],
      queryFn: getBranches,
    })
  }

  function useGetBranchesByVendorIdService(
    vendorId: number | null | undefined,
    includeRelatedVendors: boolean = false,
  ) {
    return useQuery({
      queryKey: ['branches-by-vendor-id', vendorId, includeRelatedVendors],
      queryFn: () => getBranchesByVendorId(vendorId!, includeRelatedVendors),
      enabled: !!vendorId,
    })
  }

  function useGetAuditLogsVendorService() {
    return useQuery({
      queryKey: ['audit-logs-vendor'],
      queryFn: getAuditLogsVendor,
    })
  }

  function useGetRequestsVendorService() {
    return useQuery({
      queryKey: ['requests-vendor'],
      queryFn: getRequestsVendor,
    })
  }

  function useGetCardsByVendorIdService() {
    const { useGetUserProfileService } = userProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const vendor_id = userProfileData?.vendor_id

    return useQuery({
      queryKey: ['cards-by-vendor-id', vendor_id],
      queryFn: () => getCardsByVendorId({ vendor_id: Number(vendor_id) || 0 }),
      enabled: !!vendor_id,
    })
  }

  function useGetCardByIdService(id: string | number | null) {
    return useQuery({
      queryKey: ['card-by-id', id],
      queryFn: () => getCardById(id as string | number),
      enabled: !!id,
    })
  }

  return {
    useGetAllVendorsService,
    useGetAllVendorsDetailsService,
    useGetSingleVendorInfoService,
    useBranchesService,
    useGetBranchesByVendorIdService,
    useGetAuditLogsVendorService,
    useGetRequestsVendorService,
    useGetCardsByVendorIdService,
    useGetCardByIdService,
  }
}
