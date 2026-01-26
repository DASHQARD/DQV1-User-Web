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
  getCorporateCards,
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
    return useQuery({
      queryKey: ['corporate-cards-experience', query],
      queryFn: () => getCorporateCards(query),
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
    useGetCorporateCardsService,
  }
}
