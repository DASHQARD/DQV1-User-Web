import { useCallback } from 'react'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { useAuthStore } from '@/stores'

export function useDeleteBranchModal() {
  const modal = usePersistedModalState<{
    id?: number
    branch_id?: number
    branch_name?: string
  }>({
    paramName: MODALS.BRANCH.ROOT,
  })

  const branch = modal.modalData

  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useDeleteBranchByVendorService } = useVendorMutations()
  const deleteBranchByVendorMutation = useDeleteBranchByVendorService()

  const { useDeleteCorporateBranchService } = corporateMutations()
  const deleteCorporateBranchMutation = useDeleteCorporateBranchService()

  const isDeletingBranch =
    deleteBranchByVendorMutation.isPending || deleteCorporateBranchMutation.isPending

  const handleDeleteBranch = useCallback(() => {
    const branchId = branch?.id ?? branch?.branch_id
    if (!branchId) {
      console.error('Branch ID not found')
      return
    }

    if (isCorporateSuperAdmin) {
      deleteCorporateBranchMutation.mutate(branchId, {
        onSuccess: () => {
          modal.closeModal()
        },
      })
    } else {
      deleteBranchByVendorMutation.mutate(
        { branch_id: Number(branchId) },
        {
          onSuccess: () => {
            modal.closeModal()
          },
        },
      )
    }
  }, [
    branch?.id,
    branch?.branch_id,
    isCorporateSuperAdmin,
    deleteCorporateBranchMutation,
    deleteBranchByVendorMutation,
    modal,
  ])

  return {
    branch,
    modal,
    handleDeleteBranch,
    isDeletingBranch,
    isOpen: modal.isModalOpen(MODALS.BRANCH.DELETE),
  }
}
