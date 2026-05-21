import { EmptyState } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import React from 'react'
import { CardItems, PublicDashGoForm } from '../../components'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { usePublicCatalogQueries } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'
import LoaderGif from '@/assets/gifs/loader.gif'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/utils/format'
import { resolveGiftCardAmount } from '@/utils/giftCardAmount'
import {
  getVendorCardsFromBranches,
  vendorCatalogCardToFeaturedCardProps,
} from '@/features/dashboard/corporate/utils/vendorCardsFromBranches'

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { data: vendorDetailsResponse, isLoading: isLoadingVendor } = usePublicVendorsService(
    vendor_id ? { vendor_id, limit: 500 } : undefined,
    !!vendor_id,
  )

  const vendorDetails = React.useMemo(() => {
    if (!vendorDetailsResponse || !vendor_id) return null

    // Handle both array response and wrapped response
    const vendors = Array.isArray(vendorDetailsResponse)
      ? vendorDetailsResponse
      : (vendorDetailsResponse as any)?.data || []

    // Filter to find the vendor with matching vendor_id
    const vendor = vendors.find((v: any) => String(v.vendor_id || v.id) === vendor_id)

    return vendor || null
  }, [vendorDetailsResponse, vendor_id])

  const [selectedAmount, setSelectedAmount] = React.useState('100')

  const logoUrl = (vendorDetails as any)?.logo || null

  const isLoading = isLoadingVendor

  const quickAmounts = [100, 200, 300, 400, 500]
  // Get available branches for redemption
  const availableBranches = React.useMemo(() => {
    const branches = (vendorDetails as any)?.branches_with_cards || []
    return branches.map((branch: any) => ({
      branch_id: String(branch.branch_id || branch.id),
      branch_name: branch.branch_name || 'Unnamed Branch',
      branch_location: branch.branch_location || '',
    }))
  }, [vendorDetails])

  const catalogCards = React.useMemo(
    () =>
      getVendorCardsFromBranches(vendorDetails, {
        excludeCardTypes: ['dashgo'],
        activeOnly: false,
      }),
    [vendorDetails],
  )

  const branchName = vendorDetails?.business_name || vendorDetails?.vendor_name || ''
  const vendorName = branchName || 'Vendor'

  const vendorDescription =
    'Explore our wide range of gift cards and services. We offer quality products and exceptional customer service to meet all your needs.'


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
      </div>
    )
  }

  if (!vendorDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-[#212529]">Vendor not found</h2>
          <p className="text-grey-500 mb-4">The vendor you're looking for doesn't exist.</p>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="text-primary-500 font-semibold hover:underline"
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-linear-to-br from-[#402d87] to-[#2d1a72] text-white pt-20 pb-12">
        <div className="wrapper">
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <Icon icon="bi:arrow-left" className="size-5" />
            Back to vendors
          </Link>
          <div className="text-center">
            <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight">
              {branchName} (Vendor)
            </h1>
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              <Link to={ROUTES.IN_APP.HOME} className="hover:text-white transition-colors">
                Home
              </Link>
              <Icon icon="bi:chevron-right" className="size-3" />
              <Link to={ROUTES.IN_APP.VENDORS} className="hover:text-white transition-colors">
                Vendor
              </Link>
              <Icon icon="bi:chevron-right" className="size-3" />
              <span className="text-white font-semibold">{branchName}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Featured Gift Card Visual */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[520px] h-[320px] rounded-2xl shadow-xl overflow-hidden">
                <img
                  src={DashGoBg}
                  alt={`${vendorName} background`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    <div className="text-2xl font-black tracking-[0.3em]">DASHGO</div>
                    <div className="text-right text-2xl font-semibold">
                      {selectedAmount.trim()
                        ? formatCurrency(resolveGiftCardAmount(selectedAmount))
                        : 'GHS'}
                    </div>
                  </div>
                  {/* Bottom Section */}
                  <div className="flex items-end justify-between">
                    <div className="text-lg font-semibold uppercase">{vendorName}</div>
                  </div>
                </div>
              </div>
            </div>

            <PublicDashGoForm
              vendor_id={vendor_id}
              vendorName={vendorName}
              vendorDetails={vendorDetails}
              availableBranches={availableBranches}
              quickAmounts={quickAmounts}
              selectedAmount={selectedAmount}
              onAmountChange={setSelectedAmount}
            />
          </div>
        </div>
      </section>

      {/* About Vendor Section */}
      <section className="py-12 bg-linear-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="wrapper">
          <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-6 text-[#212529]">
            About Vendor
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Left - Vendor Logo */}
              <div className="flex justify-center md:justify-start">
                <div className="w-24 h-24 bg-linear-to-br from-[#ffc400] to-[#f0b90b] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={vendorName} className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="bi:gift" className="size-12 text-primary-500" />
                  )}
                </div>
              </div>

              {/* Middle - Vendor Information */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#212529]">{vendorName}</h3>
                <div className="flex items-center gap-2">
                  <Icon icon="bi:star-fill" className="size-5 text-yellow-500" />
                  <span className="font-semibold text-[#212529]">4.5</span>
                </div>
                <p className="text-grey-600 leading-relaxed">{vendorDescription}</p>
              </div>

              {/* Right - Vendor QR Code */}
              <div className="flex justify-center md:justify-end">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  {vendorDetails?.qr_url ? (
                    <QRCodeSVG value={vendorDetails.qr_url} size={128} />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-grey-500 text-sm">
                      QR Code unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preset gift cards (DashX, DashPass, etc.) — DashGo is above */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-2 text-[#212529]">
            Other gift cards ({catalogCards.length}{' '}
            {catalogCards.length === 1 ? 'card' : 'cards'})
          </h2>
          <p className="text-grey-600 mb-8">
            Preset gift cards from this vendor. Use DashGo above to choose your own amount.
          </p>
          {catalogCards.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <EmptyState
                image={EmptyStateImage}
                title="No other gift cards"
                description="This vendor only offers DashGo above. Check back later for DashX or DashPass cards."
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1 max-md:gap-4">
              {catalogCards.map((card) => (
                <CardItems
                  key={card.card_id}
                  {...vendorCatalogCardToFeaturedCardProps(card)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <Link
              to={ROUTES.IN_APP.TERMS_OF_SERVICE}
              className="text-grey-500 font-semibold hover:text-primary-500 transition-colors"
            >
              View terms and conditions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
