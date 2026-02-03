import React from 'react'
import { useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePersistedModalState, useCountriesData, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import {
  CreateBranchManagerInvitationSchema,
  type CreateBranchManagerInvitationFormData,
} from '@/utils/schemas/vendor/branchManager'

const defaultValues: CreateBranchManagerInvitationFormData = {
  branch_id: '',
  branch_manager_name: '',
  branch_manager_email: '',
  branch_manager_phone: '',
}

export function useInviteBranchManagerModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<Record<string, unknown>>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

  const { useGetCorporateBranchesListService, useGetCorporateBranchesByVendorIdService } =
    corporateQueries()
  const { data: corporateBranchesList } = useGetCorporateBranchesListService()
  const { data: corporateBranchesByVendor } =
    useGetCorporateBranchesByVendorIdService(vendorIdFromUrl)

  const branchesArray = React.useMemo(() => {
    const raw = vendorIdFromUrl ? corporateBranchesByVendor : corporateBranchesList
    if (!raw) return []
    return Array.isArray(raw) ? raw : ((raw as { data?: unknown[] })?.data ?? [])
  }, [vendorIdFromUrl, corporateBranchesByVendor, corporateBranchesList])

  const branchOptions = React.useMemo(
    () =>
      branchesArray.map((b: { id?: number; branch_id?: number; branch_name?: string }) => ({
        label: b.branch_name || `Branch ${b.id ?? b.branch_id}`,
        value: String(b.id ?? b.branch_id),
      })),
    [branchesArray],
  )

  const form = useForm<CreateBranchManagerInvitationFormData>({
    resolver: zodResolver(CreateBranchManagerInvitationSchema),
    defaultValues,
  })

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset(defaultValues)
  }, [modal, form])

  const { useCreateCorporateBranchManagerInvitationService } = corporateMutations()
  const createMutation = useCreateCorporateBranchManagerInvitationService()

  const onSubmit = React.useCallback(
    (data: CreateBranchManagerInvitationFormData) => {
      createMutation.mutate(
        {
          branch_id: Number(data.branch_id),
          branch_manager_name: data.branch_manager_name,
          branch_manager_email: data.branch_manager_email,
          branch_manager_phone: data.branch_manager_phone,
        },
        {
          onSuccess: () => {
            handleCloseModal()
          },
        },
      )
    },
    [createMutation, handleCloseModal],
  )

  return {
    modal,
    form,
    phoneCountries,
    branchOptions,
    handleCloseModal,
    onSubmit,
    isPending: createMutation.isPending,
    isOpen: modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CREATE),
    isCorporateSuperAdmin,
  }
}
