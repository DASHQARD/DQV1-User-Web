import { useMutation } from '@tanstack/react-query'
import { onboardAdmin } from '../services'
import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/utils/constants'

export function useAdminOnboarding() {
  const toast = useToast()
  const navigate = useNavigate()
  const authenticate = useAuthStore((state) => state.authenticate)

  return useMutation({
    mutationFn: onboardAdmin,
    onSuccess: (response: {
      message: string
      data?: {
        accessToken: string
        refreshToken: string
      }
      accessToken?: string
      refreshToken?: string
    }) => {
      const accessToken = response?.data?.accessToken ?? response?.accessToken
      const refreshToken = response?.data?.refreshToken ?? response?.refreshToken

      if (accessToken && refreshToken) {
        authenticate({
          token: accessToken,
          refreshToken: refreshToken,
        })
        toast.success(response.message || 'Onboarding successful')
        navigate(ROUTES.IN_APP.ADMIN.HOME)
      } else {
        toast.success(response.message || 'Onboarding successful')
        navigate(ROUTES.IN_APP.ADMIN.AUTH.LOGIN)
      }
    },
    onError: (error: { status: number; message: string }) => {
      const errorMessage = error?.message || 'Onboarding failed. Please try again.'
      toast.error(errorMessage)
    },
  })
}

