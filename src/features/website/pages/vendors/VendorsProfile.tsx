import { Loader, Button, Text, Input } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import React from 'react'
import { CardItems } from '../../components'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useCards, usePublicVendors } from '../../hooks'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '@/stores/cart'
import { useForm } from 'react-hook-form'

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating'
type ViewMode = 'grid' | 'list'

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { data: vendorDetailsResponse, isLoading: isLoadingVendor } = usePublicVendors()
  const vendorDetails = vendorDetailsResponse?.data?.[0]
  console.log('vendorDetails', vendorDetails)
  const { usePublicVendorCardsService } = useCards()
  const { data: vendorCardsResponse } = usePublicVendorCardsService(vendor_id || '')
  const vendorCards = vendorCardsResponse?.data || []
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()

  // Get featured card - prioritize DashGo card, otherwise use first card
  const featuredCard = React.useMemo(() => {
    if (vendorCards.length === 0) return null
    // Find first DashGo card
    const dashGoCard = vendorCards.find((card: any) => card.type?.toLowerCase() === 'dashgo')
    // Return DashGo card if found, otherwise return first card
    return dashGoCard || vendorCards[0]
  }, [vendorCards])

  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '',
    },
  })

  const onSubmit = async (data: { amount: string }) => {
    if (!featuredCard) return

    const cardAmount = data.amount ? parseFloat(data.amount) : parseFloat(featuredCard.price)
    if (isNaN(cardAmount) || cardAmount <= 0) {
      return
    }

    await addToCartAsync({
      card_id: featuredCard.card_id,
      amount: cardAmount,
      quantity: 1,
    })
    openCart()
  }

  // State variables
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [sortBy, setSortBy] = React.useState<SortOption>('popular')

  // Get vendor details
  const branchName = vendorDetails?.branch_name || ''
  const vendorName = branchName || 'Vendor'
  const vendorDescription =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

  // Generate QR code URLs
  const vendorProfileUrl = `${window.location.origin}/vendor?vendor_id=${vendor_id}&name=${encodeURIComponent(branchName)}`
  const vendorQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vendorProfileUrl)}&bgcolor=FFFFFF&color=402D87&margin=10&format=png`
  // const featuredCardQrCode = featuredCard
  //   ? `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${featuredCard.product}-${featuredCard.id}`)}&bgcolor=FFFFFF&color=402D87&margin=0`
  //   : ''

  // Get card background based on type

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
      {/* Header Section */}
      <section className="bg-linear-to-br from-[#402d87] to-[#2d1a72] text-white pt-20 pb-12">
        <div className="wrapper">
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
                      {featuredCard?.currency || 'GHS'}{' '}
                      {featuredCard ? parseFloat(featuredCard.price).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  {/* Bottom Section */}
                  <div className="flex items-end justify-between">
                    <div className="text-lg font-semibold uppercase">{vendorName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Card Details and Actions */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-1">
                <Text variant="h1" className="capitalize">
                  {featuredCard?.product || vendorName} Gift Qard
                </Text>
                <Text variant="p" className="text-grey-500">
                  Vendor: {vendorName}
                </Text>
                <div className="flex items-center gap-1">
                  <Icon icon="bi:geo-alt-fill" className="size-4 text-grey-500" />
                  <Text variant="p" className="text-grey-500">
                    {vendorDetails?.branch_location || 'Location not available'}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Text variant="h2" className="capitalize">
                  Description
                </Text>
                <Text variant="p" className="text-grey-600 leading-relaxed">
                  {featuredCard?.description || vendorDescription}
                </Text>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                    {featuredCard?.currency || 'GHS'}
                  </span>
                  <Input
                    type="number"
                    {...form.register('amount')}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    error={form.formState.errors.amount?.message}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  type="submit"
                  disabled={isAdding || !featuredCard}
                  loading={isAdding}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
              </div>
            </form>
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
              {/* Left - Vendor Icon */}
              <div className="flex justify-center md:justify-start">
                <div className="w-24 h-24 bg-linear-to-br from-[#ffc400] to-[#f0b90b] rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon icon="bi:gift" className="size-12 text-primary-500" />
                </div>
              </div>

              {/* Middle - Vendor Information */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#212529]">{vendorName}</h3>
                <div className="flex items-center gap-2">
                  <Icon icon="bi:star-fill" className="size-5 text-yellow-500" />
                  <span className="font-semibold text-[#212529]">4.5</span>
                </div>
                <p className="text-sm text-grey-500">[Vendor ID here]</p>
                <p className="text-grey-600 leading-relaxed">{vendorDescription}</p>
              </div>

              {/* Right - Vendor QR Code */}
              <div className="flex justify-center md:justify-end">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <img src={vendorQrCode} alt="Vendor QR Code" className="w-32 h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qards from vendor Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="flex justify-between items-end mb-8 gap-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
            <div>
              <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-2 text-[#212529]">
                Qards from vendor ({vendorCards.length} Qards)
              </h2>
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
            {vendorCards.map((card: any, idx: number) => (
              <CardItems
                key={idx}
                {...card}
                type={(card.type as 'dashpro' | 'dashpass' | 'dashgo' | 'DashX') || 'DashX'}
              />
            ))}
          </div>

          {/* Load More and Terms */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <button className="text-primary-500 font-semibold hover:text-primary-700 transition-colors">
              Load More
            </button>
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
