import type { SubmitHandler } from 'react-hook-form'

// import { zodResolver } from '@hookform/resolvers/zod'

import { Button, CustomIcon, Modal, Text } from '@/components'
// import { useToggleCustomerStatus } from '@/features/dashboard/hooks/customerManagement'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
// import { toggleCustomerStatusSchema } from '@/types'
// import { useCustomForm } from '@/libs'
// import type { ICustomerProfile, ToggleCustomerStatusSchemaType } from '@/types'
// import { MODALS, toggleCustomerStatusSchema } from '@/utils'

export function ApproveAction() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  // const activateMutation = useToggleCustomerStatus({
  //   onSuccess: () => {
  //     modal.closeModal()
  //   },
  // })

  // const form = useCustomForm({
  //   resolver: zodResolver(toggleCustomerStatusSchema),
  //   defaultValues: {
  //     status: 'active',
  //     reason: ' ',
  //   },
  // })

  const onSubmit: SubmitHandler<any> = (data) => {
    // activateMutation.mutate({
    //   ...data,
    //   id: modal.modalData?.id || '',
    // })
    console.log(data)
  }
  return (
    <Modal
      panelClass=" "
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.APPROVE)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <form onSubmit={onSubmit}>
        <div className="p-6">
          <div className="space-y-4 flex flex-col items-center justify-center">
            <CustomIcon name={'InfoSign'} width={48} height={48} className="text-error" />
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
            <Button loading={false} className="grow">
              Approve
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
