import { Modal, Text, Button } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'

export function CancelBranchManagerInvitationModal() {
  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useCancelBranchManagerInvitationService } = useVendorMutations()
  const cancelMutation = useCancelBranchManagerInvitationService()

  const handleCancel = () => {
    const invitationId = invitation?.id
    if (!invitationId) return

    cancelMutation.mutate(Number(invitationId), {
      onSuccess: () => {
        modal.closeModal()
      },
    })
  }

  if (!invitation) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CANCEL)}
      setIsOpen={modal.closeModal}
      panelClass="!max-w-md"
      position="center"
    >
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
              Are you sure you want to cancel the invitation for {invitation.branch_manager_email}?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            className="flex-1 rounded-full"
            disabled={cancelMutation.isPending}
          >
            No, Keep It
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleCancel}
            className="flex-1 rounded-full"
            disabled={cancelMutation.isPending}
            loading={cancelMutation.isPending}
          >
            Yes, Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
