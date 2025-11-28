import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/services'

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
}
