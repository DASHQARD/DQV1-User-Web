import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { getRecipientCards } from '../services'
import { getRecipientByID } from '../services/recipients'

export function useRecipientCards() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  function useRecipientCardsService() {
    return useQuery({
      queryKey: ['recipient-cards'],
      queryFn: getRecipientCards,
      enabled: isAuthenticated,
    })
  }

  function useGetRecipientByIDsService(id: number) {
    return useQuery({
      queryKey: ['recipient-by-ids'],
      queryFn: () => getRecipientByID(id),
      enabled: !!id,
    })
  }

  return {
    useRecipientCardsService,
    useGetRecipientByIDsService,
  }
}
