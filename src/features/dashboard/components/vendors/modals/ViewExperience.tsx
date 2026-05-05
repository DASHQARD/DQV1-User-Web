import React from 'react'
import { Modal, Text, Button } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { formatDate, formatCurrency } from '@/utils/format'
import { Icon } from '@/libs'

export function ViewExperience() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const card = modal.modalData as any

  // Normalize card fields (vendor uses product/type/price, corporate API uses card_name/card_type/card_price)
  const displayCard = React.useMemo(() => {
    if (!card) return null
    const priceVal = card.base_price ?? card.price ?? card.card_price
    const priceNum = typeof priceVal === 'number' ? priceVal : parseFloat(priceVal)
    return {
      product: card.product || card.card_name || '-',
      type: card.type || card.card_type || '-',
      price: Number.isFinite(priceNum) ? priceNum : null,
      currency: card.currency || 'GHS',
      status: card.status || card.card_status || '-',
      cardId: card.card_id ?? card.id ?? '-',
      vendorName: card.vendor_name || '-',
      issueDate: card.issue_date,
      expiryDate: card.expiry_date,
      description: card.description || card.card_description || '-',
      images: card.images || [],
      termsAndConditions: card.terms_and_conditions || [],
    }
  }, [card])

  const getImageUrl = React.useCallback((image: any) => {
    return image?.file_url || ''
  }, [])

  const getTermUrl = React.useCallback((term: any) => {
    return term?.file_url || ''
  }, [])

  if (!card) return null

  return (
    <Modal
      title="Experience Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.EXPERIENCE.VIEW)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <div className="p-6 space-y-6">
        {displayCard && (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Product Name
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.product}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Type
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.type}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Price
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.price != null
                    ? formatCurrency(displayCard.price, displayCard.currency)
                    : '-'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Status
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1 capitalize">
                  {displayCard.status}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Card ID
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.cardId}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Vendor Name
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.vendorName}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Issue Date
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.issueDate ? formatDate(displayCard.issueDate) : '-'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-xs text-gray-500">
                  Expiry Date
                </Text>
                <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                  {displayCard.expiryDate ? formatDate(displayCard.expiryDate) : '-'}
                </Text>
              </div>
            </div>

            <div>
              <Text variant="span" className="text-xs text-gray-500">
                Description
              </Text>
              <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
                {displayCard.description}
              </Text>
            </div>
          </>
        )}

        {/* Card images */}
        {displayCard && displayCard.images.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="bi:images" className="text-primary-600 text-xl" />
              <Text variant="span" className="text-xs text-gray-500">
                Images
              </Text>
              <span className="text-sm text-gray-500">
                ({displayCard.images.length} {displayCard.images.length === 1 ? 'image' : 'images'})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {displayCard.images.map((image: any, index: number) => {
                const imageUrl = getImageUrl(image)
                const imageAlt =
                  image?.file_name || `${displayCard?.product ?? 'Card'} image ${index + 1}`
                return (
                  <div
                    key={image?.id ?? index}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                    style={{ paddingTop: '100%' }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Icon icon="bi:image" className="size-10" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Terms and conditions */}
        {displayCard && displayCard.termsAndConditions.length > 0 && (
          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Terms and Conditions
            </Text>
            <div className="flex flex-col gap-2 mt-2">
              {displayCard.termsAndConditions.map((term: any, index: number) => {
                const termUrl = getTermUrl(term)
                const key = term?.id ?? index
                return termUrl ? (
                  <a
                    key={key}
                    href={termUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Icon icon="bi:file-earmark-pdf" className="text-lg shrink-0" />
                    <span>{term?.file_name || `Terms ${index + 1}`}</span>
                  </a>
                ) : (
                  <span key={key} className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon icon="bi:file-earmark-pdf" className="text-lg shrink-0" />
                    <span>{term?.file_name || `Terms ${index + 1}`}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={modal.closeModal}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              modal.closeModal()
              modal.openModal(MODALS.EXPERIENCE.EDIT, card)
            }}
          >
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
