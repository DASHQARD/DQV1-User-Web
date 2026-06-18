import type { SubmitHandler } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button, CreatableCombobox, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS, REJECT_REASON_OPTIONS } from '@/utils/constants'
import { Icon, useCustomForm } from '@/libs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToggleCustomerStatusSchema } from '@/utils/schemas'
import { useUserProfile, useToast } from '@/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { resolveVendorIdForCorporateApproval } from '@/utils/resolveVendorIdFromRequest'
import { canApproveAtCurrentLevel } from '@/utils/requestStatus'
import {
  buildCorporateVendorManagementUrl,
  buildVendorScopedRequestActionUrl,
} from '@/utils/vendorScopedRequestNavigation'

export function RejectAction() {
  const navigate = useNavigate()
  const modal = usePersistedModalState<{
    id: number | string
    request_id?: string
    status?: string
    current_approver_level?: string
    approvalVendorId?: string | null
  }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const toast = useToast()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const { useGetAllVendorsManagementService } = corporateQueries()
  const { data: vendorsResponse } = useGetAllVendorsManagementService({ limit: 200 })
  const corporateVendors = Array.isArray(vendorsResponse)
    ? vendorsResponse
    : Array.isArray(vendorsResponse?.data)
      ? vendorsResponse.data
      : []
  const approvalVendorId =
    modal.modalData?.approvalVendorId ??
    resolveVendorIdForCorporateApproval(
      (modal.modalData ?? {}) as Record<string, unknown>,
      corporateVendors,
    )

  const { useUpdateRequestStatusService } = corporateMutations()
  const { mutate: updateRequestStatus, isPending } = useUpdateRequestStatusService()

  const form = useCustomForm({
    resolver: zodResolver(ToggleCustomerStatusSchema),
    defaultValues: {
      reason: '',
    },
  })

  const onSubmit: SubmitHandler<any> = (values) => {
    const requestId = modal.modalData?.id ?? modal.modalData?.request_id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }

    const reason = String(values?.reason ?? '').trim()

    const payload = {
      id: String(requestId),
      status: 'rejected' as const,
      ...(reason ? { rejection_reason: reason, comments: reason } : {}),
    }
    const needsVendorScoped =
      isCorporateSuperAdmin &&
      canApproveAtCurrentLevel(
        {
          status: modal.modalData?.status,
          current_approver_level: modal.modalData?.current_approver_level,
        },
        'corporate-vendor-scoped',
      )

    if (needsVendorScoped) {
      if (!approvalVendorId) {
        modal.closeModal()
        toast.info('Select a vendor from Vendor Management, then reject from Requests.')
        navigate(buildCorporateVendorManagementUrl())
        return
      }

      modal.closeModal()
      navigate(
        buildVendorScopedRequestActionUrl('reject', modal.modalData ?? {}, approvalVendorId),
      )
      return
    }

    updateRequestStatus(payload, {
      onSuccess: () => {
        modal.closeModal()
      },
    })
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
