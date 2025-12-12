import React from 'react'
import {
  usePendingExperienceApprovals,
  useApproveExperience,
  useRejectExperience,
} from '@/features/dashboard/hooks/useExperienceApproval'
import { Button, Modal, Text, Input } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { formatDate } from '@/utils/format'

export function ExperienceApprovalNotifications() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE?.APPROVAL || 'experience-approval-notification',
  })
  const { data: approvalsResponse, isLoading } = usePendingExperienceApprovals()
  const { mutate: approveExperience, isPending: isApproving } = useApproveExperience()
  const { mutate: rejectExperience, isPending: isRejecting } = useRejectExperience()
  const [rejectReason, setRejectReason] = React.useState('')
  const [selectedCardId, setSelectedCardId] = React.useState<number | null>(null)

  const approvals = approvalsResponse?.data || []
  const pendingApprovals = approvals.filter((a) => a.status === 'pending')

  const handleApprove = (cardId: number) => {
    if (window.confirm('Are you sure you want to approve this experience?')) {
      approveExperience(cardId)
    }
  }

  const handleReject = (cardId: number) => {
    setSelectedCardId(cardId)
  }

  const confirmReject = () => {
    if (selectedCardId) {
      rejectExperience({ cardId: selectedCardId, reason: rejectReason || undefined })
      setSelectedCardId(null)
      setRejectReason('')
    }
  }

  return (
    <>
      {pendingApprovals.length > 0 && (
        <button
          type="button"
          onClick={() =>
            modal.openModal(MODALS.EXPERIENCE?.APPROVAL || 'experience-approval-notification')
          }
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Experience approval notifications"
        >
          <Icon icon="hugeicons:notification-01" className="w-6 h-6" />
          {pendingApprovals.length > 0 && (
            <span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingApprovals.length}
            </span>
          )}
        </button>
      )}
      <Modal
        isOpen={modal.isModalOpen(
          MODALS.EXPERIENCE?.APPROVAL || 'experience-approval-notification',
        )}
        setIsOpen={modal.closeModal}
        title="Experience Approval Requests"
        panelClass="max-w-3xl"
      >
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Text variant="p" className="text-gray-500">
                Loading approval requests...
              </Text>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                icon="hugeicons:notification-off"
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
              />
              <Text variant="p" className="text-gray-500">
                No pending experience approval requests
              </Text>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Text variant="h4" weight="semibold" className="text-gray-900">
                        {approval.product}
                      </Text>
                      <Text variant="p" className="text-sm text-gray-600">
                        Branch: {approval.branch_name}
                      </Text>
                      <Text variant="p" className="text-sm text-gray-600">
                        Created by: {approval.branch_manager_name}
                      </Text>
                      <Text variant="p" className="text-xs text-gray-500 mt-1">
                        Requested on {formatDate(approval.created_at)}
                      </Text>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleApprove(approval.card_id)}
                      disabled={isApproving || isRejecting}
                      loading={isApproving}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleReject(approval.card_id)}
                      disabled={isApproving || isRejecting}
                    >
                      Reject
                    </Button>
                  </div>

                  {/* Reject Reason Input */}
                  {selectedCardId === approval.card_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Input
                        label="Rejection Reason (Optional)"
                        placeholder="Enter reason for rejection"
                        type="textarea"
                        value={rejectReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          setRejectReason(e.target.value)
                        }
                      />
                      <div className="flex gap-3 mt-3">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={confirmReject}
                          disabled={isRejecting}
                          loading={isRejecting}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            setSelectedCardId(null)
                            setRejectReason('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
