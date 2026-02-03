import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import {
  RemoveBranchManagerSchema,
  type RemoveBranchManagerFormData,
} from '@/utils/schemas/vendor/branchManager'

function getInvitationName(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_name ?? invitation.full_name ?? '') as string
}

function getInvitationEmail(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_email ?? invitation.email) as string
}

const defaultValues: RemoveBranchManagerFormData = {
  password: '',
}

export function useRemoveBranchManagerModal() {
  const modal = usePersistedModalState<Record<string, unknown>>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useRemoveBranchManagerService } = useVendorMutations()
  const removeMutation = useRemoveBranchManagerService()

  const form = useForm<RemoveBranchManagerFormData>({
    resolver: zodResolver(RemoveBranchManagerSchema),
    defaultValues,
  })

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset(defaultValues)
  }, [modal, form])

  const onSubmit = React.useCallback(
    (data: RemoveBranchManagerFormData) => {
      const branchId = invitation?.branch_id
      const email = getInvitationEmail(invitation)
      if (!branchId || !email) return

      removeMutation.mutate(
        {
          branch_id: Number(branchId),
          email,
          password: data.password,
        },
        {
          onSuccess: () => {
            handleCloseModal()
          },
        },
      )
    },
    [invitation, removeMutation, handleCloseModal],
  )

  return {
    invitation,
    modal,
    form,
    handleCloseModal,
    onSubmit,
    isRemoving: removeMutation.isPending,
    isOpen: modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.REMOVE),
    invitationLabel:
      getInvitationName(invitation) || getInvitationEmail(invitation) || 'this branch manager',
  }
}
