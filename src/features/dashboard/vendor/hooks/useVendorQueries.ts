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
  getRequestVendorInfo,
  getCardsByVendorId,
  getCardById,
  getCardsMetrics,
  getCardsPerformanceMetrics,
  getVendorCardCounts,
  getAllVendorsDetails,
  getBranchPaymentDetails,
  getBranchManagerInvitations,
  getVendorPayments,
  getCorporateSuperAdminVendorPayments,
  getVendorPaymentById,
} from '../services'
import { useVendorOperationalAccess } from '@/features/dashboard/hooks/useVendorOperationalAccess'
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
    vendorId: string | number | null | undefined,
    includeRelatedVendors: boolean = false,
  ) {
    return useQuery({
      queryKey: ['branches-by-vendor-id', vendorId, includeRelatedVendors],
      queryFn: () => getBranchesByVendorId(vendorId!, includeRelatedVendors),
      enabled: !!vendorId,
    })
  }

  function useGetAuditLogsVendorService() {
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['audit-logs-vendor'],
      queryFn: getAuditLogsVendor,
      enabled: isOperationalAccessEnabled,
    })
  }

  function useGetRequestsVendorService(query?: Record<string, any>) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const { isOperationalAccessEnabled, isCorporateSwitchedToVendor } =
      useVendorOperationalAccess()
    const needsOperationalAccess =
      userProfileData?.user_type === 'vendor' ||
      userProfileData?.user_type === 'branch' ||
      isCorporateSwitchedToVendor

    return useQuery({
      queryKey: ['requests-vendor', query],
      queryFn: () => getRequestsVendor(query),
      // Corporate super admin uses GET .../corporate-super-admin/vendor/:id/requests when switched to a vendor.
      enabled:
        userProfileData !== undefined &&
        userProfileData?.user_type !== 'corporate super admin' &&
        query !== undefined &&
        (!needsOperationalAccess || isOperationalAccessEnabled),
    })
  }

  function useGetRequestVendorInfoService(id: number | string | null) {
    return useQuery({
      queryKey: ['request-vendor-info', id],
      queryFn: () => getRequestVendorInfo(id as number | string),
      enabled: !!id,
    })
  }

  function useGetCardsByVendorIdService(params?: Record<string, any>) {
    const { useGetUserProfileService } = useUserProfile()
    const { data: userProfileData } = useGetUserProfileService()
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()
    const vendor_id = userProfileData?.vendor_id ? String(userProfileData.vendor_id) : undefined
    const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

    return useQuery({
      queryKey: ['cards-by-vendor-id', vendor_id, params],
      queryFn: () => getCardsByVendorId({ vendor_id: vendor_id!, ...params }),
      enabled:
        !!vendor_id &&
        userProfileData?.user_type !== 'branch' &&
        !isCorporateSuperAdmin &&
        isOperationalAccessEnabled,
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
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['cards-metrics'],
      queryFn: getCardsMetrics,
      enabled: isOperationalAccessEnabled,
    })
  }

  function useGetCardsPerformanceMetricsService() {
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['cards-performance-metrics'],
      queryFn: getCardsPerformanceMetrics,
      enabled: isOperationalAccessEnabled,
    })
  }

  function useGetVendorCardCountsService() {
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['vendor-card-counts'],
      queryFn: getVendorCardCounts,
      enabled: isOperationalAccessEnabled,
    })
  }

  function useGetAllVendorsDetailsForVendorService(enabled: boolean = true) {
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['all-vendors-details-for-vendor'],
      queryFn: getAllVendorsDetails,
      enabled: enabled && isOperationalAccessEnabled,
    })
  }

  function useGetCorporateSuperAdminVendorPaymentsService(query?: QueryType) {
    return useQuery({
      queryKey: ['corporate-super-admin-vendor-payments', query],
      queryFn: () => getCorporateSuperAdminVendorPayments(query),
      enabled: true,
    })
  }

  function useGetVendorPaymentsService(query?: QueryType) {
    return useQuery({
      queryKey: ['vendor-payments', query],
      queryFn: () => getVendorPayments(query),
      enabled: true,
    })
  }

  function useGetVendorPaymentByIdService(id: string | number | null) {
    return useQuery({
      queryKey: ['vendor-payment', id],
      queryFn: () => getVendorPaymentById(id as string | number),
      enabled: !!id,
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
    useGetRequestVendorInfoService,
    useGetCardsByVendorIdService,
    useGetCardByIdService,
    useGetCardsMetricsService,
    useGetCardsPerformanceMetricsService,
    useGetVendorCardCountsService,
    useGetAllVendorsDetailsForVendorService,
    useGetVendorPaymentsService,
    useGetVendorPaymentByIdService,
    useGetBranchPaymentDetailsService,
    useGetBranchManagerInvitationsService,
    useGetCorporateSuperAdminVendorPaymentsService,
  }
}
