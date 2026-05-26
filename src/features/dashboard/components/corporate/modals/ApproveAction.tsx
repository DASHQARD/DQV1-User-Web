import { Button, Modal, Text } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { resolveVendorIdForCorporateApproval } from '@/utils/resolveVendorIdFromRequest'
import { canApproveAtCurrentLevel } from '@/utils/requestStatus'
import { useToast } from '@/hooks'

export function ApproveAction() {
  const modal = usePersistedModalState<{
    id: number | string
    request_id?: string
    status?: string
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
  const useVendorScopedApproval = isCorporateSuperAdmin && Boolean(approvalVendorId)

  const { useUpdateRequestStatusService, useUpdateCorporateSuperAdminVendorRequestStatusService } =
    corporateMutations()
  const { mutate: updateRequestStatus, isPending: isPendingCorporate } =
    useUpdateRequestStatusService()
  const { mutate: updateVendorScopedRequestStatus, isPending: isPendingVendorScoped } =
    useUpdateCorporateSuperAdminVendorRequestStatusService()
  const isPending = isPendingCorporate || isPendingVendorScoped

  const handleApprove = () => {
    const requestId = modal.modalData?.id ?? modal.modalData?.request_id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }

    const payload = { id: String(requestId), status: 'approved' as const }
    const needsVendorScoped =
      isCorporateSuperAdmin &&
      canApproveAtCurrentLevel(
        { status: modal.modalData?.status, current_approver_level: 'vendor_admin' },
        'corporate-vendor-scoped',
      )

    if (needsVendorScoped && !approvalVendorId) {
      toast.error(
        'Open this vendor from Vendor Management (switch to vendor account), then approve from Vendor → Requests.',
      )
      return
    }

    if (useVendorScopedApproval && approvalVendorId) {
      updateVendorScopedRequestStatus(
        { vendorId: approvalVendorId, data: payload },
        { onSuccess: () => modal.closeModal() },
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
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.APPROVE)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <div className="p-6">
        <div className="space-y-4 flex flex-col items-center justify-center">
          <Icon icon="bi:check-circle" width={48} height={48} className="text-green-500" />
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
          <Button variant="secondary" loading={isPending} onClick={handleApprove} className="grow">
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  )
}
