import { useState, useMemo } from 'react'
import { EmptyState } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { CardItems, PublicDashGoForm } from '../../components'
import { VendorLogoImage } from '../../components/VendorLogo/VendorLogoImage'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useVendorProfilePage } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'
import { Loader } from '@/components'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/utils/format'
import { resolveGiftCardAmount } from '@/utils/giftCardAmount'
import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import {
  getVendorCardsFromBranches,
  vendorCatalogCardToFeaturedCardProps,
} from '@/features/dashboard/corporate/utils/vendorCardsFromBranches'
import {
  VENDOR_DASHGO_SECTION,
  VENDOR_PROFILE_PANEL,
  VENDOR_PROFILE_WRAPPER,
} from './vendorProfileUtils'

const QUICK_AMOUNTS = [100, 200, 300, 400, 500] as const

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { vendor, displayName, isLoading } = useVendorProfilePage(vendor_id)
  const [selectedAmount, setSelectedAmount] = useState('100')

  const availableBranches = useMemo(() => {
    const branches = vendor?.branches_with_cards ?? []
    return branches.map((branch) => ({
      branch_id: String(branch.branch_id ?? ''),
      branch_name: formatCardDisplayTitle(branch.branch_name || 'Unnamed Branch'),
      branch_location: branch.branch_location || '',
    }))
  }, [vendor])

  const catalogCards = useMemo(
    () =>
      getVendorCardsFromBranches(vendor, {
        excludeCardTypes: ['dashgo'],
        activeOnly: false,
      }),
    [vendor],
  )

  const locationLabel =
    vendor?.business_country?.trim() ||
    availableBranches[0]?.branch_location?.trim() ||
    null

  const displayAmount = formatCurrency(resolveGiftCardAmount(selectedAmount))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vendor not found</h2>
          <p className="text-gray-500 mb-6 text-sm">
            This vendor may have been removed or the link is incorrect.
          </p>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-12">
      <header className="border-b border-gray-200 bg-white">
        <div className={`${VENDOR_PROFILE_WRAPPER} py-2.5 md:py-5`}>
          <div className="flex items-start gap-3">
            <Link
              to={ROUTES.IN_APP.VENDORS}
              className="inline-flex items-center gap-0.5 text-sm font-medium text-gray-600 hover:text-primary-600 shrink-0 mt-1 -ml-0.5"
            >
              <Icon icon="bi:chevron-left" className="size-5" />
              <span className="hidden sm:inline">Vendors</span>
            </Link>

            <div className="flex flex-1 items-start gap-3 min-w-0">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                <VendorLogoImage
                  vendor={vendor}
                  name={displayName}
                  className="h-full w-full object-cover"
                  iconClassName="size-6 text-primary-600"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 inline-flex rounded-md px-2 py-0.5 mb-1">
                  DashGo available
                </p>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug truncate">
                  {displayName}
                </h1>
                {locationLabel && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                    <Icon icon="bi:geo-alt" className="size-3.5 shrink-0" />
                    <span className="truncate">{locationLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`${VENDOR_PROFILE_WRAPPER} py-5 md:py-8 space-y-8 md:space-y-10`}>
        {/* DashGo */}
        <section className={VENDOR_DASHGO_SECTION}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-0 lg:items-stretch">
            <div className="relative w-full aspect-[16/10] sm:aspect-[5/3] max-lg:rounded-2xl max-lg:shadow-md max-lg:overflow-hidden lg:aspect-auto lg:min-h-[min(380px,50vh)]">
              <img
                src={DashGoBg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between text-white">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-base font-black tracking-[0.2em]">DASHGO</span>
                  <span className="rounded-lg bg-black/40 backdrop-blur-sm px-3 py-1.5 text-right">
                    <span className="block text-xl font-extrabold leading-none tabular-nums">
                      {displayAmount}
                    </span>
                  </span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide truncate">
                  {displayName}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8 max-lg:pt-0 border-t border-gray-100 lg:border-t-0 lg:border-l lg:border-gray-100">
              <PublicDashGoForm
                vendor_id={vendor_id}
                vendorName={displayName}
                vendorDetails={vendor}
                availableBranches={availableBranches}
                quickAmounts={[...QUICK_AMOUNTS]}
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>
          </div>
        </section>

        {/* Other cards */}
        <section>
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">
              Other gift cards
              {catalogCards.length > 0 && (
                <span className="text-gray-500 font-semibold"> ({catalogCards.length})</span>
              )}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Preset DashX and DashPass cards from {displayName}. Use DashGo above for a custom
              amount.
            </p>
          </div>

          {catalogCards.length === 0 ? (
            <EmptyState
              image={EmptyStateImage}
              title="No preset cards yet"
              description="This vendor currently offers DashGo only. Check back later for more card types."
            />
          ) : (
            <>
              <div
                className="md:hidden flex gap-3 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Vendor gift cards carousel"
              >
                {catalogCards.map((card, index) => (
                  <div
                    key={String(card.card_id ?? index)}
                    className="snap-start shrink-0 w-[min(288px,calc(100vw-32px))]"
                  >
                    <CardItems
                      {...vendorCatalogCardToFeaturedCardProps(card)}
                      density="compact"
                    />
                  </div>
                ))}
              </div>

              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {catalogCards.map((card, index) => (
                  <CardItems
                    key={String(card.card_id ?? index)}
                    {...vendorCatalogCardToFeaturedCardProps(card)}
                    density="compact"
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* About — desktop panel only; mobile inline */}
        <section className={VENDOR_PROFILE_PANEL}>
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">About this vendor</h2>
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="flex-1 space-y-2 text-sm text-gray-600">
              {vendor.vendor_name && vendor.vendor_name !== vendor.business_name && (
                <p>
                  <span className="font-medium text-gray-900">Contact: </span>
                  {formatCardDisplayTitle(vendor.vendor_name)}
                </p>
              )}
              {availableBranches.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900 mb-1">Branches</p>
                  <ul className="space-y-1">
                    {availableBranches.map((branch) => (
                      <li key={branch.branch_id} className="flex items-start gap-1.5">
                        <Icon icon="bi:shop" className="size-3.5 shrink-0 mt-0.5 text-primary-600" />
                        <span>
                          {branch.branch_name}
                          {branch.branch_location ? ` · ${branch.branch_location}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {vendor.qr_url && (
              <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <QRCodeSVG value={vendor.qr_url} size={112} />
                </div>
                <p className="text-xs text-gray-500">Vendor QR</p>
              </div>
            )}
          </div>
        </section>

        <p className="text-center md:text-left text-sm">
          <Link
            to={ROUTES.IN_APP.TERMS_OF_SERVICE}
            className="font-medium text-gray-500 hover:text-primary-600"
          >
            Terms & conditions
          </Link>
        </p>
      </div>
    </div>
  )
}
