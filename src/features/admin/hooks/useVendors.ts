import { useQuery } from '@tanstack/react-query'
import { getVendors } from '../services'
import type { VendorsQueryParams } from '@/types/vendor'

export function useVendors(queryParams?: VendorsQueryParams) {
  return useQuery({
    queryKey: ['vendors', queryParams],
    queryFn: () => getVendors(queryParams),
  })
}
