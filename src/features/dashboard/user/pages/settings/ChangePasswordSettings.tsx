import { Button, Input, Text } from '@/components'
import PasswordRequirementsChecklist from '@/features/auth/components/PasswordRequirementsChecklist'
import { Icon } from '@/libs'
import { useChangePasswordSettings } from './useChangePasswordSettings'

export function ChangePasswordSettings() {
  const { form, onSubmit, handleReset, isPending } = useChangePasswordSettings()
  const newPassword = form.watch('newPassword') ?? ''
  const confirmPassword = form.watch('confirmPassword') ?? ''
  const showPasswordMatchHint = confirmPassword.length > 0
  const passwordsMatch = newPassword === confirmPassword

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Change Password
        </Text>
        <Text variant="p" className="text-gray-600 text-sm">
          Update your password to keep your account secure. Make sure to use a strong password that
          you haven't used before.
        </Text>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:lock-fill" className="size-4 mr-2 text-gray-500" />
              Current Password
            </label>
            <Input
              type="password"
              placeholder="Enter your current password"
              {...form.register('currentPassword')}
              error={form.formState.errors.currentPassword?.message}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:key-fill" className="size-4 mr-2 text-gray-500" />
              New Password
            </label>
            <Input
              type="password"
              placeholder="Enter your new password"
              {...form.register('newPassword')}
              error={form.formState.errors.newPassword?.message}
            />
            {newPassword.length > 0 ? (
              <div className="mt-2">
                <PasswordRequirementsChecklist password={newPassword} />
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, a number, and a special
                character
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:key-fill" className="size-4 mr-2 text-gray-500" />
              Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="Confirm your new password"
              {...form.register('confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
            />
            {showPasswordMatchHint && (
              <p
                className={`text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                role="status"
                aria-live="polite"
              >
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
            variant="secondary"
            className="min-w-[150px]"
          >
            <Icon icon="bi:check-circle" className="size-4 mr-2" />
            Update Password
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
