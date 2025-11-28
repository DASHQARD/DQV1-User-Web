import { useQuery } from '@tanstack/react-query'
import { getPermissions } from '../services'
import type { Permission } from '@/types/role'

export function usePermissions() {
  return useQuery<Permission[], Error>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await getPermissions()
      return response.data || []
    },
  })
}
