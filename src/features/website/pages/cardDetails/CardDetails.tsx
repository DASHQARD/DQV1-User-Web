import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader, Button, DocumentViewer } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { getCardFileUrl, isPdfFile } from '@/utils/cardDisplay'
import { useCardDetails } from '../../hooks'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { CardDetailsGallery } from './components/CardDetailsGallery'
import { CardDetailsDescription } from './components/CardDetailsDescription'
import { CardDetailsQuickFacts } from './components/CardDetailsQuickFacts'
import { CARD_DETAILS_PANEL, formatTermDisplayName, getCardTypeAccent } from './cardDetailsUtils'

const REDEMPTION_STEPS = [
  'Purchase this gift card — it appears in your account.',
  'Visit a redemption location listed on this page.',
  'Show your card QR code or details at checkout.',
  'Your purchase is deducted from the card balance.',
] as const

export default function CardDetails() {
  const navigate = useNavigate()
  const {
    card,
    isLoading,
    redemptionBranches,
    selectedDocument,
    setSelectedDocument,
    selectedImageIndex,
    setSelectedImageIndex,
    lightboxIndex,
    openLightbox,
    closeLightbox,
    getCardTypeName,
    handleAddToCart,
    isAdding,
    lightboxImages,
    displayPrice,
    displayProduct,
    vendorDisplayName,
    priceBreakdown,
    formattedExpiry,
    isPurchasable,
    displayStatus,
  } = useCardDetails()

  const typeLabel = getCardTypeName()
  const { badgeClass } = getCardTypeAccent(card?.type)

  const quickFacts = useMemo(() => {
    if (!card) return []
    const facts: { icon: string; label: string; value: string }[] = []
    if (formattedExpiry) {
      facts.push({ icon: 'bi:calendar-check', label: 'Valid until', value: formattedExpiry })
    }
    facts.push({
      icon: 'bi:currency-exchange',
      label: 'Currency',
      value: card.currency || 'GHS',
    })
    if (redemptionBranches[0]?.branch_name) {
      facts.push({
        icon: 'bi:shop',
        label: 'Branch',
        value: redemptionBranches[0].branch_name,
      })
    }
    return facts
  }, [card, formattedExpiry, redemptionBranches])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Icon icon="bi:credit-card" className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Card not found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            This card may have been removed or the link is incorrect.
          </p>
          <Link
            to={ROUTES.IN_APP.DASHQARDS}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Browse all cards
          </Link>
        </div>
      </div>
    )
  }

  const statusLabel = displayStatus
    ? displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)
    : null
  const currency = card.currency || 'GHS'
  const images = card.images ?? []

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
      <header className="border-b border-gray-200 bg-white">
        <div className="wrapper max-md:px-4 py-2.5 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={ROUTES.IN_APP.DASHQARDS}
              className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-600 hover:text-primary-600 -ml-0.5"
            >
              <Icon icon="bi:chevron-left" className="size-5" />
              Cards
            </Link>
            <p className="text-lg md:text-xl font-extrabold text-gray-900 tabular-nums shrink-0">
              {formatCurrency(displayPrice, currency)}
            </p>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeClass}`}
            >
              {typeLabel}
            </span>
            {statusLabel && (
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  displayStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : displayStatus === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {statusLabel}
              </span>
            )}
          </div>

          <h1 className="mt-1.5 text-lg md:text-2xl font-bold text-gray-900 leading-snug line-clamp-2">
            {displayProduct}
          </h1>

          {vendorDisplayName && card.vendor_id != null && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/vendor?vendor_id=${card.vendor_id}&name=${encodeURIComponent(vendorDisplayName)}`,
                )
              }
              className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
            >
              <Icon icon="bi:shop" className="size-3.5 shrink-0" />
              <span className="truncate">{vendorDisplayName}</span>
              <Icon icon="bi:chevron-right" className="size-3.5 shrink-0 opacity-60" />
            </button>
          )}
        </div>
      </header>

      <div className="wrapper max-md:px-0 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-10">
          {/* Media */}
          <div className="lg:sticky lg:top-6 lg:self-start max-md:px-4">
            <CardDetailsGallery
              displayProduct={displayProduct}
              cardType={card.type}
              typeLabel={typeLabel}
              images={images}
              selectedIndex={selectedImageIndex}
              onSelectIndex={setSelectedImageIndex}
              onOpenLightbox={openLightbox}
              displayPrice={displayPrice}
              currency={currency}
            />
          </div>

          {/* Details */}
          <div className="space-y-5 md:space-y-5 max-md:px-4">
            <CardDetailsQuickFacts facts={quickFacts} priceBreakdown={priceBreakdown} />

            {card.description && <CardDetailsDescription description={card.description} />}

            {redemptionBranches.length > 0 && (
              <section className={CARD_DETAILS_PANEL}>
                <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon icon="bi:geo-alt" className="text-primary-600" />
                  Where to redeem
                </h2>
                <ul className="space-y-3">
                  {redemptionBranches.map((branch) => (
                    <li
                      key={`${branch.branch_name}-${branch.branch_location}`}
                      className="flex gap-3 max-md:py-2 md:rounded-xl md:border md:border-gray-100 md:bg-gray-50 md:p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                        <Icon icon="bi:shop" className="text-primary-600 text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{branch.branch_name}</p>
                        {branch.branch_location && (
                          <p className="mt-0.5 text-sm text-gray-600 flex items-start gap-1">
                            <Icon icon="bi:pin-map" className="size-3.5 shrink-0 mt-0.5" />
                            <span>{branch.branch_location}</span>
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <details
              className={`group overflow-hidden ${CARD_DETAILS_PANEL} max-md:shadow-none`}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 max-md:px-0 max-md:py-0 p-4 md:p-5 font-bold text-gray-900 md:hover:bg-gray-50">
                <span className="flex items-center gap-2 text-base md:text-lg">
                  <Icon icon="bi:card-checklist" className="text-primary-600" />
                  How redemption works
                </span>
                <Icon
                  icon="bi:chevron-down"
                  className="size-5 text-gray-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="max-md:px-0 md:border-t md:border-gray-100 px-4 pb-4 md:px-5 md:pb-5 pt-3 space-y-3">
                <ol className="space-y-3">
                  {REDEMPTION_STEPS.map((text, i) => (
                    <li key={text} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{text}</span>
                    </li>
                  ))}
                </ol>
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.IN_APP.REDEEM)}
                  className="w-full text-primary-600 font-semibold"
                >
                  Go to redemption
                  <Icon icon="bi:arrow-right" className="ml-1" />
                </Button>
              </div>
            </details>

            {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
              <section className={CARD_DETAILS_PANEL}>
                <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3">
                  Terms & conditions
                </h2>
                <ul className="space-y-2">
                  {card.terms_and_conditions.map((term, index) => {
                    const termKey = `term-${term.id ?? term.file_name ?? index}`
                    const termUrl = getCardFileUrl(term.file_url)
                    const termName = formatTermDisplayName(
                      term.file_name || '',
                      index,
                    )
                    const canPreview = Boolean(
                      termUrl && isPdfFile(term.file_url, term.file_name),
                    )

                    return (
                      <li key={termKey}>
                        <button
                          type="button"
                          disabled={!termUrl}
                          onClick={() => {
                            if (!termUrl) return
                            if (canPreview) {
                              setSelectedDocument({ url: termUrl, name: termName })
                              return
                            }
                            window.open(termUrl, '_blank', 'noopener,noreferrer')
                          }}
                          className={`flex w-full items-center gap-3 text-left transition-colors max-md:py-2 md:rounded-xl md:border md:p-3 ${
                            termUrl
                              ? 'md:border-gray-200 md:hover:border-primary-300 md:hover:bg-primary-50/50'
                              : 'md:border-gray-100 md:bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                            <Icon icon="bi:file-earmark-pdf" className="text-lg" />
                          </div>
                          <span className="flex-1 text-sm font-semibold text-gray-900">
                            {termName}
                          </span>
                          {termUrl && (
                            <Icon
                              icon={canPreview ? 'bi:eye' : 'bi:box-arrow-up-right'}
                              className="text-primary-600 shrink-0"
                            />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {!isPurchasable ? (
              <p className="hidden md:block text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                This gift card has expired and is no longer available for purchase.
              </p>
            ) : null}
            <div className="hidden md:flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !isPurchasable}
                className="flex-1 flex items-center justify-center gap-2 min-h-12 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl disabled:opacity-70"
              >
                {isAdding ? (
                  <>
                    <Icon icon="mdi:loading" className="size-5 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <Icon icon="bi:cart-plus" className="size-5" />
                    Add to cart — {formatCurrency(displayPrice, currency)}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                className="px-5 min-h-12 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={closeLightbox}
        index={lightboxIndex >= 0 ? lightboxIndex : 0}
        slides={lightboxImages}
      />

      <DocumentViewer
        isOpen={!!selectedDocument}
        setIsOpen={(open) => {
          if (!open) setSelectedDocument(null)
        }}
        documentUrl={selectedDocument?.url || null}
        documentName={selectedDocument?.name}
      />

      {/* Mobile purchase bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Total</p>
            <p className="text-lg font-extrabold text-gray-900 tabular-nums truncate">
              {formatCurrency(displayPrice, currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || !isPurchasable}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 min-h-11 text-sm font-bold text-white hover:bg-primary-600 disabled:opacity-70"
          >
            {isAdding ? (
              <Icon icon="mdi:loading" className="size-5 animate-spin" />
            ) : !isPurchasable ? (
              'Expired'
            ) : (
              <>
                <Icon icon="bi:cart-plus" className="size-5" />
                Add to cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
