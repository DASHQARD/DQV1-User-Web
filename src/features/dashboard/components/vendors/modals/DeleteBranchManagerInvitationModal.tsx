import { useSearchParams } from 'react-router'
import { Modal, Text, Button } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function DeleteBranchManagerInvitationModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useDeleteBranchManagerInvitationService } = useVendorMutations()
  const deleteVendorMutation = useDeleteBranchManagerInvitationService()

  const {
    useDeleteCorporateBranchManagerInvitationService,
    useDeleteCorporateVendorBranchManagerInvitationService,
  } = corporateMutations()
  const deleteCorporateMutation = useDeleteCorporateBranchManagerInvitationService()
  const deleteCorporateVendorMutation = useDeleteCorporateVendorBranchManagerInvitationService()

  const isDeleting =
    deleteVendorMutation.isPending ||
    deleteCorporateMutation.isPending ||
    deleteCorporateVendorMutation.isPending

  const handleDelete = () => {
    const invitationId = invitation?.id
    if (!invitationId) return

    if (isCorporateSuperAdmin && vendorIdFromUrl) {
      deleteCorporateVendorMutation.mutate(Number(invitationId), {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    } else if (isCorporateSuperAdmin) {
      deleteCorporateMutation.mutate(Number(invitationId), {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    } else {
      deleteVendorMutation.mutate(Number(invitationId), {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    }
  }

  if (!invitation) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.DELETE)}
      setIsOpen={modal.closeModal}
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
              Are you sure you want to delete the invitation for {invitation.branch_manager_email}?
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
  )
}
