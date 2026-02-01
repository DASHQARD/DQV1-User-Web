import { Modal, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { useDeleteBranchModal } from './useDeleteBranchModal'

export function DeleteBranchModal() {
  const { branch, modal, handleDeleteBranch, isDeletingBranch, isOpen } = useDeleteBranchModal()

  if (!branch) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={modal.closeModal} panelClass="!max-w-md" position="center">
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Delete Branch
            </Text>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{branch.branch_name ?? 'this branch'}</strong>
              ? This action cannot be undone and will remove all associated data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            className="flex-1 rounded-full"
            disabled={isDeletingBranch}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteBranch}
            className="flex-1 rounded-full"
            disabled={isDeletingBranch}
            loading={isDeletingBranch}
          >
            Delete Branch
          </Button>
        </div>
      </div>
    </Modal>
  )
}
