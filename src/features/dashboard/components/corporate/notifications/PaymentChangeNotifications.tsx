import {
  usePaymentChangeNotifications,
  useApprovePaymentChange,
  useRejectPaymentChange,
} from '@/features/dashboard/hooks/useNotifications'
import { Button, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { formatDate } from '@/utils/format'

export function PaymentChangeNotifications() {
  const modal = usePersistedModalState({
    paramName: MODALS.NOTIFICATIONS?.PAYMENT_CHANGE || 'payment-change-notification',
  })
  const { data: notificationsResponse, isLoading } = usePaymentChangeNotifications()
  const { mutate: approvePayment, isPending: isApproving } = useApprovePaymentChange()
  const { mutate: rejectPayment, isPending: isRejecting } = useRejectPaymentChange()

  const notifications = notificationsResponse?.data || []
  const pendingNotifications = notifications.filter((n) => n.status === 'pending')

  const handleApprove = (notificationId: number) => {
    if (window.confirm('Are you sure you want to approve this payment change?')) {
      approvePayment(notificationId)
    }
  }

  const handleReject = (notificationId: number) => {
    if (window.confirm('Are you sure you want to reject this payment change?')) {
      rejectPayment(notificationId)
    }
  }

  return (
    <>
      {pendingNotifications.length > 0 && (
        <button
          type="button"
          onClick={() =>
            modal.openModal(MODALS.NOTIFICATIONS?.PAYMENT_CHANGE || 'payment-change-notification')
          }
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Payment change notifications"
        >
          <Icon icon="hugeicons:notification-01" className="w-6 h-6" />
          {pendingNotifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingNotifications.length}
            </span>
          )}
        </button>
      )}
      <Modal
        isOpen={modal.isModalOpen(
          MODALS.NOTIFICATIONS?.PAYMENT_CHANGE || 'payment-change-notification',
        )}
        setIsOpen={modal.closeModal}
        title="Payment Change Notifications"
        panelClass="max-w-3xl"
      >
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Text variant="p" className="text-gray-500">
                Loading notifications...
              </Text>
            </div>
          ) : pendingNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                icon="hugeicons:notification-off"
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
              />
              <Text variant="p" className="text-gray-500">
                No pending payment change notifications
              </Text>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {pendingNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
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

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleApprove(notification.id)}
                      disabled={isApproving || isRejecting}
                      loading={isApproving}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleReject(notification.id)}
                      disabled={isApproving || isRejecting}
                      loading={isRejecting}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
