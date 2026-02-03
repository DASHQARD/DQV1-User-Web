import React from 'react'
import { useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePersistedModalState, useCountriesData, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import {
  UpdateBranchManagerInvitationSchema,
  type UpdateBranchManagerInvitationFormData,
} from '@/utils/schemas/vendor/branchManager'

function getInvitationEmail(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_email ?? invitation.email) as string
}

function getInvitationName(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_name ?? invitation.full_name) as string
}

function getInvitationPhone(invitation: Record<string, unknown> | null | undefined): string {
  if (!invitation) return ''
  return (invitation.branch_manager_phone ?? invitation.phone ?? '') as string
}

export function useUpdateBranchManagerInvitationModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<Record<string, unknown>>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData

  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

  const form = useForm<UpdateBranchManagerInvitationFormData>({
    resolver: zodResolver(UpdateBranchManagerInvitationSchema),
    defaultValues: {
      branch_manager_name: getInvitationName(invitation),
      branch_manager_email: getInvitationEmail(invitation),
      branch_manager_phone: getInvitationPhone(invitation) ?? invitation?.phonenumber,
    },
  })

  React.useEffect(() => {
    if (invitation) {
      form.reset({
        branch_manager_name: getInvitationName(invitation) ?? invitation?.fullname,
        branch_manager_email: getInvitationEmail(invitation),
        branch_manager_phone: getInvitationPhone(invitation) ?? invitation?.phonenumber,
      })
    }
  }, [invitation, form])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
  }, [modal, form])

  const {
    useUpdateCorporateBranchManagerInvitationService,
    useUpdateCorporateVendorBranchManagerInvitationService,
  } = corporateMutations()
  const updateCorporateMutation = useUpdateCorporateBranchManagerInvitationService()
  const updateCorporateVendorMutation = useUpdateCorporateVendorBranchManagerInvitationService()

  const isUpdating = updateCorporateMutation.isPending || updateCorporateVendorMutation.isPending

  const onSubmit = React.useCallback(
    (data: UpdateBranchManagerInvitationFormData) => {
      if (!invitation?.id) return

      const payload = {
        id: Number(invitation.id),
        data: {
          branch_manager_name: data.branch_manager_name,
          branch_manager_email: data.branch_manager_email,
          branch_manager_phone: data.branch_manager_phone,
        },
      }

      const onSuccess = () => {
        handleCloseModal()
      }

      if (isCorporateSuperAdmin && vendorIdFromUrl) {
        updateCorporateVendorMutation.mutate(payload, { onSuccess })
      } else {
        updateCorporateMutation.mutate(payload, { onSuccess })
      }
    },
    [
      invitation?.id,
      isCorporateSuperAdmin,
      vendorIdFromUrl,
      updateCorporateMutation,
      updateCorporateVendorMutation,
      handleCloseModal,
    ],
  )

  return {
    invitation,
    modal,
    form,
    phoneCountries,
    handleCloseModal,
    onSubmit,
    isUpdating,
    isOpen: modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.UPDATE),
    invitationEmailLabel: getInvitationEmail(invitation) || 'this invitation',
  }
}
