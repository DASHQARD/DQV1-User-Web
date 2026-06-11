import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import { useGuestOtpVerified } from '@/features/website/services/guestSession'
import {
  getGuestCards,
  getGuestCardSingle,
  getGuestCartRecipients,
} from '../services/cards'
import type { GuestGetCardsParams } from '@/types/responses'
import { parseGuestCreatedCardsResponse } from '../utils/guestCreatedCards'
function useGuestCartQueriesEnabled(enabled = true) {
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  return enabled && isGuestAuth && isSessionReady
}

/** Post-purchase guest views (cards list) still require OTP-verified guest auth. */
function useGuestPostPurchaseQueriesEnabled(enabled = true) {
  const guestOtpVerified = useGuestOtpVerified()
  return useGuestCartQueriesEnabled(enabled) && guestOtpVerified
}

export function useGuestQueries() {
  function useGetGuestCardsService(params?: GuestGetCardsParams, enabled = true) {
    const guestQueriesEnabled = useGuestPostPurchaseQueriesEnabled(enabled)
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
    const guestQueriesEnabled = useGuestPostPurchaseQueriesEnabled(enabled)
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
    const guestQueriesEnabled = useGuestCartQueriesEnabled(enabled)
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
  const guestQueriesEnabled = useGuestCartQueriesEnabled(enabled)

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
