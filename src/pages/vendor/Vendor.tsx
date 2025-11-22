import { Button } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import React, { useMemo, useCallback } from 'react'
import { allQards } from '@/mocks/featuredCards'
import { CardItems } from '../home/components/CardItems'
import type { FeaturedCardProps } from '@/types'
import DashXImage from '@/assets/images/DashX.png'

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating'
type ViewMode = 'grid' | 'list'

// Vendor data - in a real app, this would come from props or API
const vendorData = {
  name: 'Melcom Ghana Ltd',
  location: 'Hoatso Branch • Accra, Ghana',
  rating: 4.5,
  reviews: 1248,
  qardsCount: 30,
  vendorId: '1A234D2',
  description:
    "Ghana's leading retail chain offering quality products at affordable prices since 1989.",
  story:
    'Melcom Ghana Limited is a leading retail chain in Ghana, established with the vision of providing quality products at affordable prices. We serve thousands of customers daily across our nationwide network of stores.',
  categories: [
    { icon: 'bi:tv', label: 'Electronics' },
    { icon: 'bi:house', label: 'Home & Living' },
    { icon: 'bi:person-circle', label: 'Fashion' },
    { icon: 'bi:cart', label: 'Daily Essentials' },
  ],
  storeDetails: {
    location: 'Hoatso Junction, Accra - Greater Accra Region',
    hours: 'Mon - Sat: 8:00 AM - 9:00 PM\nSunday: 10:00 AM - 7:00 PM',
    contact: '+233 30 2740000\ninfo@melcomghana.com',
  },
}

const presetAmounts = [50, 100, 200, 500, 1000]

export default function Vendor() {
  const navigate = useNavigate()
  const [selectedAmount, setSelectedAmount] = React.useState(100)
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [sortBy, setSortBy] = React.useState<SortOption>('popular')
  const [displayedItems, setDisplayedItems] = React.useState(8)

  // Filter cards for this vendor (Melcom)
  const vendorQards = useMemo(() => {
    const filtered = allQards.filter(
      (card) => card.subtitle?.toUpperCase() === vendorData.name.toUpperCase(),
    )
    // If no vendor-specific cards found, show all cards as fallback
    return filtered.length > 0 ? filtered : allQards
  }, [])

  // Generate QR code URLs
  const vendorProfileUrl = `${window.location.origin}/vendor?id=melcom-ghana-ltd`
  const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vendorProfileUrl)}&bgcolor=FFFFFF&color=402D87&margin=10&format=png`
  const featuredCardQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('melcom-plus-gift-qard')}&bgcolor=FFFFFF&color=402D87`

  const sortedQards = useMemo(() => {
    const cards = [...vendorQards]

    let sortedCards: FeaturedCardProps[]
    switch (sortBy) {
      case 'price-low':
        sortedCards = cards.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        sortedCards = cards.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating':
        sortedCards = cards.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        sortedCards = [...cards].reverse()
        break
      case 'popular':
      default:
        sortedCards = cards.sort((a, b) => b.reviews - a.reviews)
        break
    }

    return sortedCards.slice(0, displayedItems)
  }, [vendorQards, sortBy, displayedItems])

  const roundedRating = Math.round(vendorData.rating)

  const addToCart = useCallback(() => {
    console.log('Adding to cart:', {
      amount: selectedAmount,
      item: 'Melcom Plus Gift Qard',
      vendor: vendorData.name,
    })
    navigate('/cart')
  }, [selectedAmount, navigate])

  const buyNow = useCallback(() => {
    console.log('Buy now:', {
      amount: selectedAmount,
      item: 'Melcom Plus Gift Qard',
    })
    navigate('/cart')
  }, [selectedAmount, navigate])

  const onGetQard = useCallback(
    (item: FeaturedCardProps) => {
      console.log('Get Qard clicked:', item.title)
      navigate(`/gift-card?vendor=melcom&card=${encodeURIComponent(item.title)}`)
    },
    [navigate],
  )

  const loadMoreItems = useCallback(() => {
    setDisplayedItems((prev) => Math.min(prev + 8, vendorQards.length))
  }, [vendorQards.length])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white pt-20 pb-6">
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
            <span className="text-white font-semibold">{vendorData.name}</span>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-6 max-md:flex-col max-md:text-center max-md:gap-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/15 rounded-[20px] flex items-center justify-center backdrop-blur-[10px] border-2 border-white/20">
                <Icon icon="bi:shop" className="size-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-[clamp(24px,4vw,36px)] font-extrabold mb-2 leading-tight">
                {vendorData.name}
              </h1>
              <p className="text-base mb-4 opacity-90">{vendorData.location}</p>
              <div className="flex items-center gap-4 flex-wrap max-md:justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, n) => {
                      const starNumber = n + 1
                      return (
                        <Icon
                          key={starNumber}
                          icon={starNumber <= roundedRating ? 'bi:star-fill' : 'bi:star'}
                          className="size-3.5"
                        />
                      )
                    })}
                    <strong className="ml-1 text-white">{vendorData.rating}</strong>
                  </div>
                  <span className="opacity-80">
                    ({vendorData.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="w-px h-5 bg-white/30"></div>
                <div className="text-sm">
                  <strong>{vendorData.qardsCount}</strong> Qards available
                </div>
                <div className="w-px h-5 bg-white/30"></div>
                <div className="text-sm">
                  ID: <strong>#{vendorData.vendorId}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gift Card Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="text-center mb-12">
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold mb-2 text-[#212529]">
              Featured Gift Card
            </h2>
            <p className="text-lg text-grey-500">Most popular choice from this vendor</p>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-12 items-center max-lg:grid-cols-1 max-lg:gap-8">
            {/* Left: Card Visual */}
            <div className="relative">
              <div className="relative rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.02] [transform:perspective(1000px)_rotateY(-5deg)_rotateX(5deg)] hover:[transform:perspective(1000px)_rotateY(-2deg)_rotateX(2deg)]">
                <img src={DashXImage} alt="Melcom Plus Gift Qard" className="w-full h-auto block" />
                <div className="absolute inset-0 flex justify-between items-start p-5">
                  <div className="text-sm font-extrabold text-white opacity-90 tracking-wider">
                    DASHQARD
                  </div>
                  <div>
                    <img
                      src={featuredCardQrCode}
                      alt="QR Code"
                      className="w-[60px] h-[60px] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details and Purchase */}
            <div>
              <div className="mb-6">
                <h3 className="text-[clamp(24px,3vw,32px)] font-extrabold mb-4 text-[#212529]">
                  Melcom Plus Gift Qard
                </h3>
                <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                  <div>
                    <span className="block text-sm text-grey-500 mb-1">Starting from</span>
                    <span className="text-[28px] font-extrabold text-primary-500">GHS 50.00</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="flex items-center gap-1.5 text-sm text-grey-500">
                      <Icon icon="bi:heart-fill" className="size-4 text-[#e91e63]" />
                      <strong className="text-[#212529]">2.1k</strong> likes
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-grey-500">
                      <Icon icon="bi:bag-check-fill" className="size-4 text-[#2196f3]" />
                      <strong className="text-[#212529]">856</strong> sold
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-base leading-relaxed text-grey-500 mb-8">
                Perfect for shopping at Melcom stores across Ghana. Use for electronics, home
                appliances, fashion, and daily essentials. Valid for 12 months from purchase date.
              </p>

              <div>
                <div className="mb-6">
                  <label className="block font-bold text-[#212529] mb-3">Select Amount</label>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setSelectedAmount(preset)}
                        className={`px-4 py-2 border-2 rounded-[50px] font-semibold transition-all ${
                          selectedAmount === preset
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-[#e6e6e6] bg-white text-grey-500 hover:border-primary-500 hover:bg-primary-500 hover:text-white'
                        }`}
                      >
                        GHS {preset}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center border-2 border-[#e6e6e6] rounded-xl px-4 py-3 bg-white transition-colors focus-within:border-primary-500">
                    <span className="font-extrabold text-primary-500 mr-2">GHS</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min="50"
                      max="5000"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(Number(e.target.value) || 50)}
                      placeholder="Enter custom amount"
                      className="flex-1 border-none outline-none font-semibold text-base placeholder:text-[#aaa]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                  <Button
                    variant="primary"
                    onClick={addToCart}
                    className="!rounded-[50px] px-7 py-3.5 text-base font-bold shadow-[0_4px_16px_rgba(64,45,135,0.3)] hover:bg-primary-700 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(64,45,135,0.4)]"
                  >
                    <Icon icon="bi:cart-plus" className="size-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={buyNow}
                    className="!rounded-[50px] px-7 py-3.5 text-base font-bold bg-yellow-500 text-[#212529] shadow-[0_4px_16px_rgba(255,199,10,0.3)] hover:bg-[#e6b800] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(255,199,10,0.4)]"
                  >
                    <Icon icon="bi:lightning-charge-fill" className="size-4" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Vendor Section */}
      <section className="py-12 bg-gradient-to-br from-[#fafafa] to-[#f5f5f5]">
        <div className="wrapper">
          <div className="text-center mb-12">
            <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-3 text-[#212529]">
              About {vendorData.name}
            </h2>
            <p className="text-lg text-grey-500">{vendorData.description}</p>
          </div>

          <div className="grid grid-cols-[2fr_1fr] gap-12 items-start max-lg:grid-cols-1 max-lg:gap-8">
            <div>
              <div className="grid gap-8">
                {/* Our Story */}
                <div>
                  <h4 className="text-xl font-bold mb-4 text-[#212529]">Our Story</h4>
                  <p className="leading-relaxed text-grey-500">{vendorData.story}</p>
                </div>

                {/* What We Offer */}
                <div>
                  <h4 className="text-xl font-bold mb-4 text-[#212529]">What We Offer</h4>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mt-4">
                    {vendorData.categories.map((category) => (
                      <div
                        key={category.label}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
                      >
                        <Icon icon={category.icon} className="size-6 text-primary-500" />
                        <span className="font-semibold text-[#212529]">{category.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Store Information */}
                <div>
                  <h4 className="text-xl font-bold mb-4 text-[#212529]">Store Information</h4>
                  <div className="grid gap-6">
                    <div className="flex gap-4 items-start">
                      <Icon icon="bi:geo-alt-fill" className="size-5 text-primary-500 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-[#212529] mb-1">Location</strong>
                        <p className="text-grey-500 leading-relaxed">
                          {vendorData.storeDetails.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <Icon icon="bi:clock-fill" className="size-5 text-primary-500 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-[#212529] mb-1">
                          Operating Hours
                        </strong>
                        <p className="text-grey-500 leading-relaxed whitespace-pre-line">
                          {vendorData.storeDetails.hours}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <Icon icon="bi:telephone-fill" className="size-5 text-primary-500 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-[#212529] mb-1">Contact</strong>
                        <p className="text-grey-500 leading-relaxed whitespace-pre-line">
                          {vendorData.storeDetails.contact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div>
              <div className="bg-white p-8 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-center">
                <h4 className="text-lg font-bold mb-2 text-[#212529]">Quick Access</h4>
                <p className="text-grey-500 mb-6">Scan to visit vendor profile</p>
                <div>
                  <img
                    src={qrCode}
                    alt="Vendor QR code"
                    className="w-[140px] h-[140px] rounded-xl mx-auto"
                  />
                </div>
              </div>
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
                Choose from {vendorQards.length} available gift cards
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
            {sortedQards.map((card, idx) => (
              <CardItems key={idx} {...card} onGetQard={() => onGetQard(card)} />
            ))}
          </div>

          <div className="flex justify-between items-center mt-12 gap-4 max-md:flex-col">
            <div className="text-sm text-grey-500">
              Showing {Math.min(displayedItems, vendorQards.length)} of {vendorQards.length} gift
              cards
            </div>
            {displayedItems < vendorQards.length && (
              <button
                onClick={loadMoreItems}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white border-none rounded-[50px] font-bold cursor-pointer transition-all hover:bg-primary-700 hover:-translate-y-px"
              >
                <Icon icon="bi:plus-circle" className="size-4" />
                Load More ({vendorQards.length - displayedItems} remaining)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Terms and Support Section */}
      <section className="py-12 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="wrapper">
          <div className="grid grid-cols-3 gap-8 mb-12 max-md:grid-cols-1 max-md:gap-6">
            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="bi:shield-check" className="size-7 text-white" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-[#212529]">Secure & Trusted</h4>
              <p className="text-grey-500 leading-relaxed">
                All transactions are encrypted and secure. Your gift cards are protected.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="bi:clock-history" className="size-7 text-white" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-[#212529]">Instant Delivery</h4>
              <p className="text-grey-500 leading-relaxed">
                Receive your digital gift card immediately after successful payment.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
