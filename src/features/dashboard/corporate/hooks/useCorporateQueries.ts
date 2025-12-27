import { useQuery } from '@tanstack/react-query'
import {
  getCorporate,
  getCorporateById,
  getAuditLogsCorporate,
  getRequestsCorporate,
  getCorporateAdmins,
  getInvitedCorporateAdmins,
  getCorporatePaymentDetails,
  getAllCorporatePayments,
  getPaymentById,
  getAllRecipients,
  getCarts,
  getPaymentDetails,
  getPaymentDetailsByUserId,
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

  function useGetAuditLogsCorporateService() {
    return useQuery({
      queryKey: ['audit-logs-corporate'],
      queryFn: getAuditLogsCorporate,
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

  function useGetRequestsCorporateService() {
    return useQuery({
      queryKey: ['requests-corporate'],
      queryFn: getRequestsCorporate,
      enabled: false,
    })
  }

  function useGetCorporateAdminsService() {
    return useQuery({
      queryKey: ['corporate-admins'],
      queryFn: () => getCorporateAdmins(),
    })
  }

  function useGetInvitedCorporateAdminsService() {
    return useQuery({
      queryKey: ['invited-corporate-admins'],
      queryFn: () => getInvitedCorporateAdmins(),
    })
  }

  function useGetCorporatePaymentInfoService() {
    return useQuery({
      queryKey: ['corporate-payment-info'],
      queryFn: () => getCorporatePaymentDetails(),
    })
  }

  function useGetAllCorporatePaymentsService() {
    return useQuery({
      queryKey: ['all-corporate-payments'],
      queryFn: () => getAllCorporatePayments(),
    })
  }

  function useGetPaymentByIdService(id: string | number | null) {
    return useQuery({
      queryKey: ['payment-by-id', id],
      queryFn: () => getPaymentById(id!),
      enabled: !!id,
    })
  }

  function useGetAllRecipientsService() {
    return useQuery({
      queryKey: ['all-corporate-recipients'],
      queryFn: getAllRecipients,
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

  return {
    useGetCorporateService,
    useGetCorporateByIdService,
    useGetAuditLogsCorporateService,
    useGetRequestsCorporateService,
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
  }
}
