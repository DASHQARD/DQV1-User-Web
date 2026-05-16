import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useResetPasswordForm } from '../../hooks'

export default function ResetPasswordForm() {
  const { form, onSubmit, isPending, email } = useResetPasswordForm()

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
              Create New Password
            </Text>
            <p className="text-sm text-gray-500 wrap-break-word">
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

        <section className="flex flex-col gap-4 w-full min-w-0">
          <Input
            label="New Password"
            placeholder="Enter your new password"
            isRequired
            type="password"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />
          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            isRequired
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
    </section>
  )
}
