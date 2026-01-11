import { Button, Modal, StatusCell, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS, ENV_VARS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import type { PaymentInfoData } from '@/types/user'
import { Icon } from '@/libs'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'

function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate()
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj)
  const year = dateObj.getFullYear()

  return `${day} ${month}, ${year}`
}

// Get card background based on type
function getCardBackground(type: string) {
  const normalizedType = type?.toLowerCase()
  switch (normalizedType) {
    case 'dashx':
      return DashxBg
    case 'dashpro':
      return DashproBg
    case 'dashpass':
      return DashpassBg
    case 'dashgo':
      return DashgoBg
    default:
      return DashxBg
  }
}

// Construct full image URL from file_url
function getImageUrl(fileUrl: string | undefined) {
  if (!fileUrl) return ''
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }
  let baseUrl = ENV_VARS.API_BASE_URL
  if (baseUrl.endsWith('/api/v1')) {
    baseUrl = baseUrl.replace('/api/v1', '')
  }
  return `${baseUrl}/uploads/${fileUrl}`
}

// Get card type display name
function getCardTypeName(type: string | undefined) {
  if (!type || !type.trim()) return 'DASHQARD'
  const normalizedType = type.toLowerCase().trim()
  switch (normalizedType) {
    case 'dashx':
      return 'DASHX'
    case 'dashpro':
      return 'DASHPRO'
    case 'dashpass':
      return 'DASHPASS'
    case 'dashgo':
      return 'DASHGO'
    default:
      return type.toUpperCase().trim()
  }
}

export function PaymentDetails() {
  const modal = usePersistedModalState<PaymentInfoData>({
    paramName: MODALS.PAYMENT.ROOT,
  })

  const paymentData = modal.modalData as any // Extend type to include cart_details

  // Get cart items from cart_details
  const cartItems = paymentData?.cart_details?.items || []

  // Build display details array
  const displayDetails: Array<{
    label: string
    value: string
    isStatus?: boolean
  }> = [
    {
      label: 'Status',
      value: paymentData?.status || 'N/A',
      isStatus: true,
    },
    {
      label: 'Payment type',
      value: paymentData?.type || 'N/A',
    },
    {
      label: 'Receipt Number',
      value: paymentData?.receipt_number || 'N/A',
    },
    {
      label: 'Amount',
      value:
        paymentData?.amount && paymentData?.currency
          ? formatCurrency(paymentData.amount, paymentData.currency)
          : 'N/A',
    },
    {
      label: 'Currency',
      value: paymentData?.currency || 'N/A',
    },
    {
      label: 'Transaction ID',
      value: paymentData?.trans_id || 'N/A',
    },
    {
      label: 'User',
      value: paymentData?.user_name || 'N/A',
    },
    {
      label: 'User Type',
      value: paymentData?.user_type || 'N/A',
    },
    {
      label: 'Created At',
      value: paymentData?.created_at ? formatDateShort(paymentData.created_at) : 'N/A',
    },
    {
      label: 'Updated At',
      value: paymentData?.updated_at ? formatDateShort(paymentData.updated_at) : 'N/A',
    },
  ].filter((detail) => detail.value !== 'N/A' || detail.label === 'Status') // Show status even if N/A

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.PAYMENT.VIEW)}
      setIsOpen={modal.closeModal}
      title="Payment Details"
      position="side"
      panelClass="!w-[864px]"
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {/* Payment Details Section */}
          <div className="mb-6">
            <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
              Payment Information
            </Text>
            <div className="flex flex-col gap-2">
              {displayDetails.map((detail, index) => (
                <div
                  key={detail.label}
                  className={`py-3 ${index < displayDetails.length - 1 ? 'border-b border-[#F5F5F5]' : ''}`}
                >
                  <p className="text-xs text-[#A4A7AE]">{detail.label}</p>
                  {detail.isStatus ? (
                    <StatusCell
                      getValue={() => detail.value as string}
                      row={{
                        original: {
                          id: paymentData?.id?.toString() || '',
                          status: detail.value as string,
                        },
                      }}
                    />
                  ) : (
                    <Text variant="span" className="text-gray-900 font-medium">
                      {detail.value}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Cards Section */}
          {cartItems.length > 0 && (
            <div className="mt-6">
              <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
                Purchased Cards ({cartItems.length})
              </Text>
              <div className="space-y-4">
                {cartItems.map((item: any, index: number) => {
                  const cardBackground = getCardBackground(item.type || '')
                  const cardImageUrl = item.images?.[0]?.file_url
                    ? getImageUrl(item.images[0].file_url)
                    : null
                  const recipients = item.recipients || []

                  return (
                    <div
                      key={`${item.cart_item_id || index}`}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex gap-4">
                        {/* Card Preview */}
                        <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                          <img
                            src={cardBackground}
                            alt={`${item.type} card background`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {cardImageUrl && (
                            <img
                              src={cardImageUrl}
                              alt={item.product || 'Card image'}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          )}
                        </div>

                        {/* Card Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Text variant="h4" weight="semibold" className="text-gray-900 mb-1">
                                {item.product || 'Gift Card'}
                              </Text>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="font-semibold">{getCardTypeName(item.type)}</span>
                                <span>•</span>
                                <span>Card ID: {item.card_id}</span>
                              </div>
                              {item.description && (
                                <Text
                                  variant="p"
                                  className="text-sm text-gray-600 mb-2 line-clamp-2"
                                >
                                  {item.description}
                                </Text>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <Text variant="h4" weight="bold" className="text-primary-500">
                                {formatCurrency(
                                  item.total_amount || item.price || '0',
                                  item.currency || 'GHS',
                                )}
                              </Text>
                              {item.service_fee && (
                                <Text variant="span" className="text-xs text-gray-500">
                                  Service Fee:{' '}
                                  {formatCurrency(item.service_fee, item.currency || 'GHS')}
                                </Text>
                              )}
                            </div>
                          </div>

                          {/* Recipients */}
                          {recipients.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Text
                                variant="span"
                                weight="semibold"
                                className="text-sm text-gray-700 mb-2 block"
                              >
                                Recipients ({recipients.length})
                              </Text>
                              <div className="space-y-2">
                                {recipients.map((recipient: any, idx: number) => (
                                  <div
                                    key={recipient.id || idx}
                                    className="flex items-center justify-between bg-white rounded-md p-2 text-sm"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <Text
                                        variant="span"
                                        weight="medium"
                                        className="text-gray-900 block truncate"
                                      >
                                        {recipient.name || 'Unnamed Recipient'}
                                      </Text>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        {recipient.email && (
                                          <span className="flex items-center gap-1 truncate">
                                            <Icon icon="bi:envelope" className="size-3" />
                                            {recipient.email}
                                          </span>
                                        )}
                                        {recipient.phone && (
                                          <span className="flex items-center gap-1 truncate">
                                            <Icon icon="bi:phone" className="size-3" />
                                            {recipient.phone}
                                          </span>
                                        )}
                                      </div>
                                      {recipient.message && (
                                        <Text
                                          variant="span"
                                          className="text-xs text-gray-600 italic mt-1 block"
                                        >
                                          "{recipient.message}"
                                        </Text>
                                      )}
                                    </div>
                                    <Text
                                      variant="span"
                                      weight="semibold"
                                      className="text-primary-500 ml-4"
                                    >
                                      {formatCurrency(
                                        recipient.amount || '0',
                                        item.currency || 'GHS',
                                      )}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Item Metadata */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>Quantity: {item.total_quantity || 1}</span>
                            {item.base_price && (
                              <span>
                                Base Price:{' '}
                                {formatCurrency(item.base_price, item.currency || 'GHS')}
                              </span>
                            )}
                            {item.markup_amount && (
                              <span>
                                Markup: {formatCurrency(item.markup_amount, item.currency || 'GHS')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 flex justify-center mt-auto border-t border-gray-200">
          <Button variant="outline" onClick={modal.closeModal} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
