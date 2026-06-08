import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getGiftCardMetrics,
  getCardMetricsDetails,
  rateCard,
  rateGuestCard,
  type RateCardPayload,
} from '../services/cards'
import type { CreateCardData, UpdateCardData } from '@/types/responses'
import type { GetCardMetricsDetailsParams } from '@/types'
import { useAuthStore } from '@/stores'

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => getCards(),
    enabled: false,
  })
}

export function useCard(id: string | number | null) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(id!),
    enabled: false,
  })
}

type UseCreateCardOptions = {
  /** When false, skips the API success toast (e.g. website purchase then add-to-cart). */
  showSuccessToast?: boolean
  /** When false, skips the API error toast (caller shows a combined purchase message). */
  showErrorToast?: boolean
}

export function useCreateCard(options?: UseCreateCardOptions) {
  const showSuccessToast = options?.showSuccessToast ?? true
  const showErrorToast = options?.showErrorToast ?? true
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: CreateCardData) => createCard(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      if (!showSuccessToast) return
      toast.success(response.message || 'Card created successfully')
    },
    onError: (error: { status: number; message: string }) => {
      if (!showErrorToast) return
      toast.error(error?.message || 'Failed to create card')
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: UpdateCardData) => updateCard(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['card', variables.card_id] })
      toast.success(response.message || 'Card updated successfully')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to update card')
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (id: string | number) => deleteCard(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['gift-card-metrics'] })
      toast.success(response.message || 'Card deleted successfully')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to delete card')
    },
  })
}

export function useGiftCardMetrics() {
  return useQuery({
    queryKey: ['gift-card-metrics'],
    queryFn: getGiftCardMetrics,
  })
}

export function useCardMetricsDetails(params?: GetCardMetricsDetailsParams) {
  return useQuery({
    queryKey: ['card-metrics-details', params],
    queryFn: () => getCardMetricsDetails(params),
    enabled: !!params?.card_type,
  })
}

export function useRateCard() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: RateCardPayload) => {
      const isGuestAuth = useAuthStore.getState().isGuestAuth
      return isGuestAuth ? rateGuestCard(data) : rateCard(data)
    },
    onSuccess: (response) => {
      if (useAuthStore.getState().isGuestAuth) {
        queryClient.invalidateQueries({ queryKey: ['guest-cards'] })
        queryClient.invalidateQueries({ queryKey: ['guest-assigned-cards'] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['cards'] })
        queryClient.invalidateQueries({ queryKey: ['card-metrics-details'] })
      }
      toast.success(response?.message || 'Rating submitted successfully')
    },
    onError: (error: { status: number; message: string }) => {
      toast.error(error?.message || 'Failed to submit rating')
    },
  })
}
