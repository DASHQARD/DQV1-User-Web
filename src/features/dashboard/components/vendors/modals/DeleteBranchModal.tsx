import { Modal, Text, Button } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { useAuthStore } from '@/stores'

export function DeleteBranchModal() {
  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH.ROOT,
  })

  const branch = modal.modalData
  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useDeleteBranchByVendorService } = useVendorMutations()
  const { mutateAsync: deleteBranchByVendor, isPending: isDeletingVendorBranch } =
    useDeleteBranchByVendorService()

  const { useDeleteCorporateBranchService } = corporateMutations()
  const { mutateAsync: deleteCorporateBranch, isPending: isDeletingCorporateBranch } =
    useDeleteCorporateBranchService()

  const isDeletingBranch = isCorporateSuperAdmin
    ? isDeletingCorporateBranch
    : isDeletingVendorBranch

  const handleDeleteBranch = async () => {
    const branchId = branch?.id || branch?.branch_id
    if (!branchId) return

    try {
      if (isCorporateSuperAdmin) {
        await deleteCorporateBranch(branchId)
      } else {
        await deleteBranchByVendor({
          branch_id: Number(branchId),
        })
      }
      modal.closeModal()
    } catch (err: unknown) {
      console.error('Failed to delete branch:', err)
      // Error is handled by the mutation hook
    }
  }

  if (!branch) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH.DELETE)}
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
              Delete Branch
            </Text>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong>{branch?.branch_name || 'this branch'}</strong>? This action cannot be undone
              and will remove all associated data.
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
