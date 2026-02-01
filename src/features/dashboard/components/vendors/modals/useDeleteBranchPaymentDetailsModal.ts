import { useCallback } from 'react'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import type { Branch } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'

export function useDeleteBranchPaymentDetailsModal() {
  const modal = usePersistedModalState<Branch>({ paramName: MODALS.BRANCH.VIEW })

  const branch = modal.modalData

  const { useDeleteBranchPaymentDetailsService } = useVendorMutations()
  const { mutateAsync: deleteBranchPaymentDetails, isPending: isDeletingPaymentDetails } =
    useDeleteBranchPaymentDetailsService()

  const isOpen = modal.isModalOpen(MODALS.BRANCH.DELETE_PAYMENT_DETAILS)

  const handleDelete = useCallback(async () => {
    if (!branch?.id) return
    try {
      await deleteBranchPaymentDetails(branch.id)
      modal.closeModal()
    } catch (error) {
      console.error('Failed to delete branch payment details:', error)
    }
  }, [branch?.id, deleteBranchPaymentDetails, modal])

  const handleCancel = useCallback(() => {
    if (branch) {
      modal.openModal(MODALS.BRANCH.VIEW, branch)
    } else {
      modal.closeModal()
    }
  }, [branch, modal])

  return {
    branch,
    modal,
    handleDelete,
    handleCancel,
    isDeletingPaymentDetails,
    isOpen,
  }
}
