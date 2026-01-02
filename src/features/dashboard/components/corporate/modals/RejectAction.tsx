import type { SubmitHandler } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Button, CreatableCombobox, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS, REJECT_REASON_OPTIONS } from '@/utils/constants'
import { Icon, useCustomForm } from '@/libs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToggleCustomerStatusSchema } from '@/utils/schemas'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function RejectAction() {
  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useUpdateRequestStatusService } = corporateMutations()
  const { mutate: updateRequestStatus, isPending } = useUpdateRequestStatusService()

  const form = useCustomForm({
    resolver: zodResolver(ToggleCustomerStatusSchema),
    defaultValues: {
      reason: '',
    },
  })

  const onSubmit: SubmitHandler<any> = (_data: any) => {
    console.log(_data)
    const requestId = modal.modalData?.id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }

    updateRequestStatus(
      {
        id: typeof requestId === 'string' ? parseInt(requestId, 10) : requestId,
        status: 'rejected',
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
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.REJECT)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 space-y-13">
          <div className="flex flex-col gap-4 items-center justify-center">
            <Icon icon={'bi:x-circle'} width={48} height={48} className="text-error" />
            <div className="space-y-6">
              <div>
                <Text variant="h3" className="text-center font-semibold">
                  Reject Request
                </Text>
                <p className="mt-4 mx-6 mb-12 text-[#5F6166] text-center">
                  Are you sure you want to reject this request? Select reason for rejection
                </p>
              </div>

              <Controller
                name="reason"
                control={form.control}
                render={({ field }) => (
                  <CreatableCombobox
                    options={REJECT_REASON_OPTIONS}
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Select or type a reason..."
                    name={field.name}
                    isClearable
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant={'outline'} onClick={modal.closeModal} className="grow">
              Cancel
            </Button>
            <Button loading={isPending} onClick={form.handleSubmit(onSubmit)} className="grow">
              Reject
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
