import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { ResetPasswordSchema } from '@/utils/schemas'
import { useAuth } from './auth'

export function useResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('vtoken')
  const { useResetPasswordService } = useAuth()
  const { mutate, isPending } = useResetPasswordService()

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
    mutate({
      password: data.password,
      token: token || '',
    })
  }

  const email = (location.state as { email?: string })?.email

  return {
    form,
    onSubmit,
    isPending,
    email,
  }
}
