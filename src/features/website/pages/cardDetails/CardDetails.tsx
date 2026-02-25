import { useNavigate, Link } from 'react-router-dom'
import { Loader, Button, Text, DocumentViewer } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { useCardDetails } from '../../hooks'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function CardDetails() {
  const navigate = useNavigate()
  const {
    card,
    isLoading,
    redemptionBranches,
    isLoadingImages,
    isLoadingTerms,
    selectedDocument,
    setSelectedDocument,
    imageIndex,
    setImageIndex,
    getCardTypeName,
    handleAddToCart,
    isAdding,
    lightboxImages,
    displayPrice,
    cardBackground,
    termsUrls,
  } = useCardDetails()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Card not found</h2>
          <p className="text-gray-500 mb-4">The card you're looking for doesn't exist.</p>
          <Link
            to={ROUTES.IN_APP.DASHQARDS}
            className="text-primary-500 font-semibold hover:underline"
          >
            Browse all cards
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section with Gradient */}
      <div className="bg-linear-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="wrapper py-6">
          <nav className="flex items-center gap-2 text-sm text-white/90 mb-4">
            <Link
              to={ROUTES.IN_APP.HOME}
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
            <Icon icon="bi:chevron-right" className="size-4 opacity-70" />
            <Link
              to={ROUTES.IN_APP.DASHQARDS}
              className="hover:text-white transition-colors duration-200"
            >
              Cards
            </Link>
            <Icon icon="bi:chevron-right" className="size-4 opacity-70" />
            <span className="text-white font-medium">{card.product}</span>
          </nav>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {card.vendor_name && (
                <button
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${card.vendor_id}&name=${encodeURIComponent(card.vendor_name || '')}`,
                    )
                  }
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-3 group"
                >
                  <Icon
                    icon="bi:shop"
                    className="text-base group-hover:translate-x-1 transition-transform"
                  />
                  <span>{card.vendor_name}</span>
                  <Icon icon="bi:arrow-right" className="text-xs" />
                </button>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                {card.product}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-extrabold text-white">
                  {formatCurrency(displayPrice, card.currency || 'GHS')}
                </span>
                <span className="text-lg text-white/80">{card.currency || 'GHS'} Gift Card</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {card.status && (
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    card.status === 'active'
                      ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                      : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                  }`}
                >
                  {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrapper py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Card Image */}
          <div className="space-y-6">
            {/* Main Card Display */}
            <div className="relative group">
              <div
                className="relative overflow-hidden rounded-3xl bg-gray-200 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ paddingTop: '62.5%' }}
              >
                <img
                  src={cardBackground}
                  alt={`${card.product} card background`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Card Overlay Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    {/* Left: Card Type */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                      <Icon icon="bi:gift" className="size-6" />
                      <span className="font-extrabold text-xl tracking-wide">
                        {getCardTypeName()}
                      </span>
                    </div>

                    {/* Right: Price Badge */}
                    <div className="text-right bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
                      <div className="text-3xl font-extrabold">{displayPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">{card.currency}</div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  {card.vendor_name && (
                    <div className="flex items-end">
                      <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                        <span className="font-bold text-lg tracking-wide uppercase">
                          {card.vendor_name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Images Gallery */}
            {card.images && card.images.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="bi:images" className="text-primary-600 text-xl" />
                  <Text variant="h4" weight="semibold" className="text-gray-900">
                    Gallery
                  </Text>
                  <span className="text-sm text-gray-500">
                    ({card.images.length} {card.images.length === 1 ? 'image' : 'images'})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {card.images.slice(0, 4).map((image: any, index: number) => {
                    const imageUrl = lightboxImages[index]?.src ?? ''
                    return (
                      <button
                        key={image.id || image.file_name || index}
                        type="button"
                        onClick={() => setImageIndex(index)}
                        disabled={!imageUrl || isLoadingImages}
                        className="relative overflow-hidden rounded-xl bg-gray-200 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:hover:scale-100 group border-2 border-transparent hover:border-primary-300"
                        style={{ paddingTop: '100%' }}
                      >
                        {isLoadingImages ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader />
                          </div>
                        ) : imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={`${card.product} image ${index + 1}`}
                              className="absolute inset-0 h-full w-full object-cover group-hover:brightness-110 transition-all duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                              <Icon
                                icon="bi:zoom-in"
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                            <Icon icon="bi:image" className="size-8" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {card.images.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setImageIndex(4)}
                    className="mt-3 w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2"
                  >
                    View all {card.images.length} images
                    <Icon icon="bi:arrow-right" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Card Details */}
          <div className="space-y-6">
            {/* Description */}
            {card.description && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:card-text" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    About This Card
                  </Text>
                </div>
                <Text
                  variant="p"
                  className="text-gray-700 whitespace-pre-line leading-relaxed text-base"
                >
                  {card.description}
                </Text>
              </div>
            )}

            {/* Card Information */}
            <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Icon icon="bi:info-circle" className="text-primary-600 text-xl" />
                </div>
                <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                  Card Information
                </Text>
              </div>
              <div className="space-y-4">
                {card.expiry_date && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon icon="bi:calendar-check" className="text-blue-600 text-base" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Valid Until</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(card.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Icon icon="bi:currency-exchange" className="text-purple-600 text-base" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Currency</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{card.currency || 'GHS'}</span>
                </div>
              </div>
            </div>

            {/* Redemption Locations */}
            {redemptionBranches.length > 0 && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:geo-alt" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    Where to Redeem
                  </Text>
                </div>
                <div className="space-y-3 mb-6">
                  {redemptionBranches.map((branch, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors shrink-0 mt-0.5">
                        <Icon icon="bi:shop" className="text-primary-600 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text
                          variant="span"
                          weight="bold"
                          className="text-gray-900 block text-base"
                        >
                          {branch.branch_name}
                        </Text>
                        {branch.branch_location && (
                          <div className="flex items-center gap-1 mt-1">
                            <Icon icon="bi:geo-alt" className="text-xs text-gray-600" />
                            <Text variant="span" className="text-sm text-gray-600">
                              {branch.branch_location}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon icon="bi:info-circle" className="text-white text-base" />
                    </div>
                    <div>
                      <Text
                        variant="span"
                        weight="bold"
                        className="text-blue-900 text-sm block mb-1"
                      >
                        How to Redeem
                      </Text>
                      <Text variant="span" className="text-blue-800 text-sm block leading-relaxed">
                        Visit any of the locations above to redeem your gift card. Present your card
                        QR code or card details at the point of purchase.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Redemption Instructions */}
            <div className="p-6 lg:p-8 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl border border-primary-400 shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Icon icon="bi:card-checklist" className="text-white text-xl" />
                </div>
                <Text variant="h3" weight="bold" className="text-white text-xl">
                  Redemption Instructions
                </Text>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  {
                    step: 1,
                    text: 'Purchase this gift card and receive it in your account',
                  },
                  {
                    step: 2,
                    text: 'Visit any redemption location listed above',
                  },
                  {
                    step: 3,
                    text: 'Present your card QR code or details at checkout',
                  },
                  {
                    step: 4,
                    text: 'Enjoy your purchase! The amount will be deducted from your card balance',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <Text variant="p" className="text-white/95 text-base leading-relaxed">
                      {item.text}
                    </Text>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.IN_APP.REDEEM)}
                className="w-full text-primary-600 font-bold py-3 rounded-xl shadow-lg border-0"
              >
                <Icon icon="bi:arrow-right-circle" className="mr-2 text-lg" />
                Redeem Your Card
              </Button>
            </div>

            {/* Terms and Conditions */}
            {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:file-earmark-text" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    Terms & Conditions
                  </Text>
                </div>
                <div className="space-y-3">
                  {card.terms_and_conditions.map((term: any, index: number) => {
                    const termKey = term.id || term.file_name || index
                    const termUrl =
                      termsUrls[termKey] ||
                      (term.file_url?.startsWith('http://') || term.file_url?.startsWith('https://')
                        ? term.file_url
                        : null)
                    const termName = term.file_name || `Terms & Conditions ${index + 1}`

                    return (
                      <button
                        key={termKey}
                        type="button"
                        disabled={!termUrl}
                        onClick={() => {
                          if (termUrl) {
                            setSelectedDocument({ url: termUrl, name: termName })
                          }
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 w-full text-left group ${
                          termUrl
                            ? 'border-gray-200 hover:border-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 text-gray-700 hover:text-primary-700 hover:shadow-md'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                            termUrl
                              ? 'bg-primary-100 group-hover:bg-primary-200 text-primary-600'
                              : 'bg-gray-200 text-gray-400'
                          } transition-colors`}
                        >
                          <Icon icon="bi:file-earmark-pdf" className="text-xl" />
                        </div>
                        <span className="flex-1 font-semibold text-base">{termName}</span>
                        {isLoadingTerms ? (
                          <div className="size-5">
                            <Loader />
                          </div>
                        ) : termUrl ? (
                          <div className="w-10 h-10 rounded-lg bg-primary-600 group-hover:bg-primary-700 flex items-center justify-center transition-colors">
                            <Icon icon="bi:eye" className="text-white text-lg" />
                          </div>
                        ) : (
                          <Icon icon="bi:x-circle" className="text-lg text-gray-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Image Lightbox */}
            <Lightbox
              open={imageIndex >= 0}
              close={() => setImageIndex(-1)}
              index={imageIndex}
              slides={lightboxImages}
            />

            {/* Document Viewer Modal */}
            <DocumentViewer
              isOpen={!!selectedDocument}
              setIsOpen={(open) => {
                if (!open) setSelectedDocument(null)
              }}
              documentUrl={selectedDocument?.url || null}
              documentName={selectedDocument?.name}
            />

            {/* Action Buttons - Sticky on scroll */}
            <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-white via-white to-transparent mt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[52px] bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-xl border-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? (
                    <>
                      <Icon icon="mdi:loading" className="size-6 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Icon icon="bi:cart-plus" className="size-6" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                  className="flex-1 flex items-center justify-center gap-2 h-[52px] bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <Icon icon="bi:arrow-left" className="size-6" />
                  Back to Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
