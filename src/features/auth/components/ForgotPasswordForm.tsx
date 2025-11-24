import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { ForgotPasswordSchema } from '@/utils/schemas'
import { useAuth } from '../hooks/auth'

export default function ForgotPasswordForm() {
  const { useForgotPasswordService } = useAuth()
  const { mutate, isPending } = useForgotPasswordService()
  const emailForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const handleEmailSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
    mutate(data.email)
  }

  return (
    <form
      onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:key-fill" className="size-5 text-white" />
        </div>
        <div>
          <Text as="h2" className="text-2xl font-bold">
            Reset Password
          </Text>
          <p className="text-sm text-gray-500">Enter your email to receive a password reset link</p>
        </div>
      </div>
      <section className="flex flex-col gap-4">
        <Input
          label="Email"
          placeholder="Enter your email"
          {...emailForm.register('email')}
          error={emailForm.formState.errors.email?.message}
        />

        <Button
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-full"
          disabled={isPending}
        >
          Send Reset Link
        </Button>

        <hr className="border-gray-200" />

        <div className="flex items-center gap-2">
          <p>
            Remember your password?{' '}
            <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </form>
  )
}
