import { Button, SearchBox, Text } from '@/components'
import { Icon } from '@/libs'
import { useMemo, useState, useCallback } from 'react'
import type { PublicCardResponse } from '@/types/cards'
import DashXImage from '@/assets/images/DashX.png'
import DashGoImage from '@/assets/images/DashGo.png'
import DashProImage from '@/assets/images/DashPro.png'
import { CardItems, DashProPurchase, DashGoPurchase } from '../../components'
import { useReducerSpread } from '@/hooks'
import { useCards, useVendorsFilters } from '../../hooks'

const heroImages = {
  pro: DashProImage,
  x: DashXImage,
  go: DashGoImage,
}

const cardTabs = [
  { id: 'dashx', label: 'DashX' },
  { id: 'dashgo', label: 'DashGo' },
  { id: 'dashpro', label: 'DashPro' },
]

const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250+', min: 250, max: null },
]

type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating'

export default function DashQards() {
  const [activeTab, setActiveTab] = useState<'dashx' | 'dashgo' | 'dashpro'>('dashx')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const { limit, min_price, max_price, setMinPrice, setMaxPrice, search, setSearch } =
    useVendorsFilters()
  const { usePublicCardsService } = useCards()
  const { data: cardsResponse } = usePublicCardsService({ limit, search })

  // Filter state
  const [filters, setFilters] = useReducerSpread({
    vendors: [] as string[],
    minRating: null as number | null,
    categories: [] as string[],
  })

  // Get cards from API
  const allCards = useMemo(() => {
    if (!cardsResponse?.data) return []
    // Handle both array and object with data property
    const data = Array.isArray(cardsResponse.data)
      ? cardsResponse.data
      : (cardsResponse.data as any)?.data || []
    return (data as unknown as PublicCardResponse[]) || []
  }, [cardsResponse])

  // Convert API cards to CardItems format
  const convertedCards = useMemo(() => {
    return allCards.map((card) => ({
      id: card.id || card.card_id,
      product: card.product,
      vendor_name: card.vendor_name || '',
      price: card.price,
      currency: card.currency,
      type: card.type as 'DashX' | 'dashpro' | 'dashpass' | 'dashgo',
      rating: card.rating || 0,
      description: card.description,
      images: card.images || [],
      created_at: card.created_at,
      updated_at: card.updated_at,
      expiry_date: card.expiry_date,
      status: card.status,
      is_activated: false,
      fraud_flag: false,
      fraud_notes: null,
      issue_date: card.created_at,
      created_by: null,
      last_modified_by: null,
      vendor_id: card.vendor_id,
      terms_and_conditions: card.terms_and_conditions || [],
    }))
  }, [allCards])

  // DashPro modal state (defined after convertedCards)
  const [showDashProPurchase, setShowDashProPurchase] = useState(false)
  const [selectedDashProCard, setSelectedDashProCard] = useState<(typeof convertedCards)[0] | null>(
    null,
  )

  // Debug logs
  console.log('showDashProPurchase:', showDashProPurchase)
  console.log('selectedDashProCard:', selectedDashProCard)

  // Get available vendors from API cards
  const availableVendors = useMemo(() => {
    const vendorCounts: Record<string, number> = {}
    convertedCards.forEach((card) => {
      const vendor = card.vendor_name || ''
      if (vendor) {
        vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1
      }
    })

    return Object.entries(vendorCounts)
      .map(([vendor, count]) => ({
        value: vendor,
        label: vendor,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [convertedCards])

  // Get available categories (using description or type as category for now)
  const availableCategories = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    convertedCards.forEach((card) => {
      // Use type as category since we don't have a category field
      const category = card.type || ''
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [convertedCards])

  // Filter cards
  const filteredQardsAll = useMemo(() => {
    let filtered = [...convertedCards]

    // Filter by card type (activeTab)
    const normalizedActiveTab = activeTab.toLowerCase()
    filtered = filtered.filter((card) => {
      const cardType = card.type?.toLowerCase() || ''
      return cardType === normalizedActiveTab || cardType === 'dashpass'
    })

    // Filter by vendors
    if (filters.vendors.length > 0) {
      filtered = filtered.filter((card) => filters.vendors.includes(card.vendor_name))
    }

    // Filter by price range
    if (min_price || max_price) {
      filtered = filtered.filter((card) => {
        const price = parseFloat(card.price) || 0
        const min = min_price ? parseFloat(min_price) : 0
        const max = max_price ? parseFloat(max_price) : Infinity
        return price >= min && price <= max
      })
    }

    // Filter by rating
    if (filters.minRating !== null) {
      filtered = filtered.filter((card) => (card.rating || 0) >= filters.minRating!)
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((card) => {
        const cardType = card.type?.toLowerCase() || ''
        return filters.categories.some((cat) => cat.toLowerCase() === cardType)
      })
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((card) => {
        const product = card.product?.toLowerCase() || ''
        const description = card.description?.toLowerCase() || ''
        const vendorName = card.vendor_name?.toLowerCase() || ''
        return (
          product.includes(searchLower) ||
          description.includes(searchLower) ||
          vendorName.includes(searchLower)
        )
      })
    }

    return filtered
  }, [convertedCards, activeTab, filters, min_price, max_price, search])

  // Sort cards
  const sortedQards = useMemo(() => {
    const sorted = [...filteredQardsAll]

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0
          const priceB = parseFloat(b.price) || 0
          return priceA - priceB
        })
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0
          const priceB = parseFloat(b.price) || 0
          return priceB - priceA
        })
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        })
      case 'popular':
      default:
        // Sort by rating first, then by created date
        return sorted.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0)
          if (ratingDiff !== 0) return ratingDiff
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        })
    }
  }, [filteredQardsAll, sortBy])

  // Helper functions
  const getCardTypeCount = useCallback(
    (type: string) => {
      const normalizedType = type.toLowerCase()
      return convertedCards.filter((card) => {
        const cardType = card.type?.toLowerCase() || ''
        return (
          cardType === normalizedType || (normalizedType === 'dashx' && cardType === 'dashpass')
        )
      }).length
    },
    [convertedCards],
  )

  const setPriceRange = useCallback(
    (min: number, max: number | null) => {
      setMinPrice(min.toString())
      setMaxPrice(max !== null ? max.toString() : null)
    },
    [setMinPrice, setMaxPrice],
  )

  const isPriceRangeActive = useCallback(
    (min: number, max: number | null) => {
      const currentMin = min_price ? parseFloat(min_price) : null
      const currentMax = max_price ? parseFloat(max_price) : null
      return currentMin === min && currentMax === max
    },
    [min_price, max_price],
  )

  const clearAllFilters = useCallback(() => {
    setFilters({
      vendors: [],
      minRating: null,
      categories: [],
    })
    setMinPrice(null)
    setMaxPrice(null)
    setSearch(null)
  }, [setFilters, setMinPrice, setMaxPrice, setSearch])

  const onGetCard = useCallback(
    (item: (typeof convertedCards)[0]) => {
      const cardType = item.type?.toLowerCase() || ''

      // DashPro shows DashProPurchase component
      if (cardType === 'dashpro') {
        setSelectedDashProCard(item)
        setShowDashProPurchase(true)
        return
      }

      // Other card types - you can add navigation here if needed
      console.log('Card clicked:', item.product, 'Type:', cardType)
    },
    [setSelectedDashProCard, setShowDashProPurchase],
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="bg-linear-to-br from-primary-500 to-primary-700 text-white pt-20 pb-12"
        style={{ marginTop: '-72px', paddingTop: '88px' }}
      >
        <div className="wrapper">
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 items-center max-md:grid-cols-1 max-md:text-center max-md:gap-8">
            <div className="hero__text">
              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight">
                Give the Gift of Choice
              </h1>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                DashX, DashGo, and DashPro gift qards — perfect for every moment and every budget.
              </p>
              <div className="flex gap-4 flex-wrap max-md:justify-center">
                <Button
                  variant="primary"
                  className="rounded-full! px-6 py-3 font-extrabold shadow-[0_4px_16px_rgba(255,199,10,0.3)] hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(255,199,10,0.4)]!"
                >
                  Browse Qards
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full! px-6 py-3 font-extrabold border-2 border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10!"
                >
                  View Cart
                </Button>
              </div>
            </div>
            <div className="relative h-[260px] max-md:h-[220px]" aria-label="Card brands">
              <div className="absolute top-6 left-0 w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-6deg opacity-85 max-md:w-[220px] max-md:top-[18px]">
                <img
                  src={heroImages.pro}
                  alt="DashPro card"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-1.5 left-14 w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-[4deg] opacity-92 max-md:w-[220px] max-md:left-10 max-md:top-1">
                <img src={heroImages.go} alt="DashGo card" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-11 left-[110px] w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-[-2deg] max-md:w-[220px] max-md:left-[88px] max-md:top-10">
                <img src={heroImages.x} alt="DashX card" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Qards Section */}
      <section id="cards-section" className="py-12 bg-white">
        <div className="wrapper">
          <div className="flex justify-between items-end mb-8 gap-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
            <div>
              <Text variant="h3" weight="bold" className="text-[#212529]">
                All Gift Cards
              </Text>
              <p className="text-base text-grey-500">
                Choose from {filteredQardsAll.length} available gift cards
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search Input */}
              <div className="flex-1 min-w-[200px] max-w-[400px]">
                <SearchBox
                  value={search || ''}
                  onChange={(e) => setSearch(e.target.value || null)}
                  placeholder="Search cards..."
                  className="w-full"
                />
              </div>
              <section className="flex items-center gap-4">
                <div
                  className="flex bg-[#f0f0f0] rounded-lg p-0.5"
                  role="tablist"
                  aria-label="Qard type"
                >
                  {cardTabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id as 'dashx' | 'dashgo' | 'dashpro')}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                        activeTab === tab.id
                          ? 'border-2 border-primary-500 text-primary-500'
                          : 'border-2 border-[#e6e6e6] text-[#3b3b3b] hover:bg-white/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </section>

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

          {/* E-commerce Layout */}
          <div className="grid grid-cols-[280px_1fr] gap-8 items-start max-lg:grid-cols-[260px_1fr] max-md:grid-cols-1 max-md:gap-6">
            {/* Filter Sidebar */}
            <aside className="bg-white border border-[#e6e6e6] rounded-xl sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto max-md:static max-md:max-h-none max-md:overflow-y-visible">
              {/* Filter Header */}
              <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e6e6e6]">
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-[#212529] mb-1">Filter Results</h3>
                  <p className="text-sm text-grey-500 font-medium">
                    {filteredQardsAll.length} cards available
                  </p>
                </div>
              </div>

              {/* Card Type Selection */}
              <div className="border-b border-[#f0f0f0] last:border-b-0">
                <div className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5">
                  <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                    Card Selection
                  </h4>
                  <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon icon="bi:chevron-down" className="size-3.5" />
                  </button>
                </div>
                <div className="px-6 pb-5">
                  <div className="grid gap-2">
                    {cardTabs.map((tab) => (
                      <label
                        key={tab.id}
                        className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          activeTab === tab.id
                            ? 'border-primary-500 bg-primary-500/5'
                            : 'border-[#e6e6e6] bg-white hover:border-primary-500/30 hover:bg-primary-500/2'
                        }`}
                      >
                        <input
                          type="radio"
                          value={tab.id}
                          checked={activeTab === tab.id}
                          onChange={() => setActiveTab(tab.id as 'dashx' | 'dashgo' | 'dashpro')}
                          className="hidden"
                        />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[15px] font-semibold text-[#212529]">
                            {tab.label}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-xl text-xs font-semibold min-w-[24px] text-center transition-all ${
                              activeTab === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-[#f0f0f0] text-grey-500'
                            }`}
                          >
                            {getCardTypeCount(tab.id)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Options */}
              <div className="border-b border-[#f0f0f0] last:border-b-0">
                <div className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5">
                  <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                    Filter Options
                  </h4>
                  <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon icon="bi:chevron-down" className="size-3.5" />
                  </button>
                </div>
                <div>
                  {/* Vendor Filter */}
                  <div className="px-6 pb-5">
                    <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                      <h5 className="text-[15px] font-semibold text-[#212529]">Vendor</h5>
                      <div className="flex items-center gap-2">
                        {filters.vendors.length > 0 && (
                          <span className="text-xs text-primary-500 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-xl">
                            {filters.vendors.length} selected
                          </span>
                        )}
                        <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                          <Icon icon="bi:chevron-down" className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[230px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-[#ddd] scrollbar-track-[#f5f5f5]">
                      <div className="grid gap-2">
                        {availableVendors.map((vendor) => (
                          <label
                            key={vendor.value}
                            className="flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors hover:bg-[#f8f9fa]"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                value={vendor.value}
                                checked={filters.vendors.includes(vendor.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilters({
                                      vendors: [...filters.vendors, vendor.value],
                                    })
                                  } else {
                                    setFilters({
                                      vendors: filters.vendors.filter((v) => v !== vendor.value),
                                    })
                                  }
                                }}
                                className="opacity-0 absolute"
                              />
                              <div
                                className={`w-[18px] h-[18px] border-2 rounded transition-all flex items-center justify-center ${
                                  filters.vendors.includes(vendor.value)
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-[#ddd] bg-white'
                                }`}
                              >
                                {filters.vendors.includes(vendor.value) && (
                                  <span className="text-white text-xs font-bold">✓</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between flex-1">
                              <span className="text-sm font-medium text-[#212529]">
                                {vendor.label}
                              </span>
                              <span className="text-xs text-grey-500 bg-[#f0f0f0] px-2 py-0.5 rounded-lg font-medium">
                                {vendor.count}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                    <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                      <h5 className="text-[15px] font-semibold text-[#212529]">Price Range</h5>
                      <div className="flex items-center gap-2">
                        {(min_price || max_price) && (
                          <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                            Active
                          </span>
                        )}
                        <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                          <Icon icon="bi:chevron-down" className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-end gap-3 mb-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-grey-500 mb-1 uppercase tracking-wider">
                            Minimum
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-grey-500 pointer-events-none">
                              $
                            </span>
                            <input
                              type="number"
                              value={min_price || ''}
                              onChange={(e) => setMinPrice(e.target.value || null)}
                              placeholder="0"
                              min="0"
                              className="w-full pl-7 pr-3 py-2.5 border-2 border-[#e6e6e6] rounded-md text-sm font-medium bg-white transition-colors focus:outline-none focus:border-primary-500 placeholder:text-[#aaa]"
                            />
                          </div>
                        </div>
                        <div className="w-5 h-0.5 bg-[#ddd] mb-3.5 rounded"></div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-grey-500 mb-1 uppercase tracking-wider">
                            Maximum
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-grey-500 pointer-events-none">
                              $
                            </span>
                            <input
                              type="number"
                              value={max_price || ''}
                              onChange={(e) => setMaxPrice(e.target.value || null)}
                              placeholder="1000"
                              min="0"
                              className="w-full pl-7 pr-3 py-2.5 border-2 border-[#e6e6e6] rounded-md text-sm font-medium bg-white transition-colors focus:outline-none focus:border-primary-500 placeholder:text-[#aaa]"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-grey-500 mb-2 uppercase tracking-wider">
                          Quick Select:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {priceRanges.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => setPriceRange(range.min, range.max)}
                              className={`px-3 py-1.5 border rounded-2xl text-xs font-semibold cursor-pointer transition-all ${
                                isPriceRangeActive(range.min, range.max)
                                  ? 'bg-primary-500 text-white border-primary-500 -translate-y-px'
                                  : 'bg-white text-grey-500 border-[#e6e6e6] hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:-translate-y-px'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality & Category Group */}
                <div className="border-b border-[#f0f0f0] last:border-b-0">
                  <div className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5">
                    <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                      Quality & Category
                    </h4>
                    <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                      <Icon icon="bi:chevron-down" className="size-3.5" />
                    </button>
                  </div>
                  <div>
                    {/* Rating Filter */}
                    <div className="px-6 pb-5">
                      <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                        <h5 className="text-[15px] font-semibold text-[#212529]">Minimum Rating</h5>
                        <div className="flex items-center gap-2">
                          {filters.minRating && (
                            <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                              {filters.minRating}+ Stars
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon icon="bi:chevron-down" className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <label
                            key={rating}
                            className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all border-2 ${
                              filters.minRating === rating
                                ? 'bg-primary-500/5 border-primary-500/20'
                                : 'border-transparent hover:bg-[#f8f9fa]'
                            }`}
                          >
                            <input
                              type="radio"
                              value={rating}
                              checked={filters.minRating === rating}
                              onChange={(e) =>
                                setFilters({
                                  minRating: e.target.checked ? rating : null,
                                })
                              }
                              className="hidden"
                            />
                            <div className="flex items-center gap-2.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, n) => {
                                  const starNumber = n + 1
                                  return (
                                    <Icon
                                      key={starNumber}
                                      icon={starNumber <= rating ? 'bi:star-fill' : 'bi:star'}
                                      className={`size-3.5 ${
                                        starNumber <= rating ? 'text-yellow-500' : 'text-[#ddd]'
                                      }`}
                                    />
                                  )
                                })}
                              </div>
                              <span className="text-sm font-medium text-[#212529]">
                                {rating}+ Stars
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                      <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                        <h5 className="text-[15px] font-semibold text-[#212529]">Category</h5>
                        <div className="flex items-center gap-2">
                          {filters.categories.length > 0 && (
                            <span className="text-xs text-primary-500 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-xl">
                              {filters.categories.length} selected
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon icon="bi:chevron-down" className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[230px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-[#ddd] scrollbar-track-[#f5f5f5]">
                        <div className="grid gap-2">
                          {availableCategories.map((category) => (
                            <label
                              key={category.value}
                              className="flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors hover:bg-[#f8f9fa]"
                            >
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  value={category.value}
                                  checked={filters.categories.includes(category.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters({
                                        categories: [...filters.categories, category.value],
                                      })
                                    } else {
                                      setFilters({
                                        categories: filters.categories.filter(
                                          (c) => c !== category.value,
                                        ),
                                      })
                                    }
                                  }}
                                  className="opacity-0 absolute"
                                />
                                <div
                                  className={`w-[18px] h-[18px] border-2 rounded transition-all flex items-center justify-center ${
                                    filters.categories.includes(category.value)
                                      ? 'bg-primary-500 border-primary-500'
                                      : 'border-[#ddd] bg-white'
                                  }`}
                                >
                                  {filters.categories.includes(category.value) && (
                                    <span className="text-white text-xs font-bold">✓</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between flex-1">
                                <span className="text-sm font-medium text-[#212529]">
                                  {category.label}
                                </span>
                                <span className="text-xs text-grey-500 bg-[#f0f0f0] px-2 py-0.5 rounded-lg font-medium">
                                  {category.count}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Footer */}
                <div className="p-4 border-t border-[#e6e6e6] bg-[#f8f9fa]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-grey-500 font-medium">
                      {filters.vendors.length + filters.categories.length} filters active
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 text-xs text-grey-500 bg-white border border-[#ddd] cursor-pointer font-semibold px-3 py-1.5 rounded-2xl transition-all hover:bg-grey-500 hover:text-white hover:border-grey-500"
                    >
                      <Icon icon="bi:arrow-counterclockwise" className="size-3" />
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Main */}
            <main>
              <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <span className="text-base font-bold text-[#212529]">
                    {filteredQardsAll.length} Results
                  </span>
                  {(filters.vendors.length > 0 ||
                    filters.categories.length > 0 ||
                    min_price ||
                    max_price ||
                    filters.minRating ||
                    search) && (
                    <div className="flex flex-wrap gap-2">
                      {filters.vendors.map((filter) => (
                        <span
                          key={filter}
                          className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold"
                        >
                          {filter}
                          <button
                            onClick={() =>
                              setFilters({
                                vendors: filters.vendors.filter((v) => v !== filter),
                              })
                            }
                            className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                          >
                            <Icon icon="bi:x" className="size-3" />
                          </button>
                        </span>
                      ))}
                      {filters.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold"
                        >
                          {category}
                          <button
                            onClick={() =>
                              setFilters({
                                categories: filters.categories.filter((c) => c !== category),
                              })
                            }
                            className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                          >
                            <Icon icon="bi:x" className="size-3" />
                          </button>
                        </span>
                      ))}
                      {search && (
                        <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                          Search: "{search}"
                          <button
                            onClick={() => setSearch(null)}
                            className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                          >
                            <Icon icon="bi:x" className="size-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {activeTab === 'dashpro' ? (
                <div className="w-full">
                  <DashProPurchase />
                </div>
              ) : activeTab === 'dashgo' ? (
                <div className="w-full">
                  <DashGoPurchase />
                </div>
              ) : filteredQardsAll.length === 0 ? (
                <div className="text-center py-20 px-5 text-grey-500">
                  <div className="text-5xl text-[#ccc] mb-4">
                    <Icon icon="bi:search" className="size-12 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#212529] mb-2">No gift cards found</h3>
                  <p className="text-base mb-6">Try adjusting your filters or search criteria</p>
                  <Button variant="outline" onClick={clearAllFilters} className="!rounded-full">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1 max-md:gap-4">
                    {sortedQards
                      .filter((card) => card.type?.toLowerCase() !== 'dashpro')
                      .map((card) => (
                        <CardItems key={card.id} {...card} onGetQard={() => onGetCard(card)} />
                      ))}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
