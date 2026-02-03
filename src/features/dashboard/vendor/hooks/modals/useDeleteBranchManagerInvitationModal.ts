import React from 'react'
import { useSearchParams } from 'react-router'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

function getInvitationEmail(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_email ?? invitation.email) as string
}

export function useDeleteBranchManagerInvitationModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<Record<string, unknown>>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

  const { useDeleteBranchManagerInvitationService } = useVendorMutations()
  const deleteVendorMutation = useDeleteBranchManagerInvitationService()

  const {
    useDeleteCorporateBranchManagerInvitationService,
    useDeleteCorporateVendorBranchManagerInvitationService,
  } = corporateMutations()
  const deleteCorporateMutation = useDeleteCorporateBranchManagerInvitationService()
  const deleteCorporateVendorMutation = useDeleteCorporateVendorBranchManagerInvitationService()

  const isDeleting =
    deleteVendorMutation.isPending ||
    deleteCorporateMutation.isPending ||
    deleteCorporateVendorMutation.isPending

  const handleDelete = React.useCallback(() => {
    const invitationId = invitation?.id
    if (!invitationId) return

    const onSuccess = () => {
      modal.closeModal()
    }

    if (isCorporateSuperAdmin && vendorIdFromUrl) {
      deleteCorporateVendorMutation.mutate(Number(invitationId), { onSuccess })
    } else if (isCorporateSuperAdmin) {
      deleteCorporateMutation.mutate(Number(invitationId), { onSuccess })
    } else {
      deleteVendorMutation.mutate(Number(invitationId), { onSuccess })
    }
  }, [
    invitation?.id,
    isCorporateSuperAdmin,
    vendorIdFromUrl,
    deleteVendorMutation,
    deleteCorporateMutation,
    deleteCorporateVendorMutation,
    modal,
  ])

  return {
    invitation,
    modal,
    handleDelete,
    isDeleting,
    isOpen: modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.DELETE),
    invitationEmailLabel: getInvitationEmail(invitation) || 'this invitation',
  }
}
