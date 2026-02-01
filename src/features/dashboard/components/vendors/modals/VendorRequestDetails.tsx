import { Button, Modal, PrintView } from '@/components'
import { MODALS } from '@/utils/constants'
import { VendorRejectAction } from './VendorRejectAction'
import { VendorApproveAction } from './VendorApproveAction'
import { RequestDetailsSkeleton } from './skeletons'
import {
  useVendorRequestDetails,
  type RequestInfoRow,
  type UseVendorRequestDetailsReturn,
} from './useVendorRequestDetails'

export function VendorRequestDetails() {
  const { modal, isPending, requestInfo, data, openApproveModal, openRejectModal } =
    useVendorRequestDetails() as UseVendorRequestDetailsReturn

  return (
    <Modal
      title="Request Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <PrintView>
        {isPending ? (
          <RequestDetailsSkeleton />
        ) : (
          <div className="h-full px-8 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {requestInfo.map((item: RequestInfoRow, index: number) => {
                if (item.isSection) {
                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="col-span-2 pt-4 mt-2 border-t border-gray-200 first:pt-0 first:mt-0 first:border-0"
                    >
                      <p className="text-sm font-semibold text-primary-800 uppercase tracking-wide">
                        {item.label}
                      </p>
                    </div>
                  )
                }
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className={`flex flex-col gap-0.5 py-2 min-w-0 ${item.spanFull ? 'col-span-2' : ''}`}
                  >
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <div className="text-sm text-primary-800 capitalize wrap-break-word">
                      {item.value ?? '-'}
                    </div>
                  </div>
                )
              })}
            </div>

            {String(data?.status ?? '').toLowerCase() === 'pending' && (
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 shrink-0">
                <Button variant="secondary" loading={isPending} onClick={openApproveModal}>
                  Approve
                </Button>
                <Button variant="outline" onClick={openRejectModal}>
                  Reject
                </Button>
              </div>
            )}

            <VendorRejectAction />
            <VendorApproveAction />
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
