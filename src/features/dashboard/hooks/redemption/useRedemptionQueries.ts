import { useQuery } from '@tanstack/react-query'

import {
  searchVendors,
  searchVendorByGvid,
  getRedeemableCards,
  getRedeemableCardsForUser,
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
  getGuestRedemptions,
  type GetRedemptionsAmountDashGoParams,
  getRedemptionsAmountDashX,
  type GetRedemptionsAmountDashXParams,
  getRedemptionsAmountDashPass,
  type GetRedemptionsAmountDashPassParams,
} from '../../services/redemptions'
import type { RedeemableCardsParams } from '@/types'
import { useAuthStore } from '@/stores'
import { useVendorOperationalAccess } from '@/features/dashboard/hooks/useVendorOperationalAccess'

export function useRedemptionQueries() {
  function useSearchVendorsService(params?: SearchVendorsParams) {
    return useQuery({
      queryKey: ['search-vendors', params],
      queryFn: () => searchVendors(params),
      enabled: !!params?.search,
    })
  }

  function useSearchVendorByGvidService(gvid?: string) {
    return useQuery({
      queryKey: ['search-vendors-gvid', gvid],
      queryFn: () => searchVendorByGvid(gvid!),
      enabled: !!gvid?.trim(),
    })
  }

  function useGetRedeemableCardsService(
    params: RedeemableCardsParams | undefined,
    enabled = true,
  ) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useUserEndpoint = isAuthenticated && !isGuestAuth
    return useQuery({
      queryKey: ['redeemable-cards', params, useUserEndpoint],
      queryFn: () =>
        useUserEndpoint
          ? getRedeemableCardsForUser({
              method: params!.method,
              branch_id: params!.branch_id,
              vendor_gvid: params!.vendor_gvid,
            })
          : getRedeemableCards(params!),
      enabled:
        enabled &&
        !isGuestAuth &&
        !!params?.method &&
        (params.method === 'vendor_mobile_money' ||
          !!(params.branch_id?.trim() || params.vendor_gvid?.trim())) &&
        (useUserEndpoint || !!params.phone_number?.trim()),
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
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    // Only enable if user profile is loaded and user is NOT a branch manager
    return useQuery({
      queryKey: ['vendor-redemptions', params],
      queryFn: () => getVendorRedemptions(params),
      enabled: !isBranch && isOperationalAccessEnabled,
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
        ? isGuestAuth
          ? !!(params?.vendor_id || params?.branch_id)
          : !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
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
      queryFn: () => getRedemptionsAmountDashX(params),
      // Guests: DashX has no balance endpoint — use GET /guest-redemptions/assigned-cards
      enabled: isGuestAuth
        ? false
        : useGuestRecipientApi
          ? !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
          : !!(params?.branch_id || params?.vendor_id),
    })
  }

  function useGetRedemptionsAmountDashPassService(params?: GetRedemptionsAmountDashPassParams) {
    const { isAuthenticated, isGuestAuth } = useAuthStore()
    const useGuestRecipientApi = !isAuthenticated || isGuestAuth
    return useQuery({
      queryKey: ['redemptions-amount-dash-pass', params, useGuestRecipientApi],
      queryFn: () => getRedemptionsAmountDashPass(params),
      enabled: isGuestAuth
        ? false
        : useGuestRecipientApi
          ? !!(params?.phone_number && (params?.branch_id || params?.vendor_id))
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
    const { isOperationalAccessEnabled } = useVendorOperationalAccess()

    return useQuery({
      queryKey: ['vendor-redemptions-list', params],
      queryFn: () => getVendorRedemptionsList(params),
      enabled: isOperationalAccessEnabled,
    })
  }

  function useGetGuestAssignedCardsService(
    enabled: boolean = true,
    params?: { redemption_status?: 'all' | 'redeemed' | 'unredeemed' },
  ) {
    const { isGuestAuth } = useAuthStore()
    return useQuery({
      queryKey: ['guest-assigned-cards', params],
      queryFn: () => getGuestAssignedCards(params),
      enabled: isGuestAuth && enabled,
    })
  }

  function useGetGuestRedemptionsService(
    enabled: boolean = true,
    params?: { limit?: number; after?: string; card_type?: string },
  ) {
    const { isGuestAuth } = useAuthStore()
    return useQuery({
      queryKey: ['guest-redemptions', params],
      queryFn: () => getGuestRedemptions(params),
      enabled: isGuestAuth && enabled,
    })
  }

  return {
    useSearchVendorsService,
    useSearchVendorByGvidService,
    useGetRedeemableCardsService,
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
