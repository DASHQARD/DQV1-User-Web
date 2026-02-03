import React from 'react'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'

const STATUS_OPTIONS = [
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
] as const

export function useUpdateBranchStatusModal() {
  const modal = usePersistedModalState<{ id?: number; branch_id?: number; status?: string }>({
    paramName: MODALS.BRANCH.ROOT,
  })

  const branch = modal.modalData
  const { useUpdateBranchStatusService } = useVendorMutations()
  const { mutateAsync: updateBranchStatus, isPending: isUpdatingStatus } =
    useUpdateBranchStatusService()

  const [selectedStatus, setSelectedStatus] = React.useState<string>(branch?.status ?? '')

  React.useEffect(() => {
    if (branch?.status) {
      setSelectedStatus(branch.status)
    }
  }, [branch?.status])

  const handleStatusUpdate = React.useCallback(async () => {
    const branchId = branch?.id ?? branch?.branch_id
    if (!branchId || !selectedStatus) return

    try {
      await updateBranchStatus({
        branch_id: Number(branchId),
        status: selectedStatus,
      })
      modal.closeModal()
    } catch (err: unknown) {
      console.error('Failed to update branch status:', err)
    }
  }, [branch?.id, branch?.branch_id, selectedStatus, updateBranchStatus, modal])

  return {
    branch,
    modal,
    selectedStatus,
    setSelectedStatus,
    statusOptions: STATUS_OPTIONS,
    handleStatusUpdate,
    isUpdatingStatus,
    isOpen: modal.isModalOpen(MODALS.BRANCH.UPDATE_STATUS),
  }
}
