import type { SubmitHandler } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Button, CreatableCombobox, CustomIcon, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS, REJECT_REASON_OPTIONS } from '@/utils/constants'
import { useCustomForm } from '@/libs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToggleCustomerStatusSchema } from '@/utils/schemas'

export function RejectAction() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })

  const form = useCustomForm({
    resolver: zodResolver(ToggleCustomerStatusSchema),
    defaultValues: {
      reason: '',
    },
  })

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log(data)
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
            <CustomIcon name={'OrangeWarningSign'} width={48} height={48} className="text-error" />
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
            <Button loading={false} className="grow">
              Reject
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
