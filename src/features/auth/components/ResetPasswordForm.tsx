import { z } from 'zod'
import { useLocation, useSearchParams } from 'react-router-dom'

import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useAuth } from '../hooks/auth'
import { ResetPasswordSchema } from '@/utils/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('vtoken')
  const location = useLocation()

  const { useResetPasswordService } = useAuth()
  const { mutate, isPending } = useResetPasswordService()

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const handleSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
    const payload = {
      password: data.password,
      token: token || '',
    }
    mutate(payload)
  }

  const email = (location.state as { email?: string })?.email

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:key-fill" className="size-5 text-white" />
        </div>
        <div>
          <Text as="h2" className="text-2xl font-bold">
            Create New Password
          </Text>
          <p className="text-sm text-gray-500">
            {email ? (
              <>
                Update the password for{' '}
                <span className="font-semibold text-gray-700 break-all">{email}</span>
              </>
            ) : (
              'Enter and confirm your new password'
            )}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Input
          label="New Password"
          placeholder="Enter your new password"
          type="password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />
        <Input
          label="Confirm New Password"
          placeholder="Confirm your new password"
          type="password"
          {...form.register('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          Reset Password
        </Button>
      </section>
    </form>
  )
}
