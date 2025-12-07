import { useQuery } from '@tanstack/react-query'
import { getVendorInfo, getVendorCards } from '../services'
import type {
  VendorDetails,
  VendorDetailsResponse,
  VendorCardsResponse,
  VendorCards,
} from '@/types'

export function useVendorDetails(id: string) {
  return useQuery<VendorDetailsResponse, Error, VendorDetails>({
    queryKey: ['vendor-details', id],
    queryFn: () => getVendorInfo(id),
    enabled: !!id,
  })
}

export function useGetVendorCards(id: string) {
  return useQuery<VendorCardsResponse, Error, VendorCards[]>({
    queryKey: ['vendor-cards', id],
    queryFn: () => getVendorCards(id),
    enabled: !!id,
  })
}
