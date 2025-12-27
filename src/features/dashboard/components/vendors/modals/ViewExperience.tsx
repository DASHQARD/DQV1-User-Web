import React from 'react'
import { Modal, Text, Button } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { formatDate, formatCurrency } from '@/utils/format'
import { usePresignedURL } from '@/hooks'
import { Icon } from '@/libs'

export function ViewExperience() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const card = modal.modalData as any
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [imageUrls, setImageUrls] = React.useState<string[]>([])
  const [termsUrls, setTermsUrls] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!card?.images || !card?.terms_and_conditions) return

    const fetchUrls = async () => {
      const imagePromises = (card.images || []).map((img: any) =>
        fetchPresignedURL(img.file_url).catch(() => null),
      )
      const termsPromises = (card.terms_and_conditions || []).map((term: any) =>
        fetchPresignedURL(term.file_url).catch(() => null),
      )

      const imageResults = await Promise.all(imagePromises)
      const termsResults = await Promise.all(termsPromises)

      setImageUrls(imageResults.filter(Boolean) as string[])
      setTermsUrls(termsResults.filter(Boolean) as string[])
    }

    fetchUrls()
  }, [card, fetchPresignedURL])

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
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Product Name
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.product || '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Type
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.type || '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Price
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.price ? formatCurrency(parseFloat(card.price), card.currency || 'GHS') : '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Status
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1 capitalize">
              {card.status || '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Card ID
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.card_id || '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Vendor Name
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.vendor_name || '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Issue Date
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.issue_date ? formatDate(card.issue_date) : '-'}
            </Text>
          </div>

          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Expiry Date
            </Text>
            <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
              {card.expiry_date ? formatDate(card.expiry_date) : '-'}
            </Text>
          </div>
        </div>

        <div>
          <Text variant="span" className="text-xs text-gray-500">
            Description
          </Text>
          <Text variant="p" className="text-sm font-medium text-gray-900 mt-1">
            {card.description || '-'}
          </Text>
        </div>

        {imageUrls.length > 0 && (
          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Images
            </Text>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {termsUrls.length > 0 && (
          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Terms and Conditions
            </Text>
            <div className="flex flex-col gap-2 mt-2">
              {termsUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Icon icon="bi:file-earmark-pdf" className="text-lg" />
                  <span>
                    {card.terms_and_conditions?.[index]?.file_name || `Terms ${index + 1}`}
                  </span>
                </a>
              ))}
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
