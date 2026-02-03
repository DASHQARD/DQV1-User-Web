import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useAcceptBranchManagerForm } from '../../hooks'

export default function AcceptBranchManagerForm() {
  const { form, onSubmit, isPending, hasValidToken } = useAcceptBranchManagerForm()

  if (!hasValidToken) {
    return (
      <div className="max-w-[470.61px] w-full flex flex-col items-center justify-center gap-4 py-10">
        <Icon icon="bi:exclamation-triangle" className="text-4xl text-red-500" />
        <Text as="h2" className="text-xl font-bold text-gray-900">
          Invalid Invitation
        </Text>
        <Text as="p" className="text-sm text-gray-600 text-center">
          This invitation link is invalid or has expired. Please contact the administrator for a new
          invitation.
        </Text>
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:key-fill" className="size-5 text-white" />
        </div>
        <div>
          <Text as="h2" className="text-2xl font-bold">
            Accept Branch Manager Invitation
          </Text>
          <p className="text-sm text-gray-500">
            Set your password to accept the branch manager invitation
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Input
          label="Password"
          required
          placeholder="Enter your password"
          type="password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />

        <Input
          label="Confirm Password"
          required
          placeholder="Confirm your password"
          type="password"
          {...form.register('confirm_password')}
          error={form.formState.errors.confirm_password?.message}
        />

        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          Accept Invitation
        </Button>
      </section>
    </form>
  )
}
