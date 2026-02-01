import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { LoginSchema } from '@/utils/schemas'
import { MODAL_NAMES } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'
import { useAuth } from './auth'

export function useLoginForm() {
  const { useLoginMutation, useVerifyEmailMutation } = useAuth()
  const { mutate, isPending } = useLoginMutation()
  const { mutate: verifyEmail, isPending: isVerifyEmailPending } = useVerifyEmailMutation()
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('vtoken')
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.ROOT,
  })

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  })

  const openOtpModalAndClearVtoken = (email: string) => {
    if (token) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('vtoken')
      setSearchParams(newSearchParams, { replace: true })
    }
    modal.openModal(MODAL_NAMES.AUTH.ROOT, { email })
  }

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    const payload = { email: data.email, password: data.password }

    if (token) {
      verifyEmail(token, {
        onSuccess: () => {
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('vtoken')
          setSearchParams(newSearchParams, { replace: true })
          mutate(payload, {
            onSuccess: () => openOtpModalAndClearVtoken(payload.email),
          })
        },
      })
    } else {
      mutate(payload, {
        onSuccess: () => openOtpModalAndClearVtoken(payload.email),
      })
    }
  }

  return {
    form,
    onSubmit,
    isPending: isPending || isVerifyEmailPending,
    modal,
  }
}
