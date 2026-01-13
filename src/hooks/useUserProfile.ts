import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, updateUserAvatar } from '@/services'
import { useToast } from './useToast'
import { useAuthStore } from '@/stores/auth'

export function useUserProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  function useGetUserProfileService() {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: getUserProfile,
      enabled: !!isAuthenticated,
    })
  }

  function useUpdateUserAvatarService() {
    const { success, error } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: updateUserAvatar,
      onSuccess: (response: any) => {
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        success(response?.message || 'Avatar updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        error(err?.message || 'Failed to update avatar. Please try again.')
      },
    })
  }

  return {
    useGetUserProfileService,
    useUpdateUserAvatarService,
  }
}
