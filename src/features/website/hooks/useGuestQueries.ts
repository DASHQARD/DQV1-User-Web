import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import {
  getGuestCards,
  getGuestCardSingle,
  getGuestCartRecipients,
} from '../services/cards'
import type { GuestGetCardsParams } from '@/types/responses'
import { parseGuestCreatedCardsResponse } from '../utils/guestCreatedCards'

export function useGuestQueries() {
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  function useGetGuestCardsService(params?: GuestGetCardsParams, enabled = true) {
    return useQuery({
      queryKey: ['guest-cards', params],
      queryFn: async () => parseGuestCreatedCardsResponse(await getGuestCards(params)),
      enabled: isGuestAuth && enabled,
    })
  }

  function useGetGuestCardSingleService(
    guestCardId: number | string | null | undefined,
    enabled = true,
  ) {
    return useQuery({
      queryKey: ['guest-cards', 'single', guestCardId],
      queryFn: () => getGuestCardSingle({ guest_card_id: guestCardId! }),
      enabled: isGuestAuth && enabled && guestCardId != null && guestCardId !== '',
    })
  }

  function useGetGuestCartRecipientsService(
    cartItemId: string | number | null | undefined,
    enabled = true,
  ) {
    return useQuery({
      queryKey: ['guest-cart-recipients', cartItemId],
      queryFn: () => getGuestCartRecipients({ cart_item_id: cartItemId! }),
      enabled: isGuestAuth && enabled && cartItemId != null && cartItemId !== '',
    })
  }

  return {
    useGetGuestCardsService,
    useGetGuestCardSingleService,
    useGetGuestCartRecipientsService,
  }
}

/** Fetch recipients per cart line for guest view bag / checkout */
export function useGuestRecipientsByCartItems(
  cartItemIds: Array<string | number>,
  enabled: boolean,
) {
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  const queries = useQueries({
    queries: cartItemIds.map((cartItemId) => ({
      queryKey: ['guest-cart-recipients', cartItemId],
      queryFn: () => getGuestCartRecipients({ cart_item_id: cartItemId }),
      enabled: enabled && isGuestAuth && cartItemId != null && cartItemId !== '',
    })),
  })

  const recipientsByCartItem = cartItemIds.reduce<Record<string, unknown[]>>((map, id, index) => {
    const key = String(id)
    const result = queries[index]?.data
    map[key] = Array.isArray(result) ? result : []
    return map
  }, {})

  const isLoading = queries.some((q) => q.isLoading)
  const isFetching = queries.some((q) => q.isFetching)

  return { recipientsByCartItem, isLoading, isFetching, refetch: () => queries.forEach((q) => q.refetch()) }
}
