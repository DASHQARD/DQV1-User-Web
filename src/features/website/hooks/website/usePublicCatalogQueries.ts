import { useQuery } from '@tanstack/react-query'
import { getPublicVendors, getPublicCards, getCards, getVendorQrCode } from '../../services'
import type {
  PublicCardsResponse,
  VendorDetailsResponse,
  RecipientsListResponse,
} from '@/types/responses'
import { getCartAllRecipients } from '../../services/recipients'

export function usePublicCatalogQueries() {
  function usePublicCardsService(query?: Record<string, any>) {
    return useQuery<PublicCardsResponse, Error, PublicCardsResponse>({
      queryKey: ['public-cards', query],
      queryFn: () => getPublicCards(query),
    })
  }

  function usePublicVendors(query?: Record<string, any>) {
    return useQuery<VendorDetailsResponse, Error, VendorDetailsResponse>({
      queryKey: ['public-vendors-list', query],
      queryFn: () => getPublicVendors(query),
    })
  }

  function usePublicVendorsService(query?: Record<string, any>) {
    return useQuery<VendorDetailsResponse, Error, VendorDetailsResponse>({
      queryKey: ['public-vendors', query],
      queryFn: () => getPublicVendors(query),
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

  function useVendorQrCodeService(vendor_id: string | null) {
    return useQuery<
      { qr_code: string; vendor_account_id: number },
      Error,
      { qr_code: string; vendor_account_id: number }
    >({
      queryKey: ['vendor-qr-code', vendor_id],
      queryFn: () => getVendorQrCode(vendor_id || ''),
      enabled: !!vendor_id,
    })
  }

  function useGetCartAllRecipientsService() {
    return useQuery<RecipientsListResponse, Error, RecipientsListResponse>({
      queryKey: ['cart-all-recipients'],
      queryFn: () => getCartAllRecipients(),
    })
  }

  return {
    usePublicCardsService,
    usePublicVendorsService,
    usePublicVendorCardsService,
    useCardsService,
    usePublicVendors,
    useVendorQrCodeService,
    useGetCartAllRecipientsService,
  }
}
