import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashXImage from '@/assets/images/DashX.png'
import DashGoImage from '@/assets/images/DashGo.png'
import DashProImage from '@/assets/images/DashPro.png'
import { CardItems, DashProPurchase, DashGoPurchase } from '../../components'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Select } from '@/components/Select'
import useVendorsManagementBase from '../../hooks/vendors/useVendorsManagement'
import type { PublicCardResponse } from '@/types/cards'

const heroImages = {
  pro: DashProImage,
  x: DashXImage,
  go: DashGoImage,
}

export default function DashQards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'dashx' | 'dashgo' | 'dashpro' | 'dashpass'>('dashx')
  const { control } = useForm({
    defaultValues: {
      sortBy: 'popular',
    },
  })
  const sortBy = useWatch({ control, name: 'sortBy' })
  const {
    cardsResponse,
    min_price,
    max_price,
    setMinPrice,
    setMaxPrice,
    search,
    setSearch,
    cardTabs,
    priceRanges,
    sortOptions,
  } = useVendorsManagementBase()

  // Get all cards from response
  const allCards = useMemo(() => {
    if (!cardsResponse?.data) {
      return []
    }
    // Handle both array and object with data property
    const cards = Array.isArray(cardsResponse.data)
      ? cardsResponse.data
      : Array.isArray(cardsResponse)
        ? cardsResponse
        : []
    return cards as unknown as PublicCardResponse[]
  }, [cardsResponse])

  // Filter cards based on active tab and filters
  const filteredQardsAll = useMemo(() => {
    return allCards.filter((card) => {
      // Filter by card type (activeTab)
      const cardType = card.type?.toLowerCase()
      if (activeTab !== 'dashx' && cardType !== activeTab) {
        return false
      }
      if (activeTab === 'dashx' && cardType !== 'dashx' && cardType !== 'dashpass') {
        return false
      }

      // Filter by price range
      const cardPrice = parseFloat(card.price) || 0
      if (min_price && cardPrice < parseFloat(min_price)) {
        return false
      }
      if (max_price && cardPrice > parseFloat(max_price)) {
        return false
      }

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          card.product?.toLowerCase().includes(searchLower) ||
          card.vendor_name?.toLowerCase().includes(searchLower) ||
          card.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false
        }
      }

      return true
    })
  }, [allCards, activeTab, min_price, max_price, search])

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
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
      case 'rating':
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          return ratingB - ratingA
        })
      case 'popular':
      default:
        // Default: keep original order or sort by rating
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          return ratingB - ratingA
        })
    }
  }, [filteredQardsAll, sortBy])

  // Get card count by type
  const getCardTypeCount = useCallback(
    (typeId: string) => {
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
    (min: number | null, max: number | null) => {
      setMinPrice(min !== null ? min.toString() : null)
      setMaxPrice(max !== null ? max.toString() : null)
    },
    [setMinPrice, setMaxPrice],
  )

  // Check if price range is active
  const isPriceRangeActive = useCallback(
    (min: number | null, max: number | null) => {
      const currentMin = min_price ? parseFloat(min_price) : null
      const currentMax = max_price ? parseFloat(max_price) : null

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
    [min_price, max_price],
  )

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setMinPrice(null)
    setMaxPrice(null)
    setSearch(null)
  }, [setMinPrice, setMaxPrice, setSearch])

  // Navigate to card details
  const onGetCard = useCallback(
    (card: PublicCardResponse) => {
      if (card.card_id) {
        navigate(`/card/${card.card_id}`)
      }
    },
    [navigate],
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
              <div className="absolute top-11 left-[110px] w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)] -rotate-2deg max-md:w-[220px] max-md:left-[88px] max-md:top-10">
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
                            setActiveTab(tab.id as 'dashx' | 'dashgo' | 'dashpro' | 'dashpass')
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
              </div>

              {/* Filter Footer */}
              <div className="p-4 border-t border-[#e6e6e6] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-grey-500 font-medium">
                    {(() => {
                      const activeFilters = [min_price, max_price, search].filter(Boolean).length
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
                  <Controller
                    name="sortBy"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={sortOptions}
                        placeholder="Select sort by"
                        className="w-[200px]"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-3">
                {(min_price || max_price || search) && (
                  <div className="flex flex-wrap gap-2">
                    {min_price && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        Min: ${min_price}
                        <button
                          onClick={() => setMinPrice(null)}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
                    {max_price && (
                      <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                        Max: ${max_price}
                        <button
                          onClick={() => setMaxPrice(null)}
                          className="bg-transparent border-none text-white cursor-pointer p-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                        >
                          <Icon icon="bi:x" className="size-3" />
                        </button>
                      </span>
                    )}
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
                      .map((card) => (
                        <CardItems
                          key={card.card_id}
                          id={card.card_id}
                          product={card.product}
                          vendor_name={card.vendor_name || ''}
                          rating={card.rating || 0}
                          price={card.price}
                          currency={card.currency}
                          type={card.type as 'DashX' | 'dashpro' | 'dashpass' | 'dashgo'}
                          description={card.description}
                          expiry_date={card.expiry_date}
                          terms_and_conditions={card.terms_and_conditions || []}
                          created_at={card.created_at || new Date().toISOString()}
                          created_by={null}
                          fraud_flag={false}
                          fraud_notes={null}
                          images={(card.images || []).map((img) => ({
                            id: img.id,
                            file_url: img.file_url,
                            file_name: img.file_name,
                            created_at: img.created_at || new Date().toISOString(),
                            updated_at: img.updated_at || new Date().toISOString(),
                          }))}
                          is_activated={false}
                          issue_date={card.created_at || new Date().toISOString()}
                          last_modified_by={null}
                          status={card.status || 'active'}
                          updated_at={card.updated_at || new Date().toISOString()}
                          vendor_id={card.vendor_id}
                          onGetQard={() => onGetCard(card)}
                        />
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
