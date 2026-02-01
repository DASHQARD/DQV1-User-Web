import { useQuery } from '@tanstack/react-query'
import {
  getCorporate,
  getCorporateById,
  getAuditLogsCorporate,
  getRequestsCorporate,
  getRequestsCorporateSuperAdminByVendor,
  getCorporateRequestById,
  getCorporateSuperAdminVendorRequestInfo,
  getCorporateAdmins,
  getInvitedCorporateAdmins,
  getCorporatePaymentDetails,
  getAllCorporatePayments,
  getPaymentById,
  getAllRecipients,
  getCarts,
  getPaymentDetails,
  getPaymentDetailsByUserId,
  getCorporateCards,
  getCorporateBranches,
  getCorporateBranchesByVendorId,
  getCorporateBranchesList,
  getCorporateBranchById,
  getCorporateBranchManagers,
  getCorporateBranchRedemptions,
  getCorporateBranchCards,
  getCorporateBranchSummary,
  getCorporatePayments,
  getCorporatePaymentById,
  getCorporateSuperAdminCards,
  getCorporateSuperAdminCardById,
  getCorporateSuperAdminVendorCardsSummary,
  getCardsByVendorIdForCorporate,
  getCorporateRedemptions,
  getCorporateRedemptionsByVendorId,
  getCorporateSuperAdminBranchManagers,
  getCorporateBranchManagerInvitations,
  getCorporateBranchManagerInvitationById,
  getVendorInvitations,
  getAllVendorsManagement,
  getVendorByIdManagement,
} from '../services'
import { getCards } from '@/features/dashboard/services/cards'
import { useAuthStore } from '@/stores'

export function corporateQueries() {
  function useGetCorporateService() {
    return useQuery({
      queryKey: ['corporate'],
      queryFn: getCorporate,
      enabled: false,
    })
  }

  function useGetAuditLogsCorporateService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['audit-logs-corporate', query],
      queryFn: () => getAuditLogsCorporate(query),
    })
  }

  function useGetCorporateByIdService() {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const userStatus = (user as any)?.status
    const isCorporateAdmin =
      (userType === 'corporate super admin' || userType === 'corporate admin') &&
      userStatus !== 'pending'

    return useQuery({
      queryKey: ['corporate', user?.user_id],
      queryFn: () => getCorporateById(user?.user_id?.toString() || ''),
      enabled: isCorporateAdmin,
    })
  }

  function useGetRequestsCorporateService(query?: Record<string, any>) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const userStatus = (user as any)?.status
    const isCorporateAdmin =
      (userType === 'corporate super admin' || userType === 'corporate admin') &&
      userStatus !== 'pending'
    return useQuery({
      queryKey: ['requests-corporate', query],
      queryFn: () => getRequestsCorporate(query),
      enabled: isCorporateAdmin,
    })
  }

  function useGetRequestsCorporateSuperAdminVendorService(vendorId: string | null) {
    return useQuery({
      queryKey: ['requests-corporate-super-admin-vendor', vendorId],
      queryFn: () => getRequestsCorporateSuperAdminByVendor(vendorId!),
      enabled: !!vendorId,
    })
  }

  function useGetCorporateRequestByIdService(id: number | string | null) {
    return useQuery({
      queryKey: ['corporate-request', id],
      queryFn: () => getCorporateRequestById(id!),
      enabled: !!id,
    })
  }

  function useGetCorporateSuperAdminVendorRequestInfoService(
    vendorId: string | number | null,
    id: number | string | null,
  ) {
    return useQuery({
      queryKey: ['corporate-super-admin-vendor-request', vendorId, id],
      queryFn: () => getCorporateSuperAdminVendorRequestInfo(vendorId!, id!),
      enabled: !!vendorId && !!id,
    })
  }

  function useGetCorporateAdminsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['corporate-admins', query],
      queryFn: () => getCorporateAdmins(query),
    })
  }

  function useGetInvitedCorporateAdminsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['invited-corporate-admins', query],
      queryFn: () => getInvitedCorporateAdmins(query),
    })
  }

  function useGetCorporatePaymentInfoService() {
    return useQuery({
      queryKey: ['corporate-payment-info'],
      queryFn: () => getCorporatePaymentDetails(),
    })
  }

  function useGetAllCorporatePaymentsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['all-corporate-payments', query],
      queryFn: () => getAllCorporatePayments(query),
    })
  }

  function useGetPaymentByIdService(id: string | number | null) {
    return useQuery({
      queryKey: ['payment-by-id', id],
      queryFn: () => getPaymentById(id!),
      enabled: !!id,
    })
  }

  function useGetAllRecipientsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['all-corporate-recipients', query],
      queryFn: () => getAllRecipients(query),
    })
  }

  function useGetCartsService() {
    return useQuery({
      queryKey: ['corporate-carts'],
      queryFn: getCarts,
    })
  }

  function useGetPaymentDetailsService() {
    return useQuery({
      queryKey: ['corporate-payment-details'],
      queryFn: getPaymentDetails,
    })
  }

  function useGetPaymentDetailsByUserIdService(userId: string | number | null) {
    return useQuery({
      queryKey: ['corporate-payment-details', userId],
      queryFn: () => getPaymentDetailsByUserId(userId!),
      enabled: !!userId,
    })
  }

  function useGetCardsService() {
    return useQuery({
      queryKey: ['corporate-cards'],
      queryFn: () => getCards(),
    })
  }

  function useGetCorporateCardsService(query?: Record<string, any>) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporate = userType === 'corporate super admin' || userType === 'corporate admin'

    return useQuery({
      queryKey: ['corporate-cards-experience', query],
      queryFn: () => getCorporateCards(query),
      enabled: isCorporate,
    })
  }

  function useGetCorporateSuperAdminCardsService(query?: Record<string, any>) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-super-admin-cards', query],
      queryFn: () => getCorporateSuperAdminCards(query),
      enabled: isCorporateSuperAdmin,
    })
  }

  function useGetCorporateSuperAdminCardByIdService(id: number | string | null) {
    return useQuery({
      queryKey: ['corporate-super-admin-card', id],
      queryFn: () => getCorporateSuperAdminCardById(id!),
      enabled: !!id,
    })
  }

  function useGetCorporateBranchesService(corporateUserId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branches', corporateUserId],
      queryFn: () => getCorporateBranches(corporateUserId!),
      enabled: !!corporateUserId,
    })
  }

  function useGetCorporateBranchesByVendorIdService(vendorId: string | null) {
    return useQuery({
      queryKey: ['corporate-branches-by-vendor', vendorId],
      queryFn: () => getCorporateBranchesByVendorId(vendorId!),
      enabled: !!vendorId,
    })
  }

  function useGetCorporateBranchesListService() {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-branches-list'],
      queryFn: () => getCorporateBranchesList(),
      enabled: isCorporateSuperAdmin,
    })
  }

  function useGetCorporateBranchByIdService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch', branchId],
      queryFn: () => getCorporateBranchById(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetCorporateBranchManagersService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch-managers', branchId],
      queryFn: () => getCorporateBranchManagers(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetCorporateBranchRedemptionsService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch-redemptions', branchId],
      queryFn: () => getCorporateBranchRedemptions(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetCorporateBranchCardsService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch-cards', branchId],
      queryFn: () => getCorporateBranchCards(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetCorporateBranchSummaryService(branchId: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch-summary', branchId],
      queryFn: () => getCorporateBranchSummary(branchId!),
      enabled: !!branchId,
    })
  }

  function useGetCorporatePaymentsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['corporate-payments', query],
      queryFn: () => getCorporatePayments(query),
    })
  }

  function useGetCorporatePaymentByIdService(id: number | string | null) {
    return useQuery({
      queryKey: ['corporate-payment', id],
      queryFn: () => getCorporatePaymentById(id!),
      enabled: !!id,
    })
  }

  function useGetCorporateRedemptionsService(
    query?: Record<string, any>,
    options?: { skipWhenVendorSelected?: boolean },
  ) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'
    const skip = options?.skipWhenVendorSelected === true

    return useQuery({
      queryKey: ['corporate-redemptions', query],
      queryFn: () => getCorporateRedemptions(query),
      enabled: isCorporateSuperAdmin && !skip,
    })
  }

  function useGetCorporateRedemptionsByVendorIdService(
    vendorId: number | string | null,
    params?: Record<string, any>,
  ) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-redemptions-by-vendor', vendorId, params],
      queryFn: () => getCorporateRedemptionsByVendorId(vendorId!, params),
      enabled: isCorporateSuperAdmin && !!vendorId,
    })
  }

  function useGetCorporateSuperAdminBranchManagersService(
    vendorId: number | string | null,
    params?: Record<string, any>,
  ) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-super-admin-branch-managers', vendorId, params],
      queryFn: () => getCorporateSuperAdminBranchManagers(vendorId!, params),
      enabled: isCorporateSuperAdmin && !!vendorId,
    })
  }

  function useGetCorporateBranchManagerInvitationsService(params?: Record<string, any>) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-branch-manager-invitations', params],
      queryFn: () => getCorporateBranchManagerInvitations(params),
      enabled: isCorporateSuperAdmin,
    })
  }

  function useGetCorporateBranchManagerInvitationByIdService(id: number | string | null) {
    return useQuery({
      queryKey: ['corporate-branch-manager-invitation', id],
      queryFn: () => getCorporateBranchManagerInvitationById(id!),
      enabled: !!id,
    })
  }

  function useGetVendorInvitationsService(params?: Record<string, any>) {
    return useQuery({
      queryKey: ['vendor-invitations', params],
      queryFn: () => getVendorInvitations(params),
    })
  }

  function useGetAllVendorsManagementService(params?: Record<string, any>) {
    return useQuery({
      queryKey: ['all-vendors-management', params],
      queryFn: () => getAllVendorsManagement(params),
    })
  }

  function useGetVendorByIdManagementService(id: number | string | null) {
    return useQuery({
      queryKey: ['vendor-by-id-management', id],
      queryFn: () => getVendorByIdManagement(id!),
      enabled: !!id,
    })
  }

  function useGetCorporateSuperAdminVendorCardsSummaryService(vendorId: number | string | null) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-super-admin-vendor-cards-summary', vendorId],
      queryFn: () => getCorporateSuperAdminVendorCardsSummary(vendorId!),
      enabled: isCorporateSuperAdmin && !!vendorId,
    })
  }

  function useGetCardsByVendorIdForCorporateService(
    vendorId: number | string | null,
    params?: Record<string, any>,
  ) {
    const { user } = useAuthStore()
    const userType = (user as any)?.user_type
    const isCorporateSuperAdmin = userType === 'corporate super admin'

    return useQuery({
      queryKey: ['corporate-vendor-cards', vendorId, params],
      queryFn: () => getCardsByVendorIdForCorporate(vendorId!, params),
      enabled: isCorporateSuperAdmin && !!vendorId,
    })
  }

  return {
    useGetCorporateService,
    useGetCorporateByIdService,
    useGetAuditLogsCorporateService,
    useGetRequestsCorporateService,
    useGetRequestsCorporateSuperAdminVendorService,
    useGetCorporateRequestByIdService,
    useGetCorporateSuperAdminVendorRequestInfoService,
    useGetCorporateAdminsService,
    useGetInvitedCorporateAdminsService,
    useGetCorporatePaymentInfoService,
    useGetAllCorporatePaymentsService,
    useGetPaymentByIdService,
    useGetAllRecipientsService,
    useGetCartsService,
    useGetPaymentDetailsService,
    useGetPaymentDetailsByUserIdService,
    useGetCardsService,
    useGetCorporateCardsService,
    useGetCorporateSuperAdminCardsService,
    useGetCorporateSuperAdminCardByIdService,
    useGetCorporateSuperAdminVendorCardsSummaryService,
    useGetCardsByVendorIdForCorporateService,
    useGetCorporateBranchesService,
    useGetCorporateBranchesByVendorIdService,
    useGetCorporateBranchesListService,
    useGetCorporateBranchByIdService,
    useGetCorporateBranchManagersService,
    useGetCorporateBranchRedemptionsService,
    useGetCorporateBranchCardsService,
    useGetCorporateBranchSummaryService,
    useGetCorporatePaymentsService,
    useGetCorporatePaymentByIdService,
    useGetCorporateRedemptionsService,
    useGetCorporateRedemptionsByVendorIdService,
    useGetCorporateSuperAdminBranchManagersService,
    useGetCorporateBranchManagerInvitationsService,
    useGetCorporateBranchManagerInvitationByIdService,
    useGetVendorInvitationsService,
    useGetAllVendorsManagementService,
    useGetVendorByIdManagementService,
  }
}
