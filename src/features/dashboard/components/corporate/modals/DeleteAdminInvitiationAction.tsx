import { Button, CustomIcon, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { corporateMutations } from '@/features/dashboard/corporate'
import { DeleteAdminInvitiationFormSchema } from '@/utils/schemas'
import { z } from 'zod'

export function DeleteAdminInvitiationAction() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })

  const invitationId = modal.modalData?.id || ''

  const form = useForm<z.infer<typeof DeleteAdminInvitiationFormSchema>>({
    resolver: zodResolver(DeleteAdminInvitiationFormSchema),
  })

  const { useDeleteCorporateAdminInvitationService } = corporateMutations()
  const deleteInvitationMutation = useDeleteCorporateAdminInvitationService()

  const onSubmit = () => {
    if (!invitationId) {
      return
    }

    deleteInvitationMutation.mutate(invitationId, {
      onSuccess: () => {
        modal.closeModal()
      },
    })
  }

  return (
    <Modal
      panelClass=" "
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.DELETE_INVITATION)}
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
                  Delete Invitation
                </Text>
                <p className="mt-4 mx-6 mb-12 text-[#5F6166] text-center">
                  Are you sure you want to delete this invitation?
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant={'outline'} onClick={modal.closeModal} className="grow">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="grow"
              disabled={deleteInvitationMutation.isPending}
              loading={deleteInvitationMutation.isPending}
            >
              Delete Invite
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
