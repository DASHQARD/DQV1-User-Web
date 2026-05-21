import { Link } from 'react-router-dom'

import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { useForgotPasswordForm } from '../../hooks'
import { getVisibleFieldError } from '../../utils/showFieldError'

export default function ForgotPasswordForm() {
  const { form, onSubmit, isPending } = useForgotPasswordForm()
  const { isValid } = form.formState

  return (
    <section className="wrapper w-full min-w-0">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[470.61px] w-full flex flex-col gap-6 sm:gap-10 mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
          <div className="bg-primary-500 rounded-full p-2 h-10 w-10 shrink-0 flex items-center justify-center">
            <Icon icon="bi:key-fill" className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <Text as="h2" className="text-xl sm:text-2xl font-bold">
              Reset Password
            </Text>
            <p className="text-sm text-gray-500">
              Enter your email to receive a password reset link
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-4 w-full min-w-0">
          <Input
            label="Email"
            placeholder="Enter your email"
            type="text"
            inputMode="email"
            {...form.register('email')}
            error={getVisibleFieldError(form, 'email')}
            isRequired
          />

          <Button
            loading={isPending}
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={!isValid || isPending}
          >
            Send Reset Link
          </Button>

          <hr className="border-gray-200" />

          <div className="text-sm text-gray-700 wrap-break-word">
            Remember your password?{' '}
            <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 underline">
              Login
            </Link>
          </div>
        </section>
      </form>
    </section>
  )
}
