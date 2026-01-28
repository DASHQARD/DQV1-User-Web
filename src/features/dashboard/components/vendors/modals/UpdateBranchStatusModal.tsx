import React from 'react'
import { Modal, Text, Button, Combobox } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { getStatusVariant } from '@/utils/helpers/common'

export function UpdateBranchStatusModal() {
  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH.ROOT,
  })

  const branch = modal.modalData
  const { useUpdateBranchStatusService } = useVendorMutations()
  const { mutateAsync: updateBranchStatus, isPending: isUpdatingStatus } =
    useUpdateBranchStatusService()

  const [selectedStatus, setSelectedStatus] = React.useState<string>(branch?.status || '')

  // Update selectedStatus when branch changes
  React.useEffect(() => {
    if (branch?.status) {
      setSelectedStatus(branch.status)
    }
  }, [branch?.status])

  // Status options (API only accepts: approved, suspended)
  const statusOptions = [
    { label: 'Approved', value: 'approved' },
    { label: 'Suspended', value: 'suspended' },
  ]

  const handleStatusUpdate = async () => {
    const branchId = branch?.id || branch?.branch_id
    if (!branchId || !selectedStatus) return

    try {
      await updateBranchStatus({
        branch_id: Number(branchId),
        status: selectedStatus,
      })
      modal.closeModal()
    } catch (err: unknown) {
      console.error('Failed to update branch status:', err)
      // Error is handled by the mutation hook
    }
  }

  if (!branch) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH.UPDATE_STATUS)}
      setIsOpen={modal.closeModal}
      panelClass="!max-w-md"
      position="center"
    >
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon icon="bi:gear-fill" className="text-2xl text-blue-600" />
          </div>
          <div className="space-y-2 text-center w-full">
            <Text variant="h3" className="font-semibold">
              Update Branch Status
            </Text>
            <p className="text-sm text-gray-600">Select a new status for this branch</p>
          </div>
        </div>

        <div className="w-full">
          <Combobox
            label="Branch Status"
            value={selectedStatus}
            onChange={(e: any) => {
              const value = e?.target?.value || e?.value || ''
              setSelectedStatus(value)
            }}
            options={statusOptions}
          />
          {branch && (
            <div className="mt-3 flex items-center gap-2">
              <Text variant="span" className="text-xs text-gray-500">
                Current Status:
              </Text>
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusVariant(branch.status) === 'success' && 'bg-green-100 text-green-700',
                  getStatusVariant(branch.status) === 'warning' && 'bg-yellow-100 text-yellow-700',
                  getStatusVariant(branch.status) === 'error' && 'bg-red-100 text-red-700',
                )}
              >
                {branch.status}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            className="flex-1 rounded-full"
            disabled={isUpdatingStatus}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleStatusUpdate}
            className="flex-1 rounded-full"
            disabled={isUpdatingStatus || !selectedStatus}
            loading={isUpdatingStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  )
}
