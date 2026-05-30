import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import {
  getGuestCards,
  getGuestCardSingle,
  getGuestCartRecipients,
} from '../services/cards'
import type { GuestGetCardsParams } from '@/types/responses'
import { parseGuestCreatedCardsResponse } from '../utils/guestCreatedCards'
import { useGuestBagNotReady } from './useGuestBagNotReady'

function useGuestApiQueriesEnabled(enabled = true) {
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const guestBagNotReady = useGuestBagNotReady()
  return enabled && isGuestAuth && isSessionReady && !guestBagNotReady
}

export function useGuestQueries() {
  function useGetGuestCardsService(params?: GuestGetCardsParams, enabled = true) {
    const guestQueriesEnabled = useGuestApiQueriesEnabled(enabled)
    return useQuery({
      queryKey: ['guest-cards', params],
      queryFn: async () => parseGuestCreatedCardsResponse(await getGuestCards(params)),
      enabled: guestQueriesEnabled,
    })
  }

  function useGetGuestCardSingleService(
    guestCardId: number | string | null | undefined,
    enabled = true,
  ) {
    const guestQueriesEnabled = useGuestApiQueriesEnabled(enabled)
    return useQuery({
      queryKey: ['guest-cards', 'single', guestCardId],
      queryFn: () => getGuestCardSingle({ guest_card_id: guestCardId! }),
      enabled:
        guestQueriesEnabled && guestCardId != null && guestCardId !== '',
    })
  }

  function useGetGuestCartRecipientsService(
    cartItemId: string | number | null | undefined,
    enabled = true,
  ) {
    const guestQueriesEnabled = useGuestApiQueriesEnabled(enabled)
    return useQuery({
      queryKey: ['guest-cart-recipients', cartItemId],
      queryFn: () => getGuestCartRecipients({ cart_item_id: cartItemId! }),
      enabled:
        guestQueriesEnabled &&
        cartItemId != null &&
        cartItemId !== '' &&
        !isLocalGuestCartLineId(cartItemId),
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
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const guestBagNotReady = useGuestBagNotReady()
  const guestQueriesEnabled = enabled && isGuestAuth && isSessionReady && !guestBagNotReady

  const queries = useQueries({
    queries: cartItemIds.map((cartItemId) => ({
      queryKey: ['guest-cart-recipients', cartItemId],
      queryFn: () => getGuestCartRecipients({ cart_item_id: cartItemId }),
      enabled:
        guestQueriesEnabled &&
        cartItemId != null &&
        cartItemId !== '' &&
        !isLocalGuestCartLineId(cartItemId),
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
