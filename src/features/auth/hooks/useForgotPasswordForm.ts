import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ForgotPasswordSchema } from '@/utils/schemas'
import { useAuth } from './auth'

export function useForgotPasswordForm() {
  const { useForgotPasswordService } = useAuth()
  const { mutate, isPending } = useForgotPasswordService()
  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  })

  const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
    mutate(data.email)
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
