import { Button, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { formatCurrency, formatFullDate } from '@/utils/format'
import { Icon } from '@/libs'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import type { RecipientDetailsData } from '@/types'

export function ViewRecipientDetails() {
  const modal = usePersistedModalState<RecipientDetailsData>({
    paramName: MODALS.RECIPIENT.PARAM_NAME,
  })

  const recipientData = modal.modalData

  // Get card background based on card type
  const getCardBackground = () => {
    if (!recipientData?.card?.type) return DashxBg
    const normalizedType = recipientData.card.type.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashgo':
        return DashgoBg
      default:
        return DashxBg
    }
  }

  // Get card type display name
  const getCardTypeName = () => {
    if (!recipientData?.card?.type) return 'DASHX'
    const normalizedType = recipientData.card.type.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return 'DASHX'
      case 'dashpro':
        return 'DASHPRO'
      case 'dashgo':
        return 'DASHGO'
      default:
        return 'DASHX'
    }
  }

  const cardBackground = getCardBackground()

  const recipientInfo = [
    {
      label: 'Recipient Name',
      value: recipientData?.name || '-',
    },
    {
      label: 'Email',
      value: recipientData?.email || '-',
    },
    {
      label: 'Phone',
      value: recipientData?.phone || '-',
    },
    {
      label: 'Message',
      value: recipientData?.message || '-',
    },
    {
      label: 'Amount',
      value: formatCurrency(parseFloat(recipientData?.amount || '0'), 'GHS'),
    },
    {
      label: 'Quantity',
      value: recipientData?.quantity?.toString() || '-',
    },
    {
      label: 'Cart Item ID',
      value: recipientData?.cart_item_id?.toString() || '-',
    },
    {
      label: 'Created At',
      value: formatFullDate(recipientData?.created_at),
    },
    {
      label: 'Updated At',
      value: formatFullDate(recipientData?.updated_at),
    },
  ]

  const cardInfo = recipientData?.card
    ? [
        {
          label: 'Card Type',
          value: recipientData.card.type || '-',
        },
        {
          label: 'Product',
          value: recipientData.card.product || '-',
        },
        {
          label: 'Card ID',
          value: recipientData.card.card_id || '-',
        },
        {
          label: 'Price',
          value: formatCurrency(
            recipientData.card.price || 0,
            recipientData.card.currency || 'GHS',
          ),
        },
        {
          label: 'Base Price',
          value: formatCurrency(
            recipientData.card.base_price || 0,
            recipientData.card.currency || 'GHS',
          ),
        },
        {
          label: 'Service Fee',
          value: formatCurrency(
            recipientData.card.service_fee || 0,
            recipientData.card.currency || 'GHS',
          ),
        },
        {
          label: 'Description',
          value: recipientData.card.description || '-',
        },
        {
          label: 'Vendor ID',
          value: recipientData.card.vendor_id?.toString() || '-',
        },
        {
          label: 'Vendor Name',
          value: recipientData.card.vendor_name || '-',
        },
        {
          label: 'Expiry Date',
          value: recipientData.card.expiry_date
            ? formatFullDate(recipientData.card.expiry_date)
            : 'No expiry',
        },
      ]
    : []

  return (
    <Modal
      position="side"
      title="Recipient Details"
      panelClass="w-[398px]"
      isOpen={modal.isModalOpen(MODALS.RECIPIENT.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      showClose={true}
    >
      <section className="flex flex-col h-full">
        <div className="px-6 flex flex-col gap-3 flex-1 overflow-y-auto">
          {/* Card Visual Display */}
          {recipientData?.card && (
            <div className="mb-4">
              <div className="relative w-full h-[200px] rounded-xl shadow-lg overflow-hidden">
                <img
                  src={cardBackground}
                  alt={`${recipientData.card.type} card background`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    {/* Left: Card Type */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                      <Icon icon="bi:gift" className="size-4" />
                      <span className="font-extrabold text-sm tracking-wide">
                        {getCardTypeName()}
                      </span>
                    </div>

                    {/* Right: Price */}
                    <div className="text-right bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/20">
                      <div className="text-xl font-extrabold">
                        {formatCurrency(
                          recipientData.card.price || 0,
                          recipientData.card.currency || 'GHS',
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-end justify-between">
                    {/* Left: Vendor Name */}
                    {recipientData.card.vendor_name && (
                      <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                        <span className="font-bold text-sm tracking-wide uppercase">
                          {recipientData.card.vendor_name}
                        </span>
                      </div>
                    )}

                    {/* Right: Product Name */}
                    <div className="text-right">
                      <span className="font-semibold text-sm">{recipientData.card.product}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pb-2">
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Recipient Information
            </Text>
          </div>
          {recipientInfo.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0"
            >
              <p className="text-gray-400 text-xs">{item.label}</p>
              {typeof item.value === 'string' ? (
                <Text variant="span" weight="normal" className="text-gray-800">
                  {item.value}
                </Text>
              ) : (
                item.value
              )}
            </div>
          ))}

          {cardInfo.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <Text variant="h6" weight="semibold" className="text-gray-900">
                  Card Information
                </Text>
              </div>
              {cardInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0"
                >
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  {typeof item.value === 'string' ? (
                    <Text variant="span" weight="normal" className="text-gray-800">
                      {item.value}
                    </Text>
                  ) : (
                    item.value
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="h-12 cursor-pointer w-full"
            onClick={modal.closeModal}
          >
            Close
          </Button>
        </div>
      </section>
    </Modal>
  )
}
