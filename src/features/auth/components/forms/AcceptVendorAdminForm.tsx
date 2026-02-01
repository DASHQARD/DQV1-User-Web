import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useAcceptVendorAdminForm } from '../../hooks'

export default function AcceptVendorAdminForm() {
  const { form, onSubmit, isPending } = useAcceptVendorAdminForm()

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
            Set Your Password
          </Text>
          <p className="text-sm text-gray-500">
            Create a password to accept your vendor admin invitation
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />
        <Input
          label="Confirm Password"
          placeholder="Enter your password"
          type="password"
          {...form.register('confirm_password' as any)}
          error={(form.formState.errors as any).confirm_password?.message}
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
