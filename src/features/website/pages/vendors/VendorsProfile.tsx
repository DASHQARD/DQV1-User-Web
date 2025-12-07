import { Loader } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import React from 'react'
import { CardItems } from '../../components'

// import { useGetVendorCards } from '@/features/admin/hooks'
import { usePublicVendors } from '../../hooks'
import { useGetVendorCards } from '@/features/admin/hooks'

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating'
type ViewMode = 'grid' | 'list'

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { data: vendorDetailsResponse, isLoading: isLoadingVendor } = usePublicVendors()
  const vendorDetails = vendorDetailsResponse?.data
  const { data: vendorCards = [] } = useGetVendorCards(vendor_id || '')

  // State variables
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [sortBy, setSortBy] = React.useState<SortOption>('popular')

  // Get vendor details - VendorDetailsResponse.data is a single Vendor object
  const branchName = vendorDetails?.branch_name || ''
  const branchLocation = vendorDetails?.branch_location || ''

  // Generate QR code URLs
  // const vendorProfileUrl = `${window.location.origin}/vendor?id=${id}${name ? `&name=${encodeURIComponent(name)}` : ''}`
  // const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vendorProfileUrl)}&bgcolor=FFFFFF&color=402D87&margin=10&format=png`
  // const featuredCardQrCode = featuredCard
  //   ? `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(featuredCard.title)}&bgcolor=FFFFFF&color=402D87`
  //   : ''

  if (isLoadingVendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
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
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-500 to-primary-700 text-white pt-20 pb-6">
        <div className="wrapper">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link
              to={ROUTES.IN_APP.HOME}
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Icon icon="bi:chevron-right" className="size-3 text-white/60" />
            <Link
              to={ROUTES.IN_APP.VENDORS}
              className="text-white/80 hover:text-white transition-colors"
            >
              Vendors
            </Link>
            <Icon icon="bi:chevron-right" className="size-3 text-white/60" />
            <span className="text-white font-semibold">{branchName}</span>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-6 max-md:flex-col max-md:text-center max-md:gap-4">
            <div className="shrink-0">
              <div className="w-20 h-20 bg-white/15 rounded-[20px] flex items-center justify-center backdrop-blur-[10px] border-2 border-white/20">
                <Icon icon="bi:shop" className="size-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-[clamp(24px,4vw,36px)] font-extrabold mb-2 leading-tight">
                {branchName}
              </h1>
              <p className="text-base mb-4 opacity-90">
                {branchName && branchLocation
                  ? `${branchName} • ${branchLocation}`
                  : branchLocation}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Qards from Vendor Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="flex justify-between items-end mb-8 gap-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
            <div>
              <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-2 text-[#212529]">
                All Gift Cards
              </h2>
              <p className="text-base text-grey-500">
                Choose from {vendorCards.length} available gift cards
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex bg-[#f0f0f0] rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'bg-transparent text-grey-500 hover:bg-white/50'
                  }`}
                >
                  <Icon icon="bi:grid-3x3-gap" className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'bg-transparent text-grey-500 hover:bg-white/50'
                  }`}
                >
                  <Icon icon="bi:list" className="size-4" />
                </button>
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border-2 border-[#e6e6e6] rounded-lg bg-white font-semibold text-[#212529] cursor-pointer transition-colors focus:outline-none focus:border-primary-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1 max-md:gap-4'
                : 'flex flex-col gap-4'
            }`}
          >
            {vendorCards.map((card, idx) => (
              <CardItems
                key={idx}
                {...card}
                type={(card.type as 'dashpro' | 'dashpass' | 'dashgo' | 'DashX') || 'DashX'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Terms and Support Section */}
      <section className="py-12 bg-linear-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="wrapper">
          <div className="grid grid-cols-3 gap-8 mb-12 max-md:grid-cols-1 max-md:gap-6">
            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="bi:shield-check" className="size-7 text-white" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-[#212529]">Secure & Trusted</h4>
              <p className="text-grey-500 leading-relaxed">
                All transactions are encrypted and secure. Your gift cards are protected.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="bi:clock-history" className="size-7 text-white" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-[#212529]">Instant Delivery</h4>
              <p className="text-grey-500 leading-relaxed">
                Receive your digital gift card immediately after successful payment.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="bi:headset" className="size-7 text-white" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-[#212529]">24/7 Support</h4>
              <p className="text-grey-500 leading-relaxed">
                Our customer service team is always ready to help you.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-8 flex-wrap">
            <Link
              to={ROUTES.IN_APP.TERMS_OF_SERVICE}
              className="text-grey-500 font-semibold transition-colors hover:text-primary-500"
            >
              Terms & Conditions
            </Link>
            <Link
              to={ROUTES.IN_APP.PRIVACY_POLICY}
              className="text-grey-500 font-semibold transition-colors hover:text-primary-500"
            >
              Privacy Policy
            </Link>
            <Link
              to={ROUTES.IN_APP.FAQ}
              className="text-grey-500 font-semibold transition-colors hover:text-primary-500"
            >
              FAQ
            </Link>
            <Link
              to={ROUTES.IN_APP.CONTACT}
              className="text-grey-500 font-semibold transition-colors hover:text-primary-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
