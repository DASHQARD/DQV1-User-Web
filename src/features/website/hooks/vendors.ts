import { useQuery } from '@tanstack/react-query'
import { useVendorsFilters } from './useVendorsFilters'
import type { VendorDetailsResponse } from '@/types'
import { VENDORS_QUERY_KEY } from '../services/query-keys'
import { getPublicVendors } from '../services'
import { useDebounce } from '@uidotdev/usehooks'

export function usePublicVendors() {
  const {
    // page,
    limit,
    search,
    status,
    vendor_id,
    branch_type,
    is_single_branch,
    parent_branch_id,
    card_type,
    card_id,
    date_from,
    date_to,
    min_price,
    max_price,
  } = useVendorsFilters()
  const debouncedSearch = useDebounce(search, 500)

  return useQuery<VendorDetailsResponse, Error, VendorDetailsResponse>({
    queryKey: VENDORS_QUERY_KEY.list({
      page: 1,
      limit,
      search: debouncedSearch || undefined,
      status: status || undefined,
    }),
    queryFn: () => {
      const params: Parameters<typeof getPublicVendors>[0] = {
        limit,
      }

      // Only include optional parameters if they have values
      if (status) params.status = status
      if (vendor_id) params.vendor_id = vendor_id
      if (branch_type) params.branch_type = branch_type
      if (is_single_branch) params.is_single_branch = is_single_branch
      if (parent_branch_id) params.parent_branch_id = parent_branch_id
      if (card_type) params.card_type = card_type
      if (card_id) params.card_id = card_id
      if (date_from) params.date_from = date_from
      if (date_to) params.date_to = date_to
      if (min_price) params.min_price = min_price
      if (max_price) params.max_price = max_price

      // Only include search if it has a value (trimmed)
      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim()
      }

      return getPublicVendors(params)
    },
  })
}
