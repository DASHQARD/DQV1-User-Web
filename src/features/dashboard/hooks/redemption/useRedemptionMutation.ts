import { useToast } from '@/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCardBalance,
  initiateRedemption,
  processCardsRedemption,
  processDashProRedemption,
  processRedemptionCards,
  updateRedemptionStatus,
  validateVendorMobileMoney,
  type CardBalanceParams,
  type CardsRedemptionPayload,
  type DashProRedemptionPayload,
  type InitiateRedemptionPayload,
  type UpdateRedemptionStatusPayload,
  type ValidateVendorMobileMoneyPayload,
} from '../../services'

export function useRedemptionMutation() {
  const { error, success } = useToast()
  const queryClient = useQueryClient()
  function useProcessRedemptionCardsService() {
    return useMutation({
      mutationFn: processRedemptionCards,
      onSuccess: (data: any) => {
        success(data?.message || 'Redemption successful')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Redemption failed')
      },
    })
  }

  function useGetCardBalanceService() {
    return useMutation({
      mutationFn: (params: CardBalanceParams) => getCardBalance(params),
      onError: (err: any) => {
        error(err?.message || 'Failed to check balance. Please try again.')
      },
    })
  }

  function useProcessDashProRedemptionService() {
    return useMutation({
      mutationFn: (data: DashProRedemptionPayload) => processDashProRedemption(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to process redemption. Please try again.')
      },
    })
  }

  function useProcessCardsRedemptionService() {
    return useMutation({
      mutationFn: (data: CardsRedemptionPayload) => processCardsRedemption(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to process redemption. Please try again.')
      },
    })
  }

  function useValidateVendorMobileMoneyService() {
    return useMutation({
      mutationFn: (data: ValidateVendorMobileMoneyPayload) => validateVendorMobileMoney(data),
      // Success is handled in the component to extract vendor_name
      onError: (err: any) => {
        error(err?.message || 'Failed to validate vendor. Please try again.')
      },
    })
  }

  function useUpdateRedemptionStatusService() {
    return useMutation({
      mutationFn: (data: UpdateRedemptionStatusPayload) => updateRedemptionStatus(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption status updated successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
      },
      onError: (err: any) => {
        error(err?.message || 'Failed to update redemption status. Please try again.')
      },
    })
  }

  function useInitiateRedemptionService() {
    return useMutation({
      mutationFn: (data: InitiateRedemptionPayload) => initiateRedemption(data),
      onError: (err: any) => {
        error(err?.message || 'Failed to initiate redemption. Please try again.')
      },
    })
  }

  return {
    useProcessRedemptionCardsService,
    useGetCardBalanceService,
    useProcessDashProRedemptionService,
    useProcessCardsRedemptionService,
    useValidateVendorMobileMoneyService,
    useUpdateRedemptionStatusService,
    useInitiateRedemptionService,
  }
}
