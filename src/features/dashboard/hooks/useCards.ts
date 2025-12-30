import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getGiftCardMetrics,
} from '../services/cards'
import type { CreateCardData, UpdateCardData } from '@/types/responses'

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: () => getCards(),
    enabled: false,
  })
}

export function useCard(id: number | null) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(id!),
    enabled: false,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data: CreateCardData) => createCard(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success(response.message || 'Card created successfully')
    },
    onError: (error: { status: number; message: string }) => {
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
    mutationFn: (id: number) => deleteCard(id),
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
