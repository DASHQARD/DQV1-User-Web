import { Modal, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { useDeleteBranchPaymentDetailsModal } from './useDeleteBranchPaymentDetailsModal'

export function DeleteBranchPaymentDetailsModal() {
  const { branch, handleDelete, handleCancel, isDeletingPaymentDetails, isOpen } =
    useDeleteBranchPaymentDetailsModal()

  if (!branch) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={handleCancel} panelClass="!max-w-md" position="center">
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Delete Payment Details
            </Text>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the payment details for this branch? This action
              cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-full"
            disabled={isDeletingPaymentDetails}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            className="flex-1 rounded-full"
            disabled={isDeletingPaymentDetails}
            loading={isDeletingPaymentDetails}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
