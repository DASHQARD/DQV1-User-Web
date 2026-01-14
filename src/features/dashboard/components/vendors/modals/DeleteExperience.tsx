import { Modal, Text, Button } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'
import { useBranchMutations } from '@/features/dashboard/branch'

export function DeleteExperience() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const card = modal.modalData as any
  const { useDeleteCardService } = useVendorMutations()
  const deleteCardMutation = useDeleteCardService()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isBranch = userProfileData?.user_type === 'branch'
  const { useDeleteBranchExperienceService } = useBranchMutations()
  const { mutateAsync: deleteBranchExperience, isPending: isDeletingBranchExperience } =
    useDeleteBranchExperienceService()

  const handleDelete = () => {
    if (!card?.id) return

    if (isBranch) {
      deleteBranchExperience(card.id, {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    } else {
      deleteCardMutation.mutate(card.id, {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    }
  }

  if (!card) return null

  return (
    <Modal
      panelClass=""
      isOpen={modal.isModalOpen(MODALS.EXPERIENCE.DELETE)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleDelete()
        }}
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <Icon icon="bi:exclamation-triangle-fill" className="text-error text-5xl" />
            <div className="space-y-2">
              <Text variant="h3" className="text-center font-semibold">
                Delete Experience
              </Text>
              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete "{card.product || 'this experience'}"? This action
                cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={modal.closeModal}
              className="flex-1"
              disabled={deleteCardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              disabled={deleteCardMutation.isPending}
              loading={deleteCardMutation.isPending || isDeletingBranchExperience}
            >
              Delete
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
