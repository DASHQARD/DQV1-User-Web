import { Button, Modal, PrintView, Tag, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatCurrency, formatFullDate } from '@/utils/format'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'
import { Icon } from '@/libs'

// --- Skeleton Loader ---
function TransactionDetailsSkeleton() {
  return (
    <div className="h-full px-6 flex flex-col justify-between animate-pulse">
      <div className="grow">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
          >
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
// --- End Skeleton Loader ---

export function TransactionDetails() {
  const modal = usePersistedModalState<{ id: string | number; trans_id?: string }>({
    paramName: MODALS.TRANSACTION.PARAM_NAME,
  })

  // Get payment ID from modal data (could be id or trans_id)
  const paymentIdFromModal = modal.modalData
  const paymentId =
    paymentIdFromModal?.id?.toString() ||
    paymentIdFromModal?.trans_id ||
    paymentIdFromModal?.id ||
    null

  // Fetch payment details by ID
  const { useGetPaymentByIdService } = corporateQueries()
  const { data: paymentDetailsResponse, isLoading } = useGetPaymentByIdService(paymentId)

  // Extract payment data from response
  const paymentData = paymentDetailsResponse?.data || paymentDetailsResponse
  const isPending = isLoading
  const cartDetails = paymentData?.cart_details
  const cartItems = cartDetails?.items || []

  // Map payment data to display format
  const transactionInfo = [
    {
      label: 'Status',
      value: (
        <Tag
          variant={getStatusVariant(paymentData?.status || '')}
          value={paymentData?.status || ''}
        />
      ),
    },
    {
      label: 'Transaction ID',
      value: paymentData?.trans_id || paymentData?.id?.toString() || '-',
    },
    {
      label: 'Receipt Number',
      value: paymentData?.receipt_number || '-',
    },
    {
      label: 'Transaction Type',
      value: paymentData?.type
        ? paymentData.type
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '-',
    },
    {
      label: 'Amount',
      value: formatCurrency(Number(paymentData?.amount) || 0, paymentData?.currency || 'GHS'),
    },
    {
      label: 'User Name',
      value: paymentData?.user_name || '-',
    },
    {
      label: 'Phone Number',
      value: paymentData?.phone || '-',
    },
    {
      label: 'User Type',
      value: paymentData?.user_type
        ? paymentData.user_type
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '-',
    },
    {
      label: 'Card Type',
      value: paymentData?.card_type || 'N/A',
    },
    {
      label: 'Cart ID',
      value: paymentData?.cart_id?.toString() || '-',
    },
    {
      label: 'Created At',
      value: paymentData?.created_at ? formatFullDate(paymentData.created_at) : '-',
    },
    {
      label: 'Updated At',
      value: paymentData?.updated_at ? formatFullDate(paymentData.updated_at) : '-',
    },
  ]

  return (
    <Modal
      title="Transaction Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.TRANSACTION.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      panelClass="!w-2/3"
    >
      <PrintView>
        {isPending ? (
          <TransactionDetailsSkeleton />
        ) : (
          <div className="h-full px-6 flex flex-col justify-between">
            <div className="grow">
              {transactionInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
                >
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-primary-800 capitalize">
                    {item.value || '-'}
                  </p>
                </div>
              ))}

              {/* Cart Details Section */}
              {cartDetails && cartItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="bi:cart-check" className="text-lg text-primary-600" />
                    <Text variant="h5" weight="semibold" className="text-primary-900">
                      Cart Details
                    </Text>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item: any, index: number) => (
                      <div
                        key={item.cart_item_id || index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Text variant="span" weight="semibold" className="text-gray-900">
                                {item.product}
                              </Text>
                              <Tag variant="gray" value={item.type} className="text-xs" />
                            </div>
                            {item.description && (
                              <Text variant="p" className="text-sm text-gray-600">
                                {item.description}
                              </Text>
                            )}
                          </div>
                          <div className="text-right">
                            <Text variant="span" weight="semibold" className="text-primary-900">
                              {formatCurrency(
                                Number(item.total_amount || item.price || 0),
                                item.currency || 'GHS',
                              )}
                            </Text>
                            {item.service_fee > 0 && (
                              <Text variant="p" className="text-xs text-gray-500">
                                Service Fee:{' '}
                                {formatCurrency(item.service_fee, item.currency || 'GHS')}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Text variant="span" className="text-xs text-gray-500">
                              Base Price
                            </Text>
                            <Text variant="p" className="text-gray-900 font-medium">
                              {formatCurrency(
                                Number(item.base_price || item.price || 0),
                                item.currency || 'GHS',
                              )}
                            </Text>
                          </div>
                          <div>
                            <Text variant="span" className="text-xs text-gray-500">
                              Quantity
                            </Text>
                            <Text variant="p" className="text-gray-900 font-medium">
                              {item.total_quantity || 0}
                            </Text>
                          </div>
                          {item.markup_amount && item.markup_amount > 0 && (
                            <div>
                              <Text variant="span" className="text-xs text-gray-500">
                                Markup
                              </Text>
                              <Text variant="p" className="text-gray-900 font-medium">
                                {formatCurrency(item.markup_amount, item.currency || 'GHS')}
                              </Text>
                            </div>
                          )}
                        </div>

                        {/* Recipients Section */}
                        {item.recipients && item.recipients.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Text
                              variant="span"
                              weight="medium"
                              className="text-sm text-gray-700 mb-2 block"
                            >
                              Recipients ({item.recipients.length})
                            </Text>
                            <div className="space-y-2">
                              {item.recipients.map((recipient: any, recIndex: number) => (
                                <div
                                  key={recipient.id || recIndex}
                                  className="bg-white rounded p-2 border border-gray-100"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <Text
                                        variant="span"
                                        weight="medium"
                                        className="text-sm text-gray-900"
                                      >
                                        {recipient.name}
                                      </Text>
                                      <div className="flex items-center gap-3 mt-1">
                                        {recipient.email && (
                                          <Text variant="span" className="text-xs text-gray-600">
                                            {recipient.email}
                                          </Text>
                                        )}
                                        {recipient.phone && (
                                          <Text variant="span" className="text-xs text-gray-600">
                                            {recipient.phone}
                                          </Text>
                                        )}
                                      </div>
                                      {recipient.message && (
                                        <Text
                                          variant="p"
                                          className="text-xs text-gray-500 mt-1 italic"
                                        >
                                          "{recipient.message}"
                                        </Text>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <Text
                                        variant="span"
                                        weight="semibold"
                                        className="text-sm text-primary-900"
                                      >
                                        {formatCurrency(
                                          Number(recipient.amount || item.price || 0),
                                          item.currency || 'GHS',
                                        )}
                                      </Text>
                                      {recipient.quantity > 1 && (
                                        <Text variant="p" className="text-xs text-gray-500">
                                          Qty: {recipient.quantity}
                                        </Text>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-300 bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        Cart Total
                      </Text>
                      <Text variant="h5" weight="bold" className="text-primary-900">
                        {formatCurrency(
                          Number(cartDetails.cart_total_amount || paymentData?.amount || 0),
                          paymentData?.currency || 'GHS',
                        )}
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-3">
              <Button variant="outline" onClick={modal.closeModal} className="w-1/2">
                Cancel
              </Button>
              <Button className="w-1/2" variant="secondary" onClick={globalThis.print}>
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
