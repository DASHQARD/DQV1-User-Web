import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { useAuth } from '../../hooks'

type Status = 'idle' | 'verifying' | 'success' | 'error'

// Module-scoped guards survive React 18 StrictMode's double-mount in dev,
// which would otherwise cause the verify-email mutation to fire twice and
// the second call to fail with "Invalid or expired verification token"
// because the backend deletes the Redis key on the first successful call.
const attemptedTokens = new Set<string>()
const tokenOutcomes = new Map<string, { status: 'success' | 'error'; message?: string }>()

const RESEND_COOLDOWN_SECONDS = 5 * 60
const resendCooldownKey = (email: string) => `auth:resend-verification:${email.toLowerCase()}`

function readCooldownRemaining(email: string): number {
  if (!email) return 0
  try {
    const raw = window.localStorage.getItem(resendCooldownKey(email))
    if (!raw) return 0
    const lastSentAt = Number(raw)
    if (!Number.isFinite(lastSentAt)) return 0
    const elapsed = Math.floor((Date.now() - lastSentAt) / 1000)
    return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed)
  } catch {
    return 0
  }
}

function persistCooldownStart(email: string) {
  if (!email) return
  try {
    window.localStorage.setItem(resendCooldownKey(email), String(Date.now()))
  } catch {
    // ignore storage errors
  }
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('vtoken') ?? searchParams.get('token')

  const { useVerifyEmailMutation, useResendVerificationMutation } = useAuth()
  const { mutate: verifyEmail } = useVerifyEmailMutation()
  const { mutate: resend, isPending: isResending } = useResendVerificationMutation()

  const cachedOutcome = token ? tokenOutcomes.get(token) : undefined

  const [status, setStatus] = useState<Status>(() => {
    if (!token) return 'error'
    if (cachedOutcome) return cachedOutcome.status
    return 'verifying'
  })
  const [errorMessage, setErrorMessage] = useState<string>(() => {
    if (!token) return 'Missing verification token. Please use the link from your email.'
    if (cachedOutcome?.status === 'error') {
      return cachedOutcome.message || 'Invalid or expired verification token.'
    }
    return ''
  })
  const [resendEmail, setResendEmail] = useState<string>('')
  const [cooldown, setCooldown] = useState<number>(0)

  useEffect(() => {
    if (!token) return

    const prior = tokenOutcomes.get(token)
    if (prior) {
      setStatus(prior.status)
      if (prior.status === 'error') {
        setErrorMessage(prior.message || 'Invalid or expired verification token.')
      }
      return
    }

    if (attemptedTokens.has(token)) {
      // Another mount is already verifying this token (StrictMode double-mount).
      return
    }
    attemptedTokens.add(token)
    setStatus('verifying')

    verifyEmail(token, {
      onSuccess: () => {
        tokenOutcomes.set(token, { status: 'success' })
        setStatus('success')
      },
      onError: (err: { status?: number; message?: string }) => {
        const message = err?.message || 'Invalid or expired verification token.'
        tokenOutcomes.set(token, { status: 'error', message })
        setStatus('error')
        setErrorMessage(message)
      },
    })
  }, [token, verifyEmail])

  useEffect(() => {
    setCooldown(readCooldownRemaining(resendEmail))
  }, [resendEmail])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  const canResend = useMemo(
    () => /.+@.+\..+/.test(resendEmail) && cooldown <= 0 && !isResending,
    [resendEmail, cooldown, isResending],
  )

  const handleResend = () => {
    if (!canResend) return
    resend(resendEmail, {
      onSuccess: () => {
        persistCooldownStart(resendEmail)
        setCooldown(RESEND_COOLDOWN_SECONDS)
      },
    })
  }

  return (
    <section className="wrapper">
      <div className="max-w-[470.61px] w-full flex flex-col gap-6 mx-auto">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500" />
            <Text as="h2" className="text-2xl font-bold text-gray-900 text-center">
              Verifying your email…
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Hang tight, this should only take a moment.
            </Text>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <Icon icon="bi:check-circle-fill" className="text-4xl text-white" />
            </div>
            <Text as="h2" className="text-2xl font-bold text-gray-900 text-center">
              Email verified!
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Your email is now verified. You can log in to your account.
            </Text>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate(ROUTES.IN_APP.AUTH.LOGIN, { replace: true })}
            >
              Continue to login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                <Icon icon="bi:x-circle-fill" className="text-4xl text-red-500" />
              </div>
              <Text as="h2" className="text-2xl font-bold text-gray-900 text-center">
                Verification failed
              </Text>
              <Text className="text-sm text-gray-600 text-center">{errorMessage}</Text>
            </div>

            <div className="flex flex-col gap-3 bg-gray-50 rounded-xl p-5 border border-gray-200">
              <Text className="text-sm font-medium text-gray-900">
                Request a new verification email
              </Text>
              <Input
                label="Email"
                placeholder="Enter the email you signed up with"
                value={resendEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setResendEmail(e.target.value)
                }
                isRequired
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={!canResend}
                loading={isResending}
                onClick={handleResend}
              >
                {cooldown > 0
                  ? `Resend in ${formatCountdown(cooldown)}`
                  : 'Send new verification email'}
              </Button>
              <Text className="text-xs text-gray-500">
                You can request a new email every 5 minutes.
              </Text>
            </div>

            <Link
              to={ROUTES.IN_APP.AUTH.LOGIN}
              className="text-sm text-primary-500 underline text-center"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
