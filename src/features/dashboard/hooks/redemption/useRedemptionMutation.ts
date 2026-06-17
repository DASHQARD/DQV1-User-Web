import { useToast } from '@/hooks'
import { resolveRequestErrorMessage } from '@/utils/networkError'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCardBalance,
  initiateRedemption,
  processCardsRedemption,
  processGuestCardsRedemption,
  processDashProRedemption,
  processDashProRedemptionForUser,
  processRedemptionCards,
  processUserRedemptionCards,
  updateRedemptionStatus,
  validateVendorMobileMoney,
  type CardBalanceParams,
  type CardsRedemptionPayload,
  type DashProRedemptionPayload,
  type DashProRedemptionForUserPayload,
  type GuestCardsRedemptionPayload,
  type InitiateRedemptionPayload,
  type UpdateRedemptionStatusPayload,
  type ValidateVendorMobileMoneyPayload,
  type UserRedemptionCardsPayload,
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
        queryClient.invalidateQueries({ queryKey: ['redeemable-cards'] })
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
        queryClient.invalidateQueries({ queryKey: ['redeemable-cards'] })
      },
      onError: (err: any) => {
        error(resolveRequestErrorMessage(err, 'Failed to process redemption. Please try again.'))
      },
    })
  }

  function useProcessCardsRedemptionService() {
    return useMutation({
      mutationFn: (data: CardsRedemptionPayload) => processCardsRedemption(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
        queryClient.invalidateQueries({ queryKey: ['redeemable-cards'] })
      },
      onError: (err: any) => {
        error(resolveRequestErrorMessage(err, 'Failed to process redemption. Please try again.'))
      },
    })
  }

  function useProcessGuestCardsRedemptionService() {
    return useMutation({
      mutationFn: (data: GuestCardsRedemptionPayload) => processGuestCardsRedemption(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['guest-redemptions'] })
        queryClient.invalidateQueries({ queryKey: ['guest-assigned-cards'] })
        queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-go'] })
        queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-pro'] })
      },
      onError: (err: any) => {
        if (err?.status === 422) {
          console.error('[guest-redemption] Request body validation failed:', err?.message)
          error('Something went wrong, please try again.')
          return
        }
        error(resolveRequestErrorMessage(err, 'Failed to process redemption. Please try again.'))
      },
    })
  }

  function useValidateVendorMobileMoneyService() {
    return useMutation({
      mutationFn: (data: ValidateVendorMobileMoneyPayload) => validateVendorMobileMoney(data),
      retry: 1,
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

  function useProcessDashProRedemptionForUserService() {
    return useMutation({
      mutationFn: (data: DashProRedemptionForUserPayload) => processDashProRedemptionForUser(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
        queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-pro'] })
      },
      onError: (err: any) => {
        error(resolveRequestErrorMessage(err, 'Failed to process redemption. Please try again.'))
      },
    })
  }

  function useProcessUserRedemptionCardsService() {
    return useMutation({
      mutationFn: (data: UserRedemptionCardsPayload) => processUserRedemptionCards(data),
      onSuccess: (response: any) => {
        success(response?.message || 'Redemption processed successfully')
        queryClient.invalidateQueries({ queryKey: ['redemptions'] })
        queryClient.invalidateQueries({ queryKey: ['redeemable-cards'] })
        queryClient.invalidateQueries({ queryKey: ['guest-assigned-cards'] })
        queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-go'] })
        queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-pro'] })
      },
      onError: (err: any) => {
        error(resolveRequestErrorMessage(err, 'Failed to process redemption. Please try again.'))
      },
    })
  }

  return {
    useProcessRedemptionCardsService,
    useGetCardBalanceService,
    useProcessDashProRedemptionService,
    useProcessDashProRedemptionForUserService,
    useProcessUserRedemptionCardsService,
    useProcessCardsRedemptionService,
    useProcessGuestCardsRedemptionService,
    useValidateVendorMobileMoneyService,
    useUpdateRedemptionStatusService,
    useInitiateRedemptionService,
  }
}
