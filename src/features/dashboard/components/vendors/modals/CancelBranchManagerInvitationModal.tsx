import { Modal, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { useCancelBranchManagerInvitationModal } from '@/features/dashboard/vendor/hooks'

export function CancelBranchManagerInvitationModal() {
  const { invitation, modal, handleCancel, isCancelling, isOpen, invitationEmailLabel } =
    useCancelBranchManagerInvitationModal()

  if (!invitation) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={modal.closeModal} panelClass="!max-w-md" position="center">
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-yellow-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Cancel Invitation
            </Text>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel the invitation for {invitationEmailLabel}? This action
              cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            className="flex-1 rounded-full"
            disabled={isCancelling}
          >
            No, Keep It
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleCancel}
            className="flex-1 rounded-full"
            disabled={isCancelling}
            loading={isCancelling}
          >
            Yes, Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
