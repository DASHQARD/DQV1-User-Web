import { useQuery } from '@tanstack/react-query'

import {
  searchVendors,
  getRedemptions,
  type SearchVendorsParams,
  type GetRedemptionsParams,
  getRedemptionsAmountDashGo,
  getRedemptionsAmountDashPro,
  type GetRedemptionsAmountDashGoParams,
  type GetRedemptionsAmountDashProParams,
  getRedemptionsAmountDashX,
  type GetRedemptionsAmountDashXParams,
  getRedemptionsAmountDashPass,
  type GetRedemptionsAmountDashPassParams,
} from '../../services/redemptions'

export function useRedemptionQueries() {
  function useSearchVendorsService(params?: SearchVendorsParams) {
    return useQuery({
      queryKey: ['search-vendors', params],
      queryFn: () => searchVendors(params),
      enabled: false,
    })
  }

  function useGetRedemptionsService(params?: GetRedemptionsParams) {
    return useQuery({
      queryKey: ['redemptions', params],
      queryFn: () => getRedemptions(params),
    })
  }

  function useGetRedemptionsAmountDashGoService(params?: GetRedemptionsAmountDashGoParams) {
    return useQuery({
      queryKey: ['redemptions-amount-dash-go', params],
      queryFn: () => {
        if (!params?.phone_number) {
          throw new Error('Phone number is required')
        }
        return getRedemptionsAmountDashGo(params)
      },
      enabled: !!params?.phone_number,
    })
  }

  function useGetRedemptionsAmountDashProService(params?: GetRedemptionsAmountDashProParams) {
    return useQuery({
      queryKey: ['redemptions-amount-dash-pro', params],
      queryFn: () => {
        if (!params?.phone_number) {
          throw new Error('Phone number is required')
        }
        return getRedemptionsAmountDashPro(params)
      },
      enabled: !!params?.phone_number,
    })
  }

  function useGetRedemptionsAmountDashXService(params?: GetRedemptionsAmountDashXParams) {
    return useQuery({
      queryKey: ['redemptions-amount-dash-x', params],
      queryFn: () => {
        if (!params?.phone_number) {
          throw new Error('Phone number is required')
        }
        return getRedemptionsAmountDashX(params)
      },
      enabled: !!params?.phone_number,
    })
  }
  function useGetRedemptionsAmountDashPassService(params?: GetRedemptionsAmountDashPassParams) {
    return useQuery({
      queryKey: ['redemptions-amount-dash-pass', params],
      queryFn: () => {
        if (!params?.phone_number) {
          throw new Error('Phone number is required')
        }
        return getRedemptionsAmountDashPass(params)
      },
      enabled: !!params?.phone_number,
    })
  }

  return {
    useSearchVendorsService,
    useGetRedemptionsService,
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashProService,
    useGetRedemptionsAmountDashXService,
    useGetRedemptionsAmountDashPassService,
  }
}
