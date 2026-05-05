import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { VerifyLoginOTPSchema } from '@/utils/schemas'
import { MODAL_NAMES, ROUTES } from '@/utils/constants'
import { useAuth } from './auth'
import { useCountdown, usePersistedModalState } from '@/hooks'

export function useOtpLoginModal() {
  const navigate = useNavigate()
  const { useVerifyLoginOTPService, useResendRefreshTokenService } = useAuth()
  const { mutate, isPending } = useVerifyLoginOTPService()
  const { mutate: resendRefreshToken } = useResendRefreshTokenService()
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.ROOT,
  })
  const email = modal.modalData?.email
  const [sessionId, setSessionId] = useState<string | null>(() =>
    sessionStorage.getItem('login_session_id'),
  )

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('login_session_id')
    }
  }, [])

  const form = useForm<z.infer<typeof VerifyLoginOTPSchema>>({
    resolver: zodResolver(VerifyLoginOTPSchema),
  })

  const onSubmit = (data: z.infer<typeof VerifyLoginOTPSchema>) => {
    if (!sessionId) return
    mutate({ session_id: sessionId, token: data.otp })
  }

  const { resendOtp, formatCountdown, countdown } = useCountdown({
    sendOtp: () => {
      resendRefreshToken(email || '', {
        onSuccess: (data) => {
          const newSessionId = data?.session_id
          if (newSessionId) {
            sessionStorage.setItem('login_session_id', newSessionId)
            setSessionId(newSessionId)
          }
        },
      })
    },
  })

  const verifyOtp = (otp: string) => {
    if (!sessionId) return
    mutate({ session_id: sessionId, token: otp })
  }

  const goToLogin = () => navigate(ROUTES.IN_APP.AUTH.LOGIN)

  return {
    form,
    onSubmit,
    isPending,
    verifyOtp,
    resendOtp,
    formatCountdown,
    countdown,
    goToLogin,
  }
}
