import React from 'react'
import { useNavigate } from 'react-router'

import { useMutation, useQuery } from '@tanstack/react-query'

import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import type {
  OnboardingData,
  UploadIdentificationPhotosData,
  PaymentMethodData,
} from '@/types/auth/auth'

import {
  businessUploadID,
  businessDetails,
  refreshToken,
  forgotPassword,
  login,
  getCountries,
  resetPassword,
  uploadUserID,
  verifyEmail,
  verifyLoginOTP,
  signUp,
  changePassword,
  logout,
  personalDetails,
  personalDetailsWithID,
  paymentMethod,
  uploadIdentificationPhotos,
  resendRefreshToken,
  getCountriesCode,
  businessDetailsWithDocuments,
} from '../services'

export function useAuth() {
  const { success, error } = useToast()
  const [tokenExpired, setTokenExpired] = React.useState(false)

  const navigate = useNavigate()

  function useSignUpMutation() {
    return useMutation({
      mutationFn: signUp,
      onSuccess: (response: any) => {
        success(
          response.data?.message ||
            'Account created successfully. Email verification link has been sent to your email.',
        )
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (err: any) => {
        const errorMessage = err?.message || 'Create account failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useVerifyEmailMutation() {
    return useMutation({
      mutationFn: async (token: string) => {
        const response = await verifyEmail(token)
        return (response as any).data as {
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
        }
      },
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
      onError: (err: { status: number; message: string }) => {
        if (err.status === 401) {
          error(err.message)
        } else {
          error('Verify email failed. Please try again.')
        }
      },
    })
  }

  function useLoginMutation() {
    return useMutation({
      mutationFn: login,
      onSuccess: (response: any) => {
        success(response.data?.message)
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Login failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useRefreshTokenService() {
    return useMutation({
      mutationFn: async (refreshTokenValue: string) => {
        const response = await refreshToken(refreshTokenValue)
        return (response as any).data as {
          message?: string
          tokens?: { accessToken: string; refreshToken: string }
          accessToken?: string
          refreshToken?: string
        }
      },
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
          success(response.message)
        }
        navigate(ROUTES.IN_APP.DASHBOARD.HOME)
      },
      onError: (err: { status: number; message: string }) => {
        error(err.message)
      },
    })
  }

  function usePersonalDetailsService() {
    return useMutation({
      mutationFn: async (data: OnboardingData) => {
        const response = await personalDetails(data)
        return (response as any).data as { status: string; statusCode: number; message: string }
      },
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        success(response.message || 'Personal details updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Onboarding failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function usePersonalDetailsWithIDService() {
    return useMutation({
      mutationFn: personalDetailsWithID,
      onSuccess: (response: any) => {
        console.log('response', response)
        success(
          response.data?.message || 'Personal details with identification updated successfully',
        )
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage =
          err?.message || 'Personal details with identification update failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useUploadIdentificationPhotosService() {
    return useMutation({
      mutationFn: async (data: UploadIdentificationPhotosData) => {
        const response = await uploadIdentificationPhotos(data)
        return (response as any).data as { status: string; statusCode: number; message: string }
      },
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        success(response.message || 'Identification photos added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage =
          err?.message || 'Identification photos upload failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useUploadUserIDService() {
    return useMutation({
      mutationFn: uploadUserID,
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        success(response.message || 'Identification photos added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Onboarding failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useBusinessDetailsWithDocumentsService() {
    return useMutation({
      mutationFn: businessDetailsWithDocuments,
      onSuccess: (response: any) => {
        success(response.data.message || 'Business details with documents updated successfully')
      },
    })
  }

  function useBusinessUploadIDService() {
    return useMutation({
      mutationFn: businessUploadID,
      onSuccess: (response: any) => {
        success(response.data.message || 'Identification photos added successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Onboarding failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useForgotPasswordService() {
    return useMutation({
      mutationFn: forgotPassword,
      onSuccess: () => {
        success('If the email exists, a reset link has been sent')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Forgot password failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useResetPasswordService() {
    return useMutation({
      mutationFn: resetPassword,
      onSuccess: () => {
        success('Password reset successfully')
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Reset password failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useChangePasswordService() {
    return useMutation({
      mutationFn: changePassword,
      onSuccess: () => {
        success('Password changed successfully')
      },
    })
  }

  function useLogoutService() {
    return useMutation({
      mutationFn: logout,
      onSuccess: () => {
        success('Logged out successfully')
      },
    })
  }

  function useVerifyLoginOTPService() {
    return useMutation({
      mutationFn: async (token: string) => {
        const response = await verifyLoginOTP(token)
        return response as {
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
          tokens: { accessToken: string; refreshToken: string }
        }
      },
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
        success('Login successful')
        if (
          response.user.user_type === 'corporate super admin' ||
          response.user.user_type === 'corporate admin'
        ) {
          navigate(`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`)
        } else if (response.user.user_type === 'vendor') {
          navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`)
        } else {
          navigate(`${ROUTES.IN_APP.DASHBOARD.HOME}?account=user`)
        }
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Verify login OTP failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useBusinessDetailsService() {
    return useMutation({
      mutationFn: businessDetails,
      onSuccess: () => {
        success('Business details updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Business details update failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useGetCountriesService() {
    return useQuery({
      queryKey: ['countries'],
      queryFn: getCountries,
    })
  }

  function useGetCountriesCodeService(country_code: string) {
    return useQuery({
      queryKey: ['countries-code'],
      queryFn: () => getCountriesCode(country_code),
      enabled: !!country_code,
    })
  }

  function usePaymentMethodService() {
    return useMutation({
      mutationFn: async (data: PaymentMethodData) => {
        const response = await paymentMethod(data)
        return (response as any).data as { status: string; statusCode: number; message: string }
      },
      onSuccess: (response: { status: string; statusCode: number; message: string }) => {
        success(response.message || 'Payment method updated successfully')
      },
      onError: (err: { status: number; message: string }) => {
        const errorMessage = err?.message || 'Payment method update failed. Please try again.'
        error(errorMessage)
      },
    })
  }

  function useResendRefreshTokenService() {
    return useMutation({
      mutationFn: async (email: string) => {
        const response = await resendRefreshToken(email)
        return (response as any).data as { message: string }
      },
      onSuccess: (response: { message: string }) => {
        console.log('response', response)
        success(response.message || 'Refresh token resent successfully')
      },
    })
  }

  return {
    useLoginMutation,
    tokenExpired,
    setTokenExpired,
    useSignUpMutation,
    useVerifyEmailMutation,
    usePersonalDetailsService,
    useUploadUserIDService,
    useVerifyLoginOTPService,
    useForgotPasswordService,
    useResetPasswordService,
    useBusinessDetailsService,
    useBusinessUploadIDService,
    useRefreshTokenService,
    useGetCountriesService,
    useGetCountriesCodeService,
    useChangePasswordService,
    useLogoutService,
    usePersonalDetailsWithIDService,
    useUploadIdentificationPhotosService,
    usePaymentMethodService,
    useResendRefreshTokenService,
    useBusinessDetailsWithDocumentsService,
  }
}
