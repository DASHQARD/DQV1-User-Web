import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  validateVendorMobileMoney,
  searchVendors,
  getCardBalance,
  processDashProRedemption,
  processCardsRedemption,
  getRedemptions,
  updateRedemptionStatus,
  type ValidateVendorMobileMoneyPayload,
  type SearchVendorsParams,
  type CardBalanceParams,
  type DashProRedemptionPayload,
  type CardsRedemptionPayload,
  type UpdateRedemptionStatusPayload,
  type GetRedemptionsParams,
  getRedemptionsAmountDashGo,
  getRedemptionsAmountDashPro,
  type GetRedemptionsAmountDashGoParams,
  type GetRedemptionsAmountDashProParams,
} from '../../services/redemptions'

export function useRedemptionQueries() {
  const toast = useToast()
  const queryClient = useQueryClient()

  function useValidateVendorMobileMoneyService() {
    return useMutation({
      mutationFn: (data: ValidateVendorMobileMoneyPayload) => validateVendorMobileMoney(data),
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to validate vendor. Please try again.')
      },
    })
  }

  function useSearchVendorsService(params?: SearchVendorsParams) {
    return useQuery({
      queryKey: ['search-vendors', params],
      queryFn: () => searchVendors(params),
      enabled: false, // Only fetch when explicitly called
    })
  }

  function useGetCardBalanceService() {
    return useMutation({
      mutationFn: (params: CardBalanceParams) => getCardBalance(params),
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to check balance. Please try again.')
      },
    })
  }

  function useProcessDashProRedemptionService() {
    return useMutation({
      mutationFn: (data: DashProRedemptionPayload) => processDashProRedemption(data),
      onSuccess: (response: any) => {
        toast.success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to process redemption. Please try again.')
      },
    })
  }

  function useProcessCardsRedemptionService() {
    return useMutation({
      mutationFn: (data: CardsRedemptionPayload) => processCardsRedemption(data),
      onSuccess: (response: any) => {
        toast.success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to process redemption. Please try again.')
      },
    })
  }

  function useGetRedemptionsService(params?: GetRedemptionsParams) {
    return useQuery({
      queryKey: ['redemptions', params],
      queryFn: () => getRedemptions(params),
    })
  }

  function useUpdateRedemptionStatusService() {
    return useMutation({
      mutationFn: (data: UpdateRedemptionStatusPayload) => updateRedemptionStatus(data),
      onSuccess: (response: any) => {
        toast.success(response?.message || 'Redemption status updated successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Failed to update redemption status. Please try again.')
      },
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

  return {
    useValidateVendorMobileMoneyService,
    useSearchVendorsService,
    useGetCardBalanceService,
    useProcessDashProRedemptionService,
    useProcessCardsRedemptionService,
    useGetRedemptionsService,
    useUpdateRedemptionStatusService,
    useGetRedemptionsAmountDashGoService,
    useGetRedemptionsAmountDashProService,
  }
}
