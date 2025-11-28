import React from 'react'
import { useNavigate } from 'react-router'

import { useMutation, useQuery } from '@tanstack/react-query'

import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

import {
  addBranch,
  businessUploadID,
  businessDetails,
  createAccount,
  refreshToken,
  forgotPassword,
  login,
  onboarding,
  getCountries,
  resetPassword,
  uploadUserID,
  verifyEmail,
  verifyLoginOTP,
} from '../services'

export function useAuth() {
  const toast = useToast()
  const [tokenExpired, setTokenExpired] = React.useState(false)
  // const { mutate: sendOtpMutation } = useSendOtpMutation();
  const navigate = useNavigate()

  function useCreateAccountMutation() {
    return useMutation({
      mutationFn: createAccount,
      onSuccess: (response: {
        status: string
        statusCode: number
        message: string
        data: { user: { id: string; email: string; user_type: string; verificationToken: string } }
      }) => {
        toast.success(
          response.message ||
            'Account created successfully. Email verification link has been sent to your email.',
        )
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (error: any) => {
        const errorMessage = error?.message || 'Create account failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useVerifyEmailMutation() {
    return useMutation({
      mutationFn: verifyEmail,
      onSuccess: (response: {
        user: {
          id: number
          email: string
          email_verified: boolean
          onboarding_stage: string
          user_type: string
        }
        tokens: {
          accessToken: string
          refreshToken: string
        }
      }) => {
        useAuthStore.getState().authenticate({
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        })
      },
      onError: (error: { status: number; message: string }) => {
        if (error.status === 401) {
          toast.error(error.message)
        } else {
          toast.error('Verify email failed. Please try again.')
        }
      },
    })
  }

  function useLoginMutation() {
    return useMutation({
      mutationFn: login,
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

  function useRefreshTokenService() {
    return useMutation({
      mutationFn: refreshToken,
      onSuccess: (response: {
        message?: string
        tokens?: { accessToken: string; refreshToken: string }
        accessToken?: string
        refreshToken?: string
      }) => {
        const accessToken = response?.tokens?.accessToken ?? response?.accessToken ?? null
        const nextRefreshToken = response?.tokens?.refreshToken ?? response?.refreshToken ?? null
        if (accessToken) {
          useAuthStore.getState().authenticate({
            token: accessToken,
            refreshToken: nextRefreshToken ?? useAuthStore.getState().getRefreshToken(),
          })
        }
        if (response?.message) {
          toast.success(response.message)
        }
        navigate(ROUTES.IN_APP.DASHBOARD.HOME)
      },
      onError: (error: { status: number; message: string }) => {
        toast.error(error.message)
      },
    })
  }

  function useOnboardingService() {
    return useMutation({
      mutationFn: onboarding,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        toast.success(response.message || 'Personal details updated successfully')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Onboarding failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useUploadUserIDService() {
    return useMutation({
      mutationFn: uploadUserID,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        toast.success(response.message || 'Identification photos added successfully')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Onboarding failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useBusinessUploadIDService() {
    return useMutation({
      mutationFn: businessUploadID,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        toast.success(response.message || 'Identification photos added successfully')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Onboarding failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useForgotPasswordService() {
    return useMutation({
      mutationFn: forgotPassword,
      onSuccess: () => {
        toast.success('If the email exists, a reset link has been sent')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Forgot password failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useResetPasswordService() {
    return useMutation({
      mutationFn: resetPassword,
      onSuccess: () => {
        toast.success('Password reset successfully')
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Reset password failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useVerifyLoginOTPService() {
    return useMutation({
      mutationFn: verifyLoginOTP,
      onSuccess: (response: {
        user: {
          id: number
          fullname: string
          phonenumber: string
          email: string
          street_address: string
          user_type: string
          avatar: string | null
          status: string
          email_verified: boolean
          default_payment_option: string | null
          onboarding_stage: string
        }
        tokens: {
          accessToken: string
          refreshToken: string
        }
      }) => {
        useAuthStore.getState().authenticate({
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        })
        toast.success('Login successful')
        navigate(ROUTES.IN_APP.DASHBOARD.HOME)
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Verify login OTP failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useBusinessDetailsService() {
    return useMutation({
      mutationFn: businessDetails,
      onSuccess: () => {
        toast.success('Business details updated successfully')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Business details update failed. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useAddBranchService() {
    return useMutation({
      mutationFn: addBranch,
      onSuccess: () => {
        toast.success('Branch added successfully')
      },
      onError: (error: { status: number; message: string }) => {
        const errorMessage = error?.message || 'Failed to add branch. Please try again.'
        toast.error(errorMessage)
      },
    })
  }

  function useGetCountriesService() {
    return useQuery({
      queryKey: ['countries'],
      queryFn: getCountries,
      // select: (response) => response.data,
    })
  }

  return {
    useLoginMutation,
    tokenExpired,
    setTokenExpired,
    useCreateAccountMutation,
    useVerifyEmailMutation,
    useOnboardingService,
    useUploadUserIDService,
    useVerifyLoginOTPService,
    useForgotPasswordService,
    useResetPasswordService,
    useBusinessDetailsService,
    useBusinessUploadIDService,
    useRefreshTokenService,
    useAddBranchService,
    useGetCountriesService,
  }
}
