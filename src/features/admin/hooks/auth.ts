import React from 'react'
import { useNavigate } from 'react-router'

import { useMutation } from '@tanstack/react-query'

import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

import { adminLogin, verifyLoginToken } from '../services'

export function useAuth() {
  const toast = useToast()
  const [tokenExpired, setTokenExpired] = React.useState(false)
  const navigate = useNavigate()

  function useAdminLoginMutation() {
    return useMutation({
      mutationFn: adminLogin,
      onSuccess: (response: { message: string }) => {
        toast.success(response.message)
      },
      onError: (error: { status: number; message: string }) => {
        if (error.status === 401) {
          toast.error(error.message)
        } else {
          toast.error('Login failed. Please try again.')
        }
      },
    })
  }

  function useVerifyLoginTokenService() {
    return useMutation({
      mutationFn: verifyLoginToken,
      onSuccess: (response: { accessToken: string; refreshToken: string }) => {
        useAuthStore.getState().authenticate({
          token: response.accessToken,
          refreshToken: response.refreshToken,
        })
        toast.success('Login successful')
        navigate(ROUTES.IN_APP.ADMIN.HOME)
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Verify login OTP failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  return {
    useAdminLoginMutation,
    tokenExpired,
    setTokenExpired,
    useVerifyLoginTokenService,
  }
}
