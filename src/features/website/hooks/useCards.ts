import { useMutation, useQuery } from '@tanstack/react-query'
import { getCards, getPublicCards, getPublicVendorCards, getPublicCardById } from '../services'
import { createCard } from '@/features/dashboard/services'
import { useToast } from '@/hooks'

export function useCards() {
  const toast = useToast()
  function useCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['cards', query],
      queryFn: () => getCards(query),
    })
  }

  function useCreateCardService() {
    return useMutation({
      mutationKey: ['create-card'],
      mutationFn: createCard,
      onSuccess: (response) => {
        toast.success(response.message || 'Card created successfully')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create card')
      },
    })
  }

  function usePublicCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['public-cards', query],
      queryFn: () => getPublicCards(query),
    })
  }

  function usePublicVendorCardsService(vendor_id: string) {
    return useQuery({
      queryKey: ['public-vendor-cards', vendor_id],
      queryFn: () => getPublicVendorCards(vendor_id),
    })
  }

  function usePublicCardById(card_id: string | number | null) {
    return useQuery({
      queryKey: ['public-card', card_id],
      queryFn: () => getPublicCardById(card_id!),
      enabled: !!card_id,
    })
  }

  return {
    useCardsService,
    usePublicCardsService,
    usePublicVendorCardsService,
    usePublicCardById,
    useCreateCardService,
  }
}
