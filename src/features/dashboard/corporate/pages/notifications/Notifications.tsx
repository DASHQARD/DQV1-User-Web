import React from 'react'
import { Text, Button } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import {
  usePaymentChangeNotifications,
  useApprovePaymentChange,
  useRejectPaymentChange,
} from '@/features/dashboard/hooks/useNotifications'
import {
  usePendingExperienceApprovals,
  useApproveExperience,
  useRejectExperience,
} from '@/features/dashboard/hooks/useExperienceApproval'
import { formatDate } from '@/utils/format'

type NotificationTab = 'all' | 'payment-changes' | 'experience-approvals'

export default function Notifications() {
  const [activeTab, setActiveTab] = React.useState<NotificationTab>('all')
  const [rejectReason, setRejectReason] = React.useState('')
  const [selectedCardId, setSelectedCardId] = React.useState<number | null>(null)
  const [showRejectModal, setShowRejectModal] = React.useState(false)

  // Payment change notifications
  const {
    data: paymentNotificationsResponse,
    isLoading: isLoadingPayments,
    refetch: refetchPayments,
  } = usePaymentChangeNotifications()
  const { mutate: approvePayment, isPending: isApprovingPayment } = useApprovePaymentChange()
  const { mutate: rejectPayment, isPending: isRejectingPayment } = useRejectPaymentChange()

  // Experience approval notifications
  const {
    data: experienceApprovalsResponse,
    isLoading: isLoadingExperiences,
    refetch: refetchExperiences,
  } = usePendingExperienceApprovals()
  const { mutate: approveExperience, isPending: isApprovingExperience } = useApproveExperience()
  const { mutate: rejectExperience, isPending: isRejectingExperience } = useRejectExperience()

  // Fetch notifications on mount
  React.useEffect(() => {
    refetchPayments()
    refetchExperiences()
  }, [refetchPayments, refetchExperiences])

  const paymentNotifications = paymentNotificationsResponse?.data || []
  const pendingPaymentNotifications = paymentNotifications.filter((n) => n.status === 'pending')

  const experienceApprovals = experienceApprovalsResponse?.data || []
  const pendingExperienceApprovals = experienceApprovals.filter((a) => a.status === 'pending')

  const handleApprovePayment = (notificationId: number) => {
    if (window.confirm('Are you sure you want to approve this payment change?')) {
      approvePayment(notificationId)
    }
  }

  const handleRejectPayment = (notificationId: number) => {
    if (window.confirm('Are you sure you want to reject this payment change?')) {
      rejectPayment(notificationId)
    }
  }

  const handleApproveExperience = (cardId: number) => {
    if (window.confirm('Are you sure you want to approve this experience?')) {
      approveExperience(cardId)
    }
  }

  const handleRejectExperience = (cardId: number) => {
    setSelectedCardId(cardId)
    setShowRejectModal(true)
  }

  const confirmRejectExperience = () => {
    if (selectedCardId) {
      rejectExperience({ cardId: selectedCardId, reason: rejectReason || undefined })
      setSelectedCardId(null)
      setRejectReason('')
      setShowRejectModal(false)
    }
  }

  const tabs = [
    {
      id: 'all' as NotificationTab,
      label: 'All',
      count: pendingPaymentNotifications.length + pendingExperienceApprovals.length,
    },
  ]

  const isLoading = isLoadingPayments || isLoadingExperiences
  const hasNotifications =
    pendingPaymentNotifications.length > 0 || pendingExperienceApprovals.length > 0

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Notifications
          </Text>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors relative',
                activeTab === tab.id
                  ? 'border-[#402D87] text-[#402D87]'
                  : 'border-transparent text-gray-600 hover:text-gray-900',
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.id ? 'bg-[#402D87] text-white' : 'bg-gray-200 text-gray-700',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Text variant="p" className="text-gray-500">
                Loading notifications...
              </Text>
            </div>
          ) : !hasNotifications ? (
            <div className="text-center py-12">
              <Icon
                icon="hugeicons:notification-off"
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
              />
              <Text variant="p" className="text-gray-500">
                No pending notifications
              </Text>
            </div>
          ) : (
            <>
              {/* Payment Change Notifications */}
              {(activeTab === 'all' || activeTab === 'payment-changes') &&
                pendingPaymentNotifications.length > 0 && (
                  <div className="space-y-4">
                    <Text variant="h3" weight="semibold" className="text-gray-900">
                      Payment Change Requests
                    </Text>
                    {pendingPaymentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Text variant="h4" weight="semibold" className="text-gray-900">
                              {notification.branch_name}
                            </Text>
                            <Text variant="p" className="text-sm text-gray-600">
                              Branch Manager: {notification.branch_manager_name} (
                              {notification.branch_manager_email})
                            </Text>
                            <Text variant="p" className="text-xs text-gray-500 mt-1">
                              Requested on {formatDate(notification.created_at)}
                            </Text>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <Text
                              variant="span"
                              weight="medium"
                              className="text-sm text-red-800 mb-2 block"
                            >
                              Current Payment Method
                            </Text>
                            {notification.old_payment_details.payment_method === 'mobile_money' ? (
                              <div className="text-sm text-gray-700">
                                <p>Mobile Money</p>
                                <p className="text-xs text-gray-600">
                                  Provider: {notification.old_payment_details.mobile_money_provider}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Number: {notification.old_payment_details.mobile_money_number}
                                </p>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700">
                                <p>Bank Account</p>
                                <p className="text-xs text-gray-600">
                                  Bank: {notification.old_payment_details.bank_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Account: {notification.old_payment_details.account_number}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Name: {notification.old_payment_details.account_name}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <Text
                              variant="span"
                              weight="medium"
                              className="text-sm text-green-800 mb-2 block"
                            >
                              New Payment Method
                            </Text>
                            {notification.new_payment_details.payment_method === 'mobile_money' ? (
                              <div className="text-sm text-gray-700">
                                <p>Mobile Money</p>
                                <p className="text-xs text-gray-600">
                                  Provider: {notification.new_payment_details.mobile_money_provider}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Number: {notification.new_payment_details.mobile_money_number}
                                </p>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700">
                                <p>Bank Account</p>
                                <p className="text-xs text-gray-600">
                                  Bank: {notification.new_payment_details.bank_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Account: {notification.new_payment_details.account_number}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Name: {notification.new_payment_details.account_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={() => handleApprovePayment(notification.id)}
                            disabled={isApprovingPayment || isRejectingPayment}
                            variant="primary"
                            size="small"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectPayment(notification.id)}
                            disabled={isApprovingPayment || isRejectingPayment}
                            variant="outline"
                            size="small"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Experience Approval Notifications */}
              {(activeTab === 'all' || activeTab === 'experience-approvals') &&
                pendingExperienceApprovals.length > 0 && (
                  <div className="space-y-4">
                    <Text variant="h3" weight="semibold" className="text-gray-900">
                      Experience Approval Requests
                    </Text>
                    {pendingExperienceApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Text variant="h4" weight="semibold" className="text-gray-900">
                              {approval.product || approval.title || 'Untitled Experience'}
                            </Text>
                            {approval.branch_name && (
                              <Text variant="p" className="text-sm text-gray-600">
                                Branch: {approval.branch_name}
                              </Text>
                            )}
                            {approval.branch_manager_name && (
                              <Text variant="p" className="text-sm text-gray-600">
                                Created by: {approval.branch_manager_name}
                              </Text>
                            )}
                            <Text variant="p" className="text-xs text-gray-500 mt-1">
                              Requested on {formatDate(approval.created_at)}
                            </Text>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Pending Approval
                          </span>
                        </div>

                        {approval.description && (
                          <Text variant="p" className="text-sm text-gray-700 mb-4">
                            {approval.description}
                          </Text>
                        )}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApproveExperience(approval.card_id)}
                            disabled={isApprovingExperience || isRejectingExperience}
                            variant="primary"
                            size="small"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectExperience(approval.card_id)}
                            disabled={isApprovingExperience || isRejectingExperience}
                            variant="outline"
                            size="small"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Reject Experience Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Text variant="h3" weight="semibold" className="text-gray-900 mb-4">
              Reject Experience
            </Text>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#402D87]"
                rows={4}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedCardId(null)
                }}
                variant="outline"
                size="small"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRejectExperience}
                disabled={isRejectingExperience}
                variant="primary"
                size="small"
              >
                {isRejectingExperience ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
