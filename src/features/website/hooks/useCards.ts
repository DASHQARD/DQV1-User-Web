import { useQuery } from '@tanstack/react-query'
import { getCards, getPublicCards, getPublicVendorCards } from '../services'

export function useCards() {
  function useCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['cards', query],
      queryFn: () => getCards(query),
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

  return {
    useCardsService,
    usePublicCardsService,
    usePublicVendorCardsService,
  }
}
