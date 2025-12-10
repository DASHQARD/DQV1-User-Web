import { useMemo } from 'react'
import { useAuthStore } from '@/stores'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserInfo } from '../services'
import { useToast } from '@/hooks'

export function useUserInfo() {
  const { user } = useAuthStore()
  const toast = useToast()
  const queryClient = useQueryClient()

  const userInfo = useMemo(() => {
    const userData = user as any
    return {
      name: userData?.fullname || userData?.name || 'User',
      phone: userData?.phonenumber || userData?.phone || '',
      email: userData?.email || '',
    }
  }, [user])

  function useUpdateUserInfoService() {
    return useMutation({
      mutationFn: updateUserInfo,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        toast.success(response.message || 'User info updated successfully')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error?.message || 'Failed to update user info. Please try again.')
      },
    })
  }

  return {
    userInfo,
    useUpdateUserInfoService,
  }
}
