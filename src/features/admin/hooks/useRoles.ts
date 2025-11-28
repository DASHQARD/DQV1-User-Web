import { useQuery } from '@tanstack/react-query'
import { getRoles } from '../services'
import type { Role } from '@/types/role'

export function useRoles() {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await getRoles()
      return response.data || []
    },
  })
}
