import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getPublicVendors, getPublicCards, getCards } from '../../services'
import type {
  PublicCardsResponse,
  VendorDetailsResponse,
  RecipientsListResponse,
} from '@/types/responses'
import { getCartAllRecipients, getRecipientByID } from '../../services/recipients'

type PublicCatalogQueryOptions = Pick<UseQueryOptions, 'staleTime' | 'enabled' | 'gcTime'>

export function usePublicCatalogQueries() {
  function usePublicCardsService(
    query?: Record<string, any>,
    options?: PublicCatalogQueryOptions,
  ) {
    return useQuery<PublicCardsResponse, Error, PublicCardsResponse>({
      queryKey: ['public-cards', query],
      queryFn: () => getPublicCards(query),
      ...options,
    })
  }

  function usePublicVendors(query?: Record<string, any>, options?: PublicCatalogQueryOptions) {
    return useQuery<VendorDetailsResponse, Error, VendorDetailsResponse>({
      queryKey: ['public-vendors-list', query],
      queryFn: () => getPublicVendors(query),
      ...options,
    })
  }

  function usePublicVendorsService(query?: Record<string, any>, enabled = true) {
    return useQuery<VendorDetailsResponse, Error, VendorDetailsResponse>({
      queryKey: ['public-vendors', query],
      queryFn: () => getPublicVendors(query),
      enabled,
    })
  }

  function usePublicVendorCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['public-vendor-cards', query],
      queryFn: () => getPublicVendors({ ...query } as any),
    })
  }

  function useCardsService(query?: Record<string, any>) {
    return useQuery({
      queryKey: ['cards', query],
      queryFn: () => getCards(query),
      enabled: false,
    })
  }

  function useGetCartAllRecipientsService(enabled = true) {
    return useQuery<RecipientsListResponse, Error, RecipientsListResponse>({
      queryKey: ['cart-all-recipients'],
      queryFn: () => getCartAllRecipients(),
      enabled,
    })
  }

  function useGetRecipientsByCartIdService(cartId: number | null) {
    return useQuery<RecipientsListResponse, Error, RecipientsListResponse>({
      queryKey: ['cart-recipients', cartId],
      queryFn: () => getRecipientByID(cartId!),
      enabled: !!cartId,
    })
  }

  return {
    usePublicCardsService,
    usePublicVendorsService,
    usePublicVendorCardsService,
    useCardsService,
    usePublicVendors,
    useGetCartAllRecipientsService,
    useGetRecipientsByCartIdService,
  }
}
