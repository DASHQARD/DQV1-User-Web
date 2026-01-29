import type { SubmitHandler } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import { Button, CreatableCombobox, Modal, Text } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS, REJECT_REASON_OPTIONS } from '@/utils/constants'
import { Icon, useCustomForm } from '@/libs'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToggleCustomerStatusSchema } from '@/utils/schemas'
import { vendorMutations } from '@/features/dashboard/vendor/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function VendorRejectAction() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl

  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useUpdateRequestStatusService } = vendorMutations()
  const { useUpdateCorporateSuperAdminVendorRequestStatusService } = corporateMutations()
  const { mutate: updateRequestStatus, isPending: isPendingVendor } =
    useUpdateRequestStatusService()
  const { mutate: updateCorporateVendorRequestStatus, isPending: isPendingCorporateVendor } =
    useUpdateCorporateSuperAdminVendorRequestStatusService()
  const isPending = isPendingVendor || isPendingCorporateVendor

  const form = useCustomForm({
    resolver: zodResolver(ToggleCustomerStatusSchema),
    defaultValues: {
      reason: '',
    },
  })

  const onSubmit: SubmitHandler<any> = () => {
    const requestId = modal.modalData?.id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }
    const id = typeof requestId === 'string' ? parseInt(requestId, 10) : requestId
    const payload = { id, status: 'rejected' as const }

    if (useCorporateVendorScoped && vendorIdFromUrl) {
      updateCorporateVendorRequestStatus(
        { vendorId: vendorIdFromUrl, data: payload },
        { onSuccess: () => modal.closeModal() },
      )
    } else {
      updateRequestStatus(payload, { onSuccess: () => modal.closeModal() })
    }
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
