import React from 'react'
import { useNavigate } from 'react-router'

import { useMutation } from '@tanstack/react-query'

import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

import { login, createAccount } from '../services'

export function useAuth() {
  const toast = useToast()
  const [tokenExpired, setTokenExpired] = React.useState(false)
  // const { mutate: sendOtpMutation } = useSendOtpMutation();
  const navigate = useNavigate()
  const [steps, setSteps] = React.useState(1)

  function useCreateAccountMutation() {
    return useMutation({
      mutationFn: createAccount,
      onSuccess: (response: {
        status: string
        statusCode: number
        message: string
        data: { user: { id: string; email: string; user_type: string; verificationToken: string } }
      }) => {
        toast.success(response.message)
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (error: any) => {
        const errorMessage = error?.message || 'Create account failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useLoginMutation() {
    return useMutation({
      mutationFn: login,
      onSuccess: (response: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
        isSuperAdmin: boolean
        has_verified_login_otp: false
        token: string
      }) => {
        if (!response.has_verified_login_otp) {
          setSteps(2)
          // sendOtpMutation();
        } else {
          useAuthStore.getState().authenticate({
            token: response.token,
          })

          navigate(ROUTES.IN_APP.HOME)
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.message || 'Login failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  return {
    useLoginMutation,
    steps,
    setSteps,
    tokenExpired,
    setTokenExpired,
    useCreateAccountMutation,
  }
}
