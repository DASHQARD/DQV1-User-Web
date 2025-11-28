import { useQuery } from '@tanstack/react-query'
import { getVendorInfo } from '../services'
import type { VendorDetails, VendorDetailsResponse } from '@/types'

export function useVendorDetails(id: number | null) {
  return useQuery<VendorDetailsResponse, Error, VendorDetails>({
    queryKey: ['vendor-details', id],
    queryFn: () => getVendorInfo(id!),
    enabled: !!id,
    select: (data) => data.data as unknown as VendorDetails,
  })
}
