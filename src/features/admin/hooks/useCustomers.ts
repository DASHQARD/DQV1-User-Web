import { useQuery } from '@tanstack/react-query'
import { getCustomers } from '../services'
import type { Customer, CustomersListResponse, CustomersQueryParams } from '@/types/customer'

export function useCustomers(queryParams?: CustomersQueryParams) {
  return useQuery<CustomersListResponse, Error, Customer[]>({
    queryKey: ['customers', queryParams],
    queryFn: () => getCustomers(queryParams),
  })
}
