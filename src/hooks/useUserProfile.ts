import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/services'

export function userProfile() {
  function useGetUserProfileService() {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: getUserProfile,
    })
  }

  return {
    useGetUserProfileService,
  }
}
