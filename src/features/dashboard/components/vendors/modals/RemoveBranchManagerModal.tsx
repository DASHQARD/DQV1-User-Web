import { Modal, Text, Button, Input } from '@/components'
import { Icon } from '@/libs'
import { useRemoveBranchManagerModal } from '@/features/dashboard/vendor/hooks'

export function RemoveBranchManagerModal() {
  const { invitation, form, handleCloseModal, onSubmit, isRemoving, isOpen, invitationLabel } =
    useRemoveBranchManagerModal()

  if (!invitation) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={handleCloseModal} panelClass="!max-w-md" position="center">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <Text variant="h3" className="font-semibold">
                Remove Branch Manager
              </Text>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove {invitationLabel} as branch manager? This action
                requires your password to confirm.
              </p>
            </div>
          </div>

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
            disabled={isRemoving}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1 rounded-full"
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1 rounded-full"
              disabled={isRemoving}
              loading={isRemoving}
            >
              Remove
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
