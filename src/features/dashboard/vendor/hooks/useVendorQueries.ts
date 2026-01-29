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
  getCardsMetrics,
  getCardsPerformanceMetrics,
  getVendorCardCounts,
  getAllVendorsDetails,
  getBranchPaymentDetails,
  getBranchManagerInvitations,
  getVendorPayments,
} from '../services'
import { getRequestsCorporate } from '@/features/dashboard/corporate/services'
import type { QueryType, GetBranchManagerInvitationsQuery } from '@/types'
import { useUserProfile } from '@/hooks'

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

  function useGetRequestsVendorService(query?: Record<string, any>) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

    return useQuery({
      queryKey: isCorporateSuperAdmin ? ['requests-corporate', query] : ['requests-vendor', query],
      queryFn: () =>
        isCorporateSuperAdmin ? getRequestsCorporate(query) : getRequestsVendor(query),
    })
  }

  function useGetCardsByVendorIdService(params?: Record<string, any>) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const vendor_id = userProfileData?.vendor_id
    const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

    return useQuery({
      queryKey: ['cards-by-vendor-id', vendor_id, params],
      queryFn: () => getCardsByVendorId({ vendor_id: Number(vendor_id) || 0, ...params }),
      enabled: !!vendor_id && userProfileData?.user_type !== 'branch' && !isCorporateSuperAdmin,
    })
  }

  function useGetCardByIdService(id: string | number | null) {
    return useQuery({
      queryKey: ['card-by-id', id],
      queryFn: () => getCardById(id as string | number),
      enabled: !!id,
    })
  }

  function useGetCardsMetricsService() {
    return useQuery({
      queryKey: ['cards-metrics'],
      queryFn: getCardsMetrics,
    })
  }

  function useGetCardsPerformanceMetricsService() {
    return useQuery({
      queryKey: ['cards-performance-metrics'],
      queryFn: getCardsPerformanceMetrics,
    })
  }

  function useGetVendorCardCountsService() {
    return useQuery({
      queryKey: ['vendor-card-counts'],
      queryFn: getVendorCardCounts,
    })
  }

  function useGetAllVendorsDetailsForVendorService(enabled: boolean = true) {
    return useQuery({
      queryKey: ['all-vendors-details-for-vendor'],
      queryFn: getAllVendorsDetails,
      enabled,
    })
  }

  function useGetVendorPaymentsService(query?: QueryType) {
    return useQuery({
      queryKey: ['vendor-payments', query],
      queryFn: () => getVendorPayments(query),
      enabled: false,
    })
  }

  function useGetBranchPaymentDetailsService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['branch-payment-details', branchId],
      queryFn: () => getBranchPaymentDetails(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetBranchManagerInvitationsService(query?: GetBranchManagerInvitationsQuery) {
    return useQuery({
      queryKey: ['branch-manager-invitations', query],
      queryFn: () => getBranchManagerInvitations(query),
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
    useGetCardsMetricsService,
    useGetCardsPerformanceMetricsService,
    useGetVendorCardCountsService,
    useGetAllVendorsDetailsForVendorService,
    useGetVendorPaymentsService,
    useGetBranchPaymentDetailsService,
    useGetBranchManagerInvitationsService,
  }
}
