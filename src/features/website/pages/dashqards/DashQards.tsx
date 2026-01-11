import { useState, useMemo, useCallback } from 'react'
import { Button, Dropdown, Text } from '@/components'
import { Icon } from '@/libs'
import { useNavigate } from 'react-router-dom'
import DashXImage from '@/assets/images/DashX.png'
import DashGoImage from '@/assets/images/DashGo.png'
import DashProImage from '@/assets/images/DashPro.png'
import { CardItems, DashProPurchase, DashGoPurchase } from '../../components'
import type { PublicCardResponse } from '@/types/responses'
import { usePublicCatalog } from '../../hooks/website'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'

const heroImages = {
  pro: DashProImage,
  x: DashXImage,
  go: DashGoImage,
}

export default function DashQards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'dashx' | 'dashpro' | 'dashpass' | 'dashgo'>('dashx')
  const { publicCards, query, setQuery, cardTabs, priceRanges } = usePublicCatalog()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { data: vendorsResponse } = usePublicVendorsService({ limit: 100 })
  console.log('vendorsResponse', vendorsResponse)

  // Extract vendors from response - VendorDetailsResponse is already an array
  const vendors = useMemo(() => {
    if (!vendorsResponse) return []
    const vendorsData = Array.isArray(vendorsResponse) ? vendorsResponse : [vendorsResponse]
    return vendorsData.map((vendor: any) => ({
      id: vendor.id || vendor.vendor_id,
      vendor_id: vendor.vendor_id,
      name: vendor.business_name || vendor.branch_name || vendor.vendor_name || 'Unknown Vendor',
    }))
  }, [vendorsResponse])

  // Use query.sort_by for sorting, default to 'popular'
  const sortBy = query.sort_by || 'popular'
  console.log('publicCards', publicCards)

  // Get all cards from response
  const allCards = useMemo(() => {
    if (!publicCards) {
      return []
    }
    // Handle both array and object with data property
    const cards = Array.isArray(publicCards)
      ? publicCards
      : Array.isArray((publicCards as any)?.data)
        ? (publicCards as any).data
        : []
    return cards as unknown as PublicCardResponse[]
  }, [publicCards])

  // Filter cards based on active tab and price range (backend handles other filtering)
  const filteredQardsAll = useMemo(() => {
    return allCards.filter((card) => {
      // Filter by card type (activeTab) - client-side only
      const cardType = card.type?.toLowerCase()
      if (activeTab === 'dashx') {
        // DashX shows both DashX and DashPass
        if (cardType !== 'dashx' && cardType !== 'dashpass') {
          return false
        }
      } else if (cardType !== activeTab) {
        // For other tabs, show only matching type
        return false
      }

      // Filter by price range - client-side fallback if backend doesn't filter
      const cardPrice = parseFloat(card.price) || 0
      if (query.min_price) {
        const minPrice = parseFloat(query.min_price)
        if (!isNaN(minPrice) && cardPrice < minPrice) {
          return false
        }
      }
      if (query.max_price) {
        const maxPrice = parseFloat(query.max_price)
        if (!isNaN(maxPrice) && cardPrice > maxPrice) {
          return false
        }
      }

      return true
    })
  }, [allCards, activeTab, query.min_price, query.max_price])

  // Backend handles sorting, so use filtered cards directly
  const sortedQards = filteredQardsAll

  // Get card count by type
  const getCardTypeCount = useCallback(
    (typeId: string) => {
      if (typeId === 'dashpro' || typeId === 'dashgo') {
        return 1
      }
      return allCards.filter((card) => {
        const cardType = card.type?.toLowerCase()
        // Count only cards of the specific type
        return cardType === typeId
      }).length
    },
    [allCards],
  )

  // Set price range helper
  const setPriceRange = useCallback(
    (min: number | null | undefined, max: number | null | undefined) => {
      setQuery({
        ...query,
        min_price: min !== null && min !== undefined ? min.toString() : undefined,
        max_price: max !== null && max !== undefined ? max.toString() : undefined,
      })
    },
    [setQuery, query],
  )

  // Check if price range is active
  const isPriceRangeActive = useCallback(
    (min: number | null, max: number | null) => {
      const currentMin = query.min_price ? parseFloat(query.min_price) : null
      const currentMax = query.max_price ? parseFloat(query.max_price) : null

      if (min === null && max === null) {
        return currentMin === null && currentMax === null
      }

      if (min !== null && max !== null) {
        return currentMin === min && currentMax === max
      }

      if (min !== null && max === null) {
        return currentMin === min && currentMax === null
      }

      return false
    },
    [query.min_price, query.max_price],
  )

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setQuery({
      ...query,
      min_price: '',
      max_price: '',
      search: '',
      vendor_ids: '',
      sort_by: '',
    })
  }, [setQuery, query])

  // Navigate to card details
  const onGetCard = useCallback(
    (card: PublicCardResponse) => {
      if (card.card_id) {
        navigate(`/card/${card.card_id}`)
      }
    },
    [navigate],
  )

  const actions = useMemo(
    () => [
      { label: 'Popular', value: 'popular' },
      { label: 'Newest', value: 'newest' },
    ],
    [],
  )

  // Get the current sort label
  const currentSortLabel = useMemo(() => {
    const actions = [
      { label: 'Newest', value: 'newest' },
      { label: 'Popular', value: 'popular' },
    ]
    const action = actions.find((a) => a.value === sortBy)
    return action?.label || 'Sort by'
  }, [sortBy])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="bg-[#402D87] text-white pt-20 pb-16"
        style={{ marginTop: '-72px', paddingTop: '88px' }}
      >
        <div className="wrapper">
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 items-center max-md:grid-cols-1 max-md:text-center max-md:gap-8">
            <div className="hero__text">
              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight text-white">
                Give the Gift of Choice
              </h1>
              <p className="text-lg opacity-90 mb-8 leading-relaxed text-white">
                DashX, DashGo, and DashPro gift cards — perfect for every moment and every budget.
              </p>
            </div>
            <div className="relative h-[280px] max-md:h-[240px]" aria-label="Card brands">
              {/* DashGo Card - Back (Pink/Orange, Leftmost) */}
              <div className="absolute top-8 right-0 w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] opacity-85 max-md:w-[220px] max-md:top-[20px] transform rotate-[6deg]">
                <img src={heroImages.go} alt="DashGo card" className="w-full h-full object-cover" />
              </div>
              {/* DashPro Card - Middle (Yellow/Orange, Center-left) */}
              <div className="absolute top-4 left-12 w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] opacity-92 max-md:w-[220px] max-md:left-10 max-md:top-1 transform rotate-[4deg] z-10">
                <img
                  src={heroImages.pro}
                  alt="DashPro card"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* DashX Card - Front (Purple/Blue, Rightmost) */}
              <div className="absolute bottom-0 left-[110px] w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] max-md:w-[220px] max-md:left-[88px] max-md:top-10 transform -rotate-[2deg] z-20">
                <img src={heroImages.x} alt="DashX card" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Qards Section */}
      <section id="cards-section" className="py-12 bg-white">
        <div className="wrapper">
          {/* E-commerce Layout */}
          <div className="flex gap-8 items-start max-md:flex-col max-md:gap-6">
            {/* Filter Sidebar */}
            <aside className="bg-white border border-[#e6e6e6] rounded-xl sticky top-[120px] w-[280px] h-[calc(100vh-140px)] overflow-y-auto shrink-0 max-lg:w-[260px] max-md:static max-md:w-full max-md:h-auto max-md:max-h-none max-md:overflow-y-visible">
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
                          onChange={() => {
                            if (
                              tab.id === 'dashx' ||
                              tab.id === 'dashpro' ||
                              tab.id === 'dashpass' ||
                              tab.id === 'dashgo'
                            ) {
                              setActiveTab(tab.id)
                            }
                          }}
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
                  {/* Search Filter */}
                  <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                    <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                      <h5 className="text-[15px] font-semibold text-[#212529]">Search</h5>
                      <div className="flex items-center gap-2">
                        {query.search && (
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
                      <div className="relative">
                        <Icon
                          icon="bi:search"
                          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-500 pointer-events-none"
                        />
                        <input
                          type="text"
                          value={query.search || ''}
                          onChange={(e) =>
                            setQuery({ ...query, search: e.target.value || undefined })
                          }
                          placeholder="Search cards, vendors..."
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-[#e6e6e6] rounded-md text-sm font-medium bg-white transition-colors focus:outline-none focus:border-primary-500 placeholder:text-[#aaa]"
                        />
                        {query.search && (
                          <button
                            onClick={() => setQuery({ ...query, search: undefined })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-primary-500 transition-colors"
                          >
                            <Icon icon="bi:x" className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vendors Filter */}
                  <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                    <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                      <h5 className="text-[15px] font-semibold text-[#212529]">Vendors</h5>
                      <div className="flex items-center gap-2">
                        {query.vendor_ids && (
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
                      <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {vendors.length === 0 ? (
                          <p className="text-sm text-grey-500 text-center py-4">
                            No vendors available
                          </p>
                        ) : (
                          vendors.map((vendor: any) => {
                            const isSelected = query.vendor_ids
                              ?.split(',')
                              .map((id) => id.trim())
                              .includes(vendor.vendor_id?.toString() || '')
                            return (
                              <label
                                key={vendor.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-primary-500/10 border-2 border-primary-500'
                                    : 'bg-white border-2 border-[#e6e6e6] hover:border-primary-500/30 hover:bg-primary-500/5'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected || false}
                                  onChange={(e) => {
                                    const currentIds =
                                      query.vendor_ids
                                        ?.split(',')
                                        .map((id) => id.trim())
                                        .filter(Boolean) || []
                                    const vendorIdStr = vendor.vendor_id?.toString() || ''

                                    if (e.target.checked) {
                                      // Add vendor ID
                                      const newIds = [...currentIds, vendorIdStr]
                                      setQuery({ ...query, vendor_ids: newIds.join(',') })
                                    } else {
                                      // Remove vendor ID
                                      const newIds = currentIds.filter((id) => id !== vendorIdStr)
                                      setQuery({
                                        ...query,
                                        vendor_ids:
                                          newIds.length > 0 ? newIds.join(',') : undefined,
                                      })
                                    }
                                  }}
                                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-[#212529] flex-1">
                                  {vendor.name}
                                </span>
                              </label>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="px-6 pb-5 border-t border-[#f0f0f0]">
                    <div className="flex justify-between items-center mb-3 p-1.5 -mx-2 rounded-md cursor-pointer transition-colors hover:bg-primary-500/5">
                      <h5 className="text-[15px] font-semibold text-[#212529]">Price Range</h5>
                      <div className="flex items-center gap-2">
                        {(query.min_price || query.max_price) && (
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
                              ₵
                            </span>
                            <input
                              type="number"
                              value={query.min_price || ''}
                              onChange={(e) =>
                                setQuery({ ...query, min_price: e.target.value || undefined })
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
                              ₵
                            </span>
                            <input
                              type="number"
                              value={query.max_price || ''}
                              onChange={(e) =>
                                setQuery({ ...query, max_price: e.target.value || undefined })
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
                  </div>
                </div>
              </div>

              {/* Filter Footer */}
              <div className="p-4 border-t border-[#e6e6e6] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-grey-500 font-medium">
                    {(() => {
                      const activeFilters = [
                        query.min_price,
                        query.max_price,
                        query.search,
                        query.vendor_ids,
                      ].filter(Boolean).length
                      return `${activeFilters} filter${activeFilters !== 1 ? 's' : ''} active`
                    })()}
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
            </aside>

            {/* Products Main */}
            <main className="flex flex-col gap-4 flex-1 min-w-0">
              <section className="flex flex-col gap-4">
                <div className="pt-2 pb-4 pr-4 border-b border-[#e6e6e6]">
                  <Text variant="h2" weight="medium" className="text-[#212529]">
                    Results for "All Gift Cards" in{' '}
                    <span className="font-normal">({filteredQardsAll.length})</span>
                  </Text>
                  <p className="py-2 opacity-0">check</p>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Text variant="p" weight="medium" className="text-[#212529]">
                    Sort by:
                  </Text>
                  <Dropdown
                    contentClassName=""
                    align="start"
                    actions={actions.map((action) => ({
                      label: action.label,
                      onClickFn: () => setQuery({ ...query, sort_by: action.value }),
                    }))}
                  >
                    <Button
                      variant="outline"
                      icon="hugeicons:arrow-down-01"
                      iconPosition="right"
                      size="medium"
                      className="border border-[#e2e4ed] bg-white py-0 rounded-md w-fit text-xs text-[#7c8689] font-normal capitalize"
                    >
                      {currentSortLabel}
                    </Button>
                  </Dropdown>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                {(query.min_price || query.max_price || query.search || query.vendor_ids) && (
                  <div className="flex flex-wrap gap-2">
                    {query.min_price && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        Min: ₵{query.min_price}
                        <button
                          onClick={() => setQuery({ ...query, min_price: '' })}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
                    {query.max_price && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        Max: ₵{query.max_price}
                        <button
                          onClick={() => setQuery({ ...query, max_price: '' })}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
                    {query.search && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        Search: "{query.search}"
                        <button
                          onClick={() => setQuery({ ...query, search: undefined })}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
                    {query.vendor_ids && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        {(() => {
                          const selectedVendorIds = query.vendor_ids
                            .split(',')
                            .map((id) => id.trim())
                          const selectedVendors = vendors.filter((v: any) =>
                            selectedVendorIds.includes(v.vendor_id?.toString() || ''),
                          )
                          if (selectedVendors.length === 1) {
                            return `Vendor: ${selectedVendors[0].name}`
                          }
                          return `${selectedVendors.length} Vendors`
                        })()}
                        <button
                          onClick={() => setQuery({ ...query, vendor_ids: undefined })}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </section>

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
                  <Button variant="outline" onClick={clearAllFilters} className="rounded-full!">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1 max-md:gap-4">
                    {sortedQards
                      .filter((card) => card.type?.toLowerCase() !== 'dashpro')
                      .map((card) => {
                        // Extract all available fields from card (API may return additional fields not in type)
                        const cardData = card as any
                        return (
                          <CardItems
                            key={card.card_id}
                            card_id={card.card_id}
                            product={card.product || cardData.card_name || ''}
                            vendor_name={card.vendor_name || cardData.branch_name || ''}
                            branch_name={cardData.branch_name || card.vendor_name || ''}
                            branch_location={cardData.branch_location || ''}
                            description={card.description || cardData.card_description || ''}
                            price={card.price || cardData.card_price || '0'}
                            base_price={
                              cardData.base_price || card.price || cardData.card_price || '0'
                            }
                            markup_price={cardData.markup_price ?? null}
                            service_fee={cardData.service_fee || '0'}
                            currency={card.currency || 'GHS'}
                            expiry_date={card.expiry_date || ''}
                            status={card.status || cardData.card_status || 'active'}
                            rating={card.rating || 0}
                            created_at={card.created_at || ''}
                            recipient_count={card.recipient_count || '0'}
                            images={(card.images || cardData.images || []) as []}
                            terms_and_conditions={
                              (card.terms_and_conditions ||
                                cardData.terms_and_conditions ||
                                []) as []
                            }
                            type={card.type || cardData.card_type || 'dashx'}
                            updated_at={card.updated_at || card.created_at || ''}
                            vendor_id={card.vendor_id || cardData.vendor_id || 0}
                            onGetQard={() => onGetCard(card)}
                          />
                        )
                      })}
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
