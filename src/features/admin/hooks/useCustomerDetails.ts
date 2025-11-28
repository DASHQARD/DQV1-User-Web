import { useQuery } from '@tanstack/react-query'
import { getCustomerInfo } from '../services'

export function useCustomerDetails(id: number | null) {
  return useQuery({
    queryKey: ['customer-details', id],
    queryFn: () => getCustomerInfo(id!),
    enabled: !!id,
  })
}
