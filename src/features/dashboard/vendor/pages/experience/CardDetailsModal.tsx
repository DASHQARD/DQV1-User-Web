import { Modal } from '@/components'
import { Icon } from '@/libs'
import { Loader } from '@/components/Loader'
import { useCard } from '@/features/dashboard/hooks'

interface CardDetailsModalProps {
  cardId: number | null
  isOpen: boolean
  onClose: () => void
}

export function CardDetailsModal({ cardId, isOpen, onClose }: CardDetailsModalProps) {
  const { data: cardResponse, isLoading } = useCard(cardId)

  const card = cardResponse?.data

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!open) {
          onClose()
        }
      }}
      showClose
      position="center"
      panelClass="max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader />
          </div>
        ) : card ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{card.product}</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-gray-900">{card.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        card.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="mt-1 text-gray-900">
                    {new Intl.NumberFormat('en-GH', {
                      style: 'currency',
                      currency: card.currency || 'GHS',
                    }).format(parseFloat(card.price))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <p className="mt-1 text-gray-900">{card.rating || 0} ⭐</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Issue Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(card.issue_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(card.expiry_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{card.description}</p>
              </div>

              {/* Images */}
              {card.images && card.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">Images</label>
                  <div className="grid grid-cols-3 gap-4">
                    {card.images.map((img: { file_url: string; file_name: string }, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={img.file_url}
                          alt={img.file_name}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-3 block">
                    Terms and Conditions
                  </label>
                  <div className="space-y-2">
                    {card.terms_and_conditions.map((tc: { file_url: string; file_name: string }, index: number) => (
                      <a
                        key={index}
                        href={tc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon icon="bi:file-earmark-pdf" className="w-6 h-6 text-red-500" />
                        <span className="flex-1 text-sm text-gray-700">{tc.file_name}</span>
                        <Icon icon="bi:box-arrow-up-right" className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor Info */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">Vendor</label>
                <p className="mt-1 text-gray-900">{card.vendor_name}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Card not found</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
