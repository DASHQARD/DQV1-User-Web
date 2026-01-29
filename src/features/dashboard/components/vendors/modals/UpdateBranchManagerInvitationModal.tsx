import React from 'react'
import { useSearchParams } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, Input, BasePhoneInput, Text } from '@/components'
import { usePersistedModalState, useCountriesData, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

const UpdateBranchManagerInvitationSchema = z.object({
  branch_manager_name: z.string().min(1, 'Name is required'),
  branch_manager_email: z.string().email('Invalid email address'),
  branch_manager_phone: z.string().min(1, 'Phone number is required'),
})

type UpdateBranchManagerInvitationFormData = z.infer<typeof UpdateBranchManagerInvitationSchema>

export function UpdateBranchManagerInvitationModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const form = useForm<UpdateBranchManagerInvitationFormData>({
    resolver: zodResolver(UpdateBranchManagerInvitationSchema),
    defaultValues: {
      branch_manager_name: invitation?.branch_manager_name || '',
      branch_manager_email: invitation?.branch_manager_email || '',
      branch_manager_phone: invitation?.branch_manager_phone || '',
    },
  })

  React.useEffect(() => {
    if (invitation) {
      form.reset({
        branch_manager_name: invitation.branch_manager_name || '',
        branch_manager_email: invitation.branch_manager_email || '',
        branch_manager_phone: invitation.branch_manager_phone || '',
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

  const onSubmit = async (data: UpdateBranchManagerInvitationFormData) => {
    if (!invitation?.id) return

    const payload = {
      id: Number(invitation.id),
      data: {
        branch_manager_name: data.branch_manager_name,
        branch_manager_email: data.branch_manager_email,
        branch_manager_phone: data.branch_manager_phone,
      },
    }

    if (isCorporateSuperAdmin && vendorIdFromUrl) {
      updateCorporateVendorMutation.mutate(payload, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    } else if (isCorporateSuperAdmin) {
      updateCorporateMutation.mutate(payload, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    } else {
      updateCorporateMutation.mutate(payload, {
        onSuccess: () => {
          handleCloseModal()
        },
      })
    }
  }

  if (!invitation) return null

  return (
    <Modal
      position="center"
      title="Update Branch Manager Invitation"
      isOpen={modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.UPDATE)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[500px] max-w-[90vw]"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon icon="bi:pencil-fill" className="text-2xl text-blue-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Update Invitation
            </Text>
            <p className="text-sm text-gray-600">
              Update the details for {invitation.branch_manager_email || 'this invitation'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Branch Manager Name"
            placeholder="Enter branch manager name"
            {...form.register('branch_manager_name')}
            error={form.formState.errors.branch_manager_name?.message}
            disabled={isUpdating}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            {...form.register('branch_manager_email')}
            error={form.formState.errors.branch_manager_email?.message}
            disabled={isUpdating}
          />

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="branch_manager_phone"
              render={({ field: { onChange, value } }) => {
                return (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={phoneCountries}
                    maxLength={9}
                    handleChange={onChange}
                    selectedVal={value}
                    label="Phone Number"
                    error={form.formState.errors.branch_manager_phone?.message}
                    disabled={isUpdating}
                  />
                )
              }}
            />
            <p className="text-xs text-gray-500">
              Please enter your number in the format:{' '}
              <span className="font-medium">5512345678</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="secondary" type="submit" disabled={isUpdating} loading={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
