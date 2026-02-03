import React from 'react'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'

function getInvitationEmail(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_email ?? invitation.email) as string
}

export function useCancelBranchManagerInvitationModal() {
  const modal = usePersistedModalState<Record<string, unknown>>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useCancelBranchManagerInvitationService } = useVendorMutations()
  const cancelMutation = useCancelBranchManagerInvitationService()

  const handleCancel = React.useCallback(() => {
    const invitationId = invitation?.id
    if (!invitationId) return

    cancelMutation.mutate(Number(invitationId), {
      onSuccess: () => {
        modal.closeModal()
      },
    })
  }, [invitation?.id, cancelMutation, modal])

  return {
    invitation,
    modal,
    handleCancel,
    isCancelling: cancelMutation.isPending,
    isOpen: modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CANCEL),
    invitationEmailLabel: getInvitationEmail(invitation) || 'this invitation',
  }
}
