import React from 'react'
import { Modal, Text, Button, Loader } from '@/components'
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

  // Normalize card fields (vendor uses product/type/price, corporate API uses card_name/card_type/card_price)
  const displayCard = React.useMemo(() => {
    if (!card) return null
    const priceVal = card.price ?? card.card_price ?? card.base_price
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

  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [imageUrls, setImageUrls] = React.useState<Record<number | string, string>>({})
  const [termsUrls, setTermsUrls] = React.useState<Record<number | string, string>>({})
  const [isLoadingImages, setIsLoadingImages] = React.useState(false)
  const [isLoadingTerms, setIsLoadingTerms] = React.useState(false)

  // Fetch presigned URLs for images and terms (same pattern as website CardDetails)
  React.useEffect(() => {
    if (!card) {
      setImageUrls({})
      setTermsUrls({})
      setIsLoadingImages(false)
      setIsLoadingTerms(false)
      return
    }

    let cancelled = false
    const images = card.images || []
    const terms = card.terms_and_conditions || []

    if (images.length > 0) {
      setIsLoadingImages(true)
      const fetchImageUrls = async () => {
        try {
          const results = await Promise.all(
            images.map(async (image: any, index: number) => {
              if (!image?.file_url) return { key: image.id || index, url: null }
              try {
                const response = await fetchPresignedURL(image.file_url)
                const url =
                  typeof response === 'string' ? response : (response as any)?.url || response
                return { key: image.id || image.file_name || index, url }
              } catch {
                return { key: image.id || image.file_name || index, url: null }
              }
            }),
          )
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((r) => {
              if (r.url) urlMap[r.key] = r.url
            })
            setImageUrls(urlMap)
            setIsLoadingImages(false)
          }
        } catch {
          if (!cancelled) setIsLoadingImages(false)
        }
      }
      fetchImageUrls()
    } else {
      setImageUrls({})
      setIsLoadingImages(false)
    }

    if (terms.length > 0) {
      setIsLoadingTerms(true)
      const fetchTermsUrls = async () => {
        try {
          const results = await Promise.all(
            terms.map(async (term: any, index: number) => {
              if (!term?.file_url) return { key: term.id || index, url: null }
              try {
                const response = await fetchPresignedURL(term.file_url)
                const url =
                  typeof response === 'string' ? response : (response as any)?.url || response
                return { key: term.id || term.file_name || index, url }
              } catch {
                return { key: term.id || term.file_name || index, url: null }
              }
            }),
          )
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((r) => {
              if (r.url) urlMap[r.key] = r.url
            })
            setTermsUrls(urlMap)
            setIsLoadingTerms(false)
          }
        } catch {
          if (!cancelled) setIsLoadingTerms(false)
        }
      }
      fetchTermsUrls()
    } else {
      setTermsUrls({})
      setIsLoadingTerms(false)
    }

    return () => {
      cancelled = true
    }
  }, [card, fetchPresignedURL])

  const getImageUrl = React.useCallback(
    (image: any, index: number) => {
      const key = image?.id ?? image?.file_name ?? index
      if (imageUrls[key]) return imageUrls[key]
      if (image?.file_url?.startsWith('http://') || image?.file_url?.startsWith('https://'))
        return image.file_url
      if (image?.file_url?.startsWith('data:')) return image.file_url
      return ''
    },
    [imageUrls],
  )

  const getTermUrl = React.useCallback(
    (term: any, index: number) => {
      const key = term?.id ?? term?.file_name ?? index
      return termsUrls[key] || ''
    },
    [termsUrls],
  )

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

        {/* Card images – same pattern as website CardDetails (presigned URLs, loading, fallback) */}
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
                const imageUrl = getImageUrl(image, index)
                const imageAlt =
                  image?.file_name || `${displayCard?.product ?? 'Card'} image ${index + 1}`
                return (
                  <div
                    key={image?.id ?? index}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                    style={{ paddingTop: '100%' }}
                  >
                    {isLoadingImages ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Loader />
                      </div>
                    ) : imageUrl ? (
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

        {/* Terms and conditions – presigned URLs */}
        {displayCard && displayCard.termsAndConditions.length > 0 && (
          <div>
            <Text variant="span" className="text-xs text-gray-500">
              Terms and Conditions
            </Text>
            <div className="flex flex-col gap-2 mt-2">
              {displayCard.termsAndConditions.map((term: any, index: number) => {
                const termUrl = getTermUrl(term, index)
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
                    {isLoadingTerms ? (
                      <Loader className="w-5! h-5! [&>img]:w-5! [&>img]:h-5!" />
                    ) : (
                      <Icon icon="bi:file-earmark-pdf" className="text-lg shrink-0" />
                    )}
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
