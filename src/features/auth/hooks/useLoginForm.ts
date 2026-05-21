import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { LoginSchema } from '@/utils/schemas'
import { MODAL_NAMES, ROUTES } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'
import { useAuth } from './auth'

const UNVERIFIED_EMAIL_HINTS = [
  'verify',
  'verified',
  'verification',
  'email_verified',
  'not verified',
]

function isUnverifiedEmailError(err: { status?: number; message?: string } | undefined): boolean {
  if (!err) return false
  if (err.status !== 401) return false
  const msg = (err.message ?? '').toLowerCase()
  return UNVERIFIED_EMAIL_HINTS.some((hint) => msg.includes(hint))
}

export function useLoginForm() {
  const { useLoginMutation, useResendVerificationMutation } = useAuth()
  const { mutate, isPending } = useLoginMutation()
  const { mutate: resendVerification, isPending: isResendingVerification } =
    useResendVerificationMutation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const vtoken = searchParams.get('vtoken')
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.ROOT,
  })
  const emailSentModal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.EMAIL_SENT,
  })

  // Back-compat: existing emails point to /auth/login?vtoken=...
  // Redirect those to the dedicated verify-email route so verification
  // happens immediately on landing rather than after the user submits login.
  useEffect(() => {
    if (vtoken) {
      const target = new URLSearchParams()
      target.set('vtoken', vtoken)
      navigate(`${ROUTES.IN_APP.AUTH.VERIFY_EMAIL}?${target.toString()}`, { replace: true })
    }
  }, [vtoken, navigate])

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  const openOtpModal = (email: string, sessionId?: string) => {
    if (sessionId) {
      sessionStorage.setItem('login_session_id', sessionId)
    }
    modal.openModal(MODAL_NAMES.AUTH.ROOT, { email })
  }

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    const payload = { email: data.email, password: data.password }

    mutate(payload, {
      onSuccess: (response: any) => openOtpModal(payload.email, response?.data?.session_id),
      onError: (err: { status?: number; message?: string }) => {
        if (isUnverifiedEmailError(err)) {
          emailSentModal.openModal(MODAL_NAMES.AUTH.EMAIL_SENT, { email: payload.email })
          resendVerification(payload.email)
        }
      },
    })
  }

  return {
    form,
    onSubmit,
    isPending: isPending || isResendingVerification,
    modal,
  }
}
