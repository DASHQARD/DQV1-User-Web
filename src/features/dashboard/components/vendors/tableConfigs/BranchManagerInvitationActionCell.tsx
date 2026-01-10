import { Dropdown, Modal, Button, Text, Input } from '@/components'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { useToast } from '@/hooks'
import React from 'react'
import type { BranchManagerInvitation } from '@/types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const RemoveBranchManagerSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export function BranchManagerInvitationActionCell({
  row,
}: TableCellProps<BranchManagerInvitation>) {
  const invitation = row.original
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = React.useState(false)
  const {
    useCancelBranchManagerInvitationService,
    useDeleteBranchManagerInvitationService,
    useRemoveBranchManagerService,
  } = useVendorMutations()
  const { mutateAsync: cancelInvitation, isPending: isCancelling } =
    useCancelBranchManagerInvitationService()
  const { mutateAsync: deleteInvitation, isPending: isDeleting } =
    useDeleteBranchManagerInvitationService()
  const { mutateAsync: removeBranchManager, isPending: isRemoving } =
    useRemoveBranchManagerService()
  const { error } = useToast()

  const removeForm = useForm<z.infer<typeof RemoveBranchManagerSchema>>({
    resolver: zodResolver(RemoveBranchManagerSchema),
    defaultValues: {
      password: '',
    },
  })

  const handleCancel = async () => {
    try {
      await cancelInvitation(Number(invitation.id))
      setIsCancelModalOpen(false)
    } catch (err: any) {
      error(err?.message || 'Failed to cancel invitation')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteInvitation(Number(invitation.id))
      setIsDeleteModalOpen(false)
    } catch (err: any) {
      error(err?.message || 'Failed to delete invitation')
    }
  }

  const handleRemoveBranchManager = async (data: z.infer<typeof RemoveBranchManagerSchema>) => {
    if (!invitation.branch_id || !invitation.branch_manager_email) {
      error('Branch ID or email is missing')
      return
    }

    try {
      await removeBranchManager({
        branch_id: Number(invitation.branch_id),
        email: invitation.branch_manager_email,
        password: data.password,
      })
      setIsRemoveModalOpen(false)
      removeForm.reset()
    } catch (err: any) {
      error(err?.message || 'Failed to remove branch manager')
    }
  }

  const actions = []

  // Only show cancel for pending invitations
  if (invitation.status === 'pending') {
    actions.push({
      label: 'Cancel',
      onClickFn: () => setIsCancelModalOpen(true),
    })
  }

  // Show remove for accepted/active branch managers
  if (
    (invitation.status === 'accepted' || invitation.status === 'active') &&
    invitation.branch_id
  ) {
    actions.push({
      label: 'Remove Branch Manager',
      onClickFn: () => setIsRemoveModalOpen(true),
    })
  }

  // Show delete for all statuses
  actions.push({
    label: 'Delete',
    onClickFn: () => setIsDeleteModalOpen(true),
  })

  return (
    <>
      <Dropdown actions={actions}>
        <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
          <Icon icon="hugeicons:more-vertical" width={24} height={24} />
        </button>
      </Dropdown>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        setIsOpen={setIsCancelModalOpen}
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
                Are you sure you want to cancel the invitation for {invitation.branch_manager_email}
                ? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <Text variant="h3" className="font-semibold">
                Delete Invitation
              </Text>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the invitation for {invitation.branch_manager_email}
                ? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 rounded-full"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="flex-1 rounded-full"
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Branch Manager Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        setIsOpen={setIsRemoveModalOpen}
        panelClass="!max-w-md"
        position="center"
      >
        <form onSubmit={removeForm.handleSubmit(handleRemoveBranchManager)}>
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
                  Are you sure you want to remove{' '}
                  {invitation.branch_manager_name || invitation.branch_manager_email} as branch
                  manager? This action requires your password to confirm.
                </p>
              </div>
            </div>

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                {...removeForm.register('password')}
                error={removeForm.formState.errors.password?.message}
                disabled={isRemoving}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRemoveModalOpen(false)
                  removeForm.reset()
                }}
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
    </>
  )
}
