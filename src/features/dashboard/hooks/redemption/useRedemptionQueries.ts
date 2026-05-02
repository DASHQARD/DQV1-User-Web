import { useQuery } from '@tanstack/react-query'

import {
  searchVendors,
  getRedemptions,
  getUserRedemptions,
  getVendorRedemptions,
  getVendorRedemptionsList,
  getRedemptionsSummary,
  type SearchVendorsParams,
  type GetRedemptionsParams,
  type GetUserRedemptionsParams,
  type GetVendorRedemptionsParams,
  type GetVendorRedemptionsListParams,
  type GetRedemptionsSummaryParams,
  getRedemptionsAmountDashGo,
  getRedemptionsAmountDashPro,
  getGuestAssignedCards,
  getGuestRedemptionsAmountDashGo,
  getGuestRedemptionsAmountDashPro,
  getGuestRedemptionsAmountDashX,
  getGuestRedemptionsAmountDashPass,
  getGuestRedemptions,
  type GetRedemptionsAmountDashGoParams,
  getRedemptionsAmountDashX,
  type GetRedemptionsAmountDashXParams,
  getRedemptionsAmountDashPass,
  type GetRedemptionsAmountDashPassParams,
} from '../../services/redemptions'
import { useAuthStore } from '@/stores'

export function useRedemptionQueries() {
  function useSearchVendorsService(params?: SearchVendorsParams) {
    return useQuery({
      queryKey: ['search-vendors', params],
      queryFn: () => searchVendors(params),
      enabled: !!params?.search,
    })
  }

  function useGetRedemptionsService(params?: GetRedemptionsParams) {
    return useQuery({
      queryKey: ['redemptions', params],
      queryFn: () => getRedemptions(params),
    })
  }

  function useGetUserRedemptionsService(params?: GetUserRedemptionsParams) {
    return useQuery({
      queryKey: ['user-redemptions', params],
      queryFn: () => getUserRedemptions(params),
    })
  }

  function useGetVendorRedemptionsService(params?: GetVendorRedemptionsParams) {
    const { user } = useAuthStore()
    const isBranch = user?.user_type === 'branch'

    // Only enable if user profile is loaded and user is NOT a branch manager
    return useQuery({
      queryKey: ['vendor-redemptions', params],
      queryFn: () => getVendorRedemptions(params),
      enabled: !isBranch,
    })
  }

  function useGetRedemptionsAmountDashGoService(params?: GetRedemptionsAmountDashGoParams) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useGuestRecipientApi = !isAuthenticated || isGuestAuth
    return useQuery({
      queryKey: ['redemptions-amount-dash-go', params, useGuestRecipientApi],
      queryFn: () =>
        useGuestRecipientApi
          ? getGuestRedemptionsAmountDashGo(params)
          : getRedemptionsAmountDashGo(params),
      enabled: useGuestRecipientApi
        ? isGuestAuth || !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
        : !!(params?.branch_id || params?.vendor_id),
    })
  }

  function useGetRedemptionsAmountDashProService(enabled?: boolean) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useGuestRecipientApi = !isAuthenticated || isGuestAuth
    const resolvedEnabled = enabled !== undefined ? enabled : isAuthenticated
    return useQuery({
      queryKey: ['redemptions-amount-dash-pro', useGuestRecipientApi],
      queryFn: () =>
        useGuestRecipientApi ? getGuestRedemptionsAmountDashPro() : getRedemptionsAmountDashPro(),
      enabled: resolvedEnabled,
    })
  }

  function useGetRedemptionsAmountDashXService(params?: GetRedemptionsAmountDashXParams) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useGuestRecipientApi = !isAuthenticated || isGuestAuth
    return useQuery({
      queryKey: ['redemptions-amount-dash-x', params, useGuestRecipientApi],
      queryFn: () =>
        useGuestRecipientApi
          ? getGuestRedemptionsAmountDashX(params)
          : getRedemptionsAmountDashX(params),
      enabled: useGuestRecipientApi
        ? isGuestAuth || !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
        : !!(params?.branch_id || params?.vendor_id),
    })
  }

  function useGetRedemptionsAmountDashPassService(params?: GetRedemptionsAmountDashPassParams) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useGuestRecipientApi = !isAuthenticated || isGuestAuth
    return useQuery({
      queryKey: ['redemptions-amount-dash-pass', params, useGuestRecipientApi],
      queryFn: () =>
        useGuestRecipientApi
          ? getGuestRedemptionsAmountDashPass(params)
          : getRedemptionsAmountDashPass(params),
      enabled: useGuestRecipientApi
        ? isGuestAuth || !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
        : !!(params?.branch_id || params?.vendor_id),
    })
  }

  function useGetRedemptionsSummaryService(params?: GetRedemptionsSummaryParams) {
    return useQuery({
      queryKey: ['redemptions-summary', params],
      queryFn: () => getRedemptionsSummary(params),
    })
  }

  function useGetVendorRedemptionsListService(params?: GetVendorRedemptionsListParams) {
    return useQuery({
      queryKey: ['vendor-redemptions-list', params],
      queryFn: () => getVendorRedemptionsList(params),
    })
  }

  function useGetGuestAssignedCardsService(enabled: boolean = true) {
    const { isGuestAuth } = useAuthStore()
    return useQuery({
      queryKey: ['guest-assigned-cards'],
      queryFn: () => getGuestAssignedCards(),
      enabled: isGuestAuth && enabled,
    })
  }

  function useGetGuestRedemptionsService(enabled: boolean = true) {
    const { isGuestAuth } = useAuthStore()
    return useQuery({
      queryKey: ['guest-redemptions'],
      queryFn: () => getGuestRedemptions(),
      enabled: isGuestAuth && enabled,
    })
  }

  return {
    useSearchVendorsService,
    useGetRedemptionsService,
    useGetUserRedemptionsService,
    useGetVendorRedemptionsService,
    useGetRedemptionsSummaryService,
    useGetVendorRedemptionsListService,
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashProService,
    useGetRedemptionsAmountDashXService,
    useGetRedemptionsAmountDashPassService,
    useGetGuestAssignedCardsService,
    useGetGuestRedemptionsService,
  }
}
