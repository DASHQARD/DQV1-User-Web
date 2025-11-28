import { useMutation } from '@tanstack/react-query'
import { refreshAdminToken } from '../services'
import type { AdminRefreshTokenPayload, AdminRefreshTokenResponse } from '@/types/admin'
import { useAuthStore } from '@/stores'
import { useToast } from '@/hooks'

export function useAdminRefreshToken() {
  const authenticate = useAuthStore((state) => state.authenticate)
  const toast = useToast()

  return useMutation<AdminRefreshTokenResponse, Error, AdminRefreshTokenPayload>({
    mutationFn: refreshAdminToken,
    onSuccess: (response) => {
      const accessToken = response?.data?.accessToken ?? response?.accessToken
      const refreshToken = response?.data?.refreshToken ?? response?.refreshToken

      if (accessToken && refreshToken) {
        authenticate({
          token: accessToken,
          refreshToken: refreshToken,
        })
      } else {
        toast.error('Invalid refresh token response')
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to refresh token')
    },
  })
}

