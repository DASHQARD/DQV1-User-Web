import { useQuery } from '@tanstack/react-query'
import { getCards, getPublicCards } from '../services'

export function useCards() {
  function useCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['cards', query],
      queryFn: () => getCards(query),
    })
  }

  function usePublicCardsService() {
    return useQuery({
      queryKey: ['public-cards'],
      queryFn: getPublicCards,
    })
  }

  return {
    useCardsService,
    usePublicCardsService,
  }
}
