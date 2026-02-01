import { Modal, Text, Button, Combobox } from '@/components'
import { Icon, cn } from '@/libs'
import { getStatusVariant } from '@/utils/helpers/common'
import { useUpdateBranchStatusModal } from './useUpdateBranchStatusModal'

export function UpdateBranchStatusModal() {
  const {
    branch,
    modal,
    selectedStatus,
    setSelectedStatus,
    statusOptions,
    handleStatusUpdate,
    isUpdatingStatus,
    isOpen,
  } = useUpdateBranchStatusModal()

  if (!branch) return null

  return (
    <Modal isOpen={isOpen} setIsOpen={modal.closeModal} panelClass="!max-w-md" position="center">
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
            onChange={(e: unknown) => {
              const ev = e as { target?: { value?: string }; value?: string }
              const value = ev?.target?.value ?? ev?.value ?? ''
              setSelectedStatus(value)
            }}
            options={[...statusOptions]}
          />
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
