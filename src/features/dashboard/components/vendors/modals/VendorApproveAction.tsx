import { Button, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { vendorMutations } from '@/features/dashboard/vendor/hooks'

export function VendorApproveAction() {
  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useUpdateRequestStatusService } = vendorMutations()
  const { mutate: updateRequestStatus, isPending } = useUpdateRequestStatusService()

  const handleApprove = () => {
    const requestId = modal.modalData?.id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }

    updateRequestStatus(
      {
        id: typeof requestId === 'string' ? parseInt(requestId, 10) : requestId,
        status: 'approved',
      },
      {
        onSuccess: () => {
          modal.closeModal()
        },
      },
    )
  }

  return (
    <Modal
      panelClass=" "
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.APPROVE)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <div className="p-6">
        <div className="space-y-4 flex flex-col items-center justify-center">
          <Icon icon="bi:check-circle" width={48} height={48} className="text-green-500" />
          <div>
            <Text variant="h3" className="text-center font-semibold capitalize">
              Approve Request
            </Text>
            <p className="mt-4 mx-6 mb-12 text-[#5F6166] text-center">
              Are you sure you want to approve this request? Confirm action below
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant={'outline'} onClick={modal.closeModal} className="grow">
            Cancel
          </Button>
          <Button variant="secondary" loading={isPending} onClick={handleApprove} className="grow">
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  )
}
