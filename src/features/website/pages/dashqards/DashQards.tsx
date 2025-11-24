import { Button } from '@/components'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import React, { useMemo, useCallback } from 'react'
import { allQards } from '@/mocks/featuredCards'
import type { FeaturedCardProps } from '@/types'
import DashXImage from '@/assets/images/DashX.png'
import DashGoImage from '@/assets/images/DashGo.png'
import DashProImage from '@/assets/images/DashPro.png'
import { CardItems } from '../../components'

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
type ViewMode = 'grid' | 'list'

export default function DashQards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState<'dashx' | 'dashgo' | 'dashpro'>('dashx')
  const [sortBy, setSortBy] = React.useState<SortOption>('popular')
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid')
  const [displayedItems, setDisplayedItems] = React.useState(8)

  const [sectionStates, setSectionStates] = React.useState({
    cardType: true,
    filterOptions: true,
    qualityCategory: true,
  })

  const [subSectionStates, setSubSectionStates] = React.useState({
    vendors: true,
    priceRange: true,
    ratings: true,
    categories: true,
  })

  const [filters, setFilters] = React.useState({
    vendors: [] as string[],
    priceMin: null as number | null,
    priceMax: null as number | null,
    minRating: null as number | null,
    categories: [] as string[],
  })

  const toggleSection = useCallback((section: keyof typeof sectionStates) => {
    setSectionStates((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const toggleSubSection = useCallback((section: keyof typeof subSectionStates) => {
    setSubSectionStates((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const availableVendors = useMemo(() => {
    const vendorCounts: Record<string, number> = {}
    allQards.forEach((card) => {
      const vendor = card.subtitle || ''
      vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1
    })

    return Object.entries(vendorCounts)
      .map(([vendor, count]) => ({
        value: vendor,
        label: vendor,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const availableCategories = useMemo(() => {
    const categoryCounts: Record<string, number> = {}
    allQards.forEach((card) => {
      const category = card.category || ''
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
  }, [])

  const filteredQardsAll = useMemo(() => {
    let cards = [...allQards]

    // Filter by active tab (card type)
    cards = cards.filter((card) => card.type === activeTab)

    // Filter by vendors
    if (filters.vendors.length > 0) {
      cards = cards.filter((card) => filters.vendors.includes(card.subtitle || ''))
    }

    // Filter by price range
    if (filters.priceMin !== null) {
      cards = cards.filter((card) => (card.price || 0) >= filters.priceMin!)
    }
    if (filters.priceMax !== null) {
      cards = cards.filter((card) => (card.price || 0) <= filters.priceMax!)
    }

    // Filter by minimum rating
    if (filters.minRating !== null) {
      cards = cards.filter((card) => card.rating >= filters.minRating!)
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      cards = cards.filter((card) => card.category && filters.categories.includes(card.category))
    }

    return cards
  }, [activeTab, filters])

  const sortedQards = useMemo(() => {
    const cards = [...filteredQardsAll]

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
  }, [filteredQardsAll, sortBy, displayedItems])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.vendors.length > 0 ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.minRating !== null ||
      filters.categories.length > 0
    )
  }, [filters])

  const activeFilterTags = useMemo(() => {
    const tags: Array<{ id: string; label: string; type: string; value: string | number }> = []

    filters.vendors.forEach((vendor) => {
      tags.push({
        id: `vendor-${vendor}`,
        label: vendor,
        type: 'vendor',
        value: vendor,
      })
    })

    if (filters.priceMin !== null || filters.priceMax !== null) {
      const minPrice = filters.priceMin || 0
      const maxPrice = filters.priceMax || '∞'
      tags.push({
        id: 'price-range',
        label: `$${minPrice} - $${maxPrice}`,
        type: 'price',
        value: 'range',
      })
    }

    if (filters.minRating !== null) {
      tags.push({
        id: 'min-rating',
        label: `${filters.minRating}+ Stars`,
        type: 'rating',
        value: filters.minRating,
      })
    }

    filters.categories.forEach((category) => {
      tags.push({
        id: `category-${category}`,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        type: 'category',
        value: category,
      })
    })

    return tags
  }, [filters])

  const clearAllFilters = useCallback(() => {
    setFilters({
      vendors: [],
      priceMin: null,
      priceMax: null,
      minRating: null,
      categories: [],
    })
    setDisplayedItems(8)
  }, [])

  const removeFilter = useCallback((type: string, value: string | number) => {
    setFilters((prev) => {
      switch (type) {
        case 'vendor':
          return { ...prev, vendors: prev.vendors.filter((v) => v !== value) }
        case 'category':
          return { ...prev, categories: prev.categories.filter((c) => c !== value) }
        case 'price':
          return { ...prev, priceMin: null, priceMax: null }
        case 'rating':
          return { ...prev, minRating: null }
        default:
          return prev
      }
    })
    setDisplayedItems(8)
  }, [])

  const setPriceRange = useCallback((min: number, max: number | null) => {
    setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max }))
  }, [])

  const isPriceRangeActive = useCallback(
    (min: number, max: number | null) => {
      return filters.priceMin === min && filters.priceMax === max
    },
    [filters.priceMin, filters.priceMax],
  )

  const getCardTypeCount = useCallback((cardType: string) => {
    return allQards.filter((card) => card.type === cardType).length
  }, [])

  const scrollToCards = useCallback(() => {
    document.getElementById('cards-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const goToCart = useCallback(() => {
    navigate('/cart')
  }, [navigate])

  const onGetCard = useCallback(
    (item: FeaturedCardProps) => {
      console.log('Get Card clicked:', item.title)
      if (item.type === 'dashx' || item.type === 'dashpro' || item.type === 'dashgo') {
        navigate(`/xcard/${item.type}`)
      } else {
        navigate(`/gift-card?card=${encodeURIComponent(item.title)}&type=${item.type || ''}`)
      }
    },
    [navigate],
  )

  const loadMoreItems = useCallback(() => {
    setDisplayedItems((prev) => Math.min(prev + 8, filteredQardsAll.length))
  }, [filteredQardsAll.length])

  // Reset displayed items when filters change
  React.useEffect(() => {
    setDisplayedItems(8)
  }, [
    activeTab,
    filters.vendors,
    filters.priceMin,
    filters.priceMax,
    filters.minRating,
    filters.categories,
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="bg-gradient-to-br from-primary-500 to-primary-700 text-white pt-20 pb-12"
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
                  onClick={scrollToCards}
                  className="!rounded-full px-6 py-3 font-extrabold shadow-[0_4px_16px_rgba(255,199,10,0.3)] hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(255,199,10,0.4)]"
                >
                  Browse Qards
                </Button>
                <Button
                  variant="ghost"
                  onClick={goToCart}
                  className="!rounded-full px-6 py-3 font-extrabold border-2 border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10"
                >
                  View Cart (0)
                </Button>
              </div>
            </div>
            <div className="relative h-[260px] max-md:h-[220px]" aria-label="Card brands">
              <div className="absolute top-6 left-0 w-[260px] aspect-[16/10] rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-[-6deg] opacity-85 max-md:w-[220px] max-md:top-[18px]">
                <img
                  src={heroImages.pro}
                  alt="DashPro card"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-1.5 left-14 w-[260px] aspect-[16/10] rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-[4deg] opacity-92 max-md:w-[220px] max-md:left-10 max-md:top-1">
                <img src={heroImages.go} alt="DashGo card" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-11 left-[110px] w-[260px] aspect-[16/10] rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] rotate-[-2deg] max-md:w-[220px] max-md:left-[88px] max-md:top-10">
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
              <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-2 text-[#212529]">
                All Gift Cards
              </h2>
              <p className="text-base text-grey-500">
                Choose from {filteredQardsAll.length} available gift cards
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
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
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-transparent text-[#3b3b3b] hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 text-[13px] text-[#dc3545] bg-[#fff2f2] border border-[#f8d7da] cursor-pointer font-semibold px-3 py-2 rounded-md transition-all hover:bg-[#dc3545] hover:text-white hover:border-[#dc3545]"
                  >
                    <Icon icon="bi:x-circle" className="size-3.5" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Card Type Selection */}
              <div className="border-b border-[#f0f0f0] last:border-b-0">
                <div
                  className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5"
                  onClick={() => toggleSection('cardType')}
                >
                  <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                    Card Selection
                  </h4>
                  <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon
                      icon={sectionStates.cardType ? 'bi:chevron-up' : 'bi:chevron-down'}
                      className="size-3.5"
                    />
                  </button>
                </div>
                {sectionStates.cardType && (
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
                )}
              </div>

              {/* Filter Options */}
              <div className="border-b border-[#f0f0f0] last:border-b-0">
                <div
                  className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5"
                  onClick={() => toggleSection('filterOptions')}
                >
                  <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                    Filter Options
                  </h4>
                  <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon
                      icon={sectionStates.filterOptions ? 'bi:chevron-up' : 'bi:chevron-down'}
                      className="size-3.5"
                    />
                  </button>
                </div>
                {sectionStates.filterOptions && (
                  <div>
                    {/* Vendor Filter */}
                    <div className="px-6 pb-5">
                      <div
                        className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5"
                        onClick={() => toggleSubSection('vendors')}
                      >
                        <h5 className="text-[15px] font-semibold text-[#212529]">Vendor</h5>
                        <div className="flex items-center gap-2">
                          {filters.vendors.length > 0 && (
                            <span className="text-xs text-primary-500 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-xl">
                              {filters.vendors.length} selected
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon
                              icon={subSectionStates.vendors ? 'bi:chevron-up' : 'bi:chevron-down'}
                              className="size-3"
                            />
                          </button>
                        </div>
                      </div>
                      {subSectionStates.vendors && (
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
                                        setFilters((prev) => ({
                                          ...prev,
                                          vendors: [...prev.vendors, vendor.value],
                                        }))
                                      } else {
                                        setFilters((prev) => ({
                                          ...prev,
                                          vendors: prev.vendors.filter((v) => v !== vendor.value),
                                        }))
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
                      )}
                    </div>

                    {/* Price Range Filter */}
                    <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                      <div
                        className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5"
                        onClick={() => toggleSubSection('priceRange')}
                      >
                        <h5 className="text-[15px] font-semibold text-[#212529]">Price Range</h5>
                        <div className="flex items-center gap-2">
                          {(filters.priceMin || filters.priceMax) && (
                            <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                              Active
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon
                              icon={
                                subSectionStates.priceRange ? 'bi:chevron-up' : 'bi:chevron-down'
                              }
                              className="size-3"
                            />
                          </button>
                        </div>
                      </div>
                      {subSectionStates.priceRange && (
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
                                  value={filters.priceMin || ''}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      priceMin: e.target.value ? Number(e.target.value) : null,
                                    }))
                                  }
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
                                  value={filters.priceMax || ''}
                                  onChange={(e) =>
                                    setFilters((prev) => ({
                                      ...prev,
                                      priceMax: e.target.value ? Number(e.target.value) : null,
                                    }))
                                  }
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
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quality & Category Group */}
              <div className="border-b border-[#f0f0f0] last:border-b-0">
                <div
                  className="flex justify-between items-center p-5 pb-3 cursor-pointer transition-colors hover:bg-primary-500/5"
                  onClick={() => toggleSection('qualityCategory')}
                >
                  <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
                    Quality & Category
                  </h4>
                  <button className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon
                      icon={sectionStates.qualityCategory ? 'bi:chevron-up' : 'bi:chevron-down'}
                      className="size-3.5"
                    />
                  </button>
                </div>
                {sectionStates.qualityCategory && (
                  <div>
                    {/* Rating Filter */}
                    <div className="px-6 pb-5">
                      <div
                        className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5"
                        onClick={() => toggleSubSection('ratings')}
                      >
                        <h5 className="text-[15px] font-semibold text-[#212529]">Minimum Rating</h5>
                        <div className="flex items-center gap-2">
                          {filters.minRating && (
                            <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                              {filters.minRating}+ Stars
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon
                              icon={subSectionStates.ratings ? 'bi:chevron-up' : 'bi:chevron-down'}
                              className="size-3"
                            />
                          </button>
                        </div>
                      </div>
                      {subSectionStates.ratings && (
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
                                  setFilters((prev) => ({
                                    ...prev,
                                    minRating: e.target.checked ? rating : null,
                                  }))
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
                      )}
                    </div>

                    {/* Category Filter */}
                    <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                      <div
                        className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5"
                        onClick={() => toggleSubSection('categories')}
                      >
                        <h5 className="text-[15px] font-semibold text-[#212529]">Category</h5>
                        <div className="flex items-center gap-2">
                          {filters.categories.length > 0 && (
                            <span className="text-xs text-primary-500 font-semibold bg-primary-500/10 px-2 py-0.5 rounded-xl">
                              {filters.categories.length} selected
                            </span>
                          )}
                          <button className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all hover:bg-primary-500/10 hover:text-primary-500">
                            <Icon
                              icon={
                                subSectionStates.categories ? 'bi:chevron-up' : 'bi:chevron-down'
                              }
                              className="size-3"
                            />
                          </button>
                        </div>
                      </div>
                      {subSectionStates.categories && (
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
                                        setFilters((prev) => ({
                                          ...prev,
                                          categories: [...prev.categories, category.value],
                                        }))
                                      } else {
                                        setFilters((prev) => ({
                                          ...prev,
                                          categories: prev.categories.filter(
                                            (c) => c !== category.value,
                                          ),
                                        }))
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
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Footer */}
              {hasActiveFilters && (
                <div className="p-4 border-t border-[#e6e6e6] bg-[#f8f9fa]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-grey-500 font-medium">
                      {activeFilterTags.length} filters active
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
              )}
            </aside>

            {/* Products Main */}
            <main>
              <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <span className="text-base font-bold text-[#212529]">
                    {filteredQardsAll.length} Results
                  </span>
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilterTags.map((filter) => (
                        <span
                          key={filter.id}
                          className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold"
                        >
                          {filter.label}
                          <button
                            onClick={() => removeFilter(filter.type, filter.value)}
                            className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                          >
                            <Icon icon="bi:x" className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {filteredQardsAll.length === 0 ? (
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
                  <div
                    className={`${
                      viewMode === 'grid'
                        ? 'grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1 max-md:gap-4'
                        : 'flex flex-col gap-4'
                    }`}
                  >
                    {sortedQards.map((card, idx) => (
                      <CardItems key={idx} {...card} onGetQard={() => onGetCard(card)} />
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-12 gap-4 max-md:flex-col">
                    <div className="text-sm text-grey-500 font-medium">
                      Showing {Math.min(displayedItems, filteredQardsAll.length)} of{' '}
                      {filteredQardsAll.length} gift cards
                    </div>
                    {displayedItems < filteredQardsAll.length && (
                      <button
                        onClick={loadMoreItems}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white border-none rounded-[50px] font-bold cursor-pointer transition-all hover:bg-primary-700 hover:-translate-y-px"
                      >
                        <Icon icon="bi:plus-circle" className="size-4" />
                        Load More ({filteredQardsAll.length - displayedItems} remaining)
                      </button>
                    )}
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
