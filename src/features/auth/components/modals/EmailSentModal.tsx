import { useEffect, useMemo, useState } from 'react'
import { Modal, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { MODAL_NAMES } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'
import { useAuth } from '../../hooks'

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
    // ignore storage errors (private mode, quota)
  }
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function EmailSentModal() {
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.EMAIL_SENT,
  })
  const userEmail = modal.modalData?.email ?? ''

  const { useResendVerificationMutation } = useAuth()
  const { mutate: resend, isPending: isResending } = useResendVerificationMutation()

  const [cooldown, setCooldown] = useState<number>(() => readCooldownRemaining(userEmail))

  const isOpen = modal.isModalOpen(MODAL_NAMES.AUTH.EMAIL_SENT)

  useEffect(() => {
    if (!isOpen) return
    setCooldown(readCooldownRemaining(userEmail))
  }, [isOpen, userEmail])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  const canResend = useMemo(
    () => !!userEmail && cooldown <= 0 && !isResending,
    [userEmail, cooldown, isResending],
  )

  const handleResend = () => {
    if (!canResend) return
    resend(userEmail, {
      onSuccess: () => {
        persistCooldownStart(userEmail)
        setCooldown(RESEND_COOLDOWN_SECONDS)
      },
    })
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={modal.closeModal} panelClass="max-w-md">
      <div className="p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Icon icon="bi:check-circle-fill" className="text-4xl text-white" />
          </div>
          <Text as="h2" className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Registration Successful!
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            We've sent a verification link to your email
          </Text>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <Icon icon="bi:envelope-fill" className="size-5 text-primary-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <Text className="text-xs text-gray-500 mb-1">Verification email sent to:</Text>
              <Text className="text-sm font-semibold text-gray-900 break-all">{userEmail}</Text>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Icon icon="bi:info-circle-fill" className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <Text className="text-sm text-blue-900 font-medium mb-1">Next Steps:</Text>
              <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
                <li>Check your inbox and click the verification link</li>
                <li>If you don't see the email, check your spam folder</li>
                <li>Once verified, you can log in to your account</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={!canResend}
            loading={isResending}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend in ${formatCountdown(cooldown)}` : 'Resend verification email'}
          </Button>
          <Text className="text-xs text-center text-gray-500">
            You can request a new email every 5 minutes.
          </Text>
        </div>
      </div>
    </Modal>
  )
}
