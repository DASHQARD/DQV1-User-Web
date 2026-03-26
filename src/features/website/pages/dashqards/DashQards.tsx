import { useMemo, useState } from 'react'
import { Button, Dropdown, Modal, Text } from '@/components'
import { Icon } from '@/libs'
import DashXImage from '@/assets/images/DashX.png'
import DashGoImage from '@/assets/images/DashGo.png'
import DashProImage from '@/assets/images/DashPro.png'
import { CardItems, DashProPurchase, DashGoPurchase } from '../../components'
import { useDashQards } from '../../hooks'
import { DashQardsFilters } from './DashQardsFilters'

const heroImages = {
  pro: DashProImage,
  x: DashXImage,
  go: DashGoImage,
}

export default function DashQards() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    cardTabs,
    priceRanges,
    vendors,
    filteredQardsAll,
    sortedQards,
    getCardTypeCount,
    setPriceRange,
    isPriceRangeActive,
    clearAllFilters,
    sortActions,
    currentSortLabel,
    setSortBy,
  } = useDashQards()

  const activeFiltersCount = useMemo(
    () => [query.min_price, query.max_price, query.search, query.vendor_ids].filter(Boolean).length,
    [query.min_price, query.max_price, query.search, query.vendor_ids],
  )

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
            <div className="relative h-[280px] max-md:hidden" aria-label="Card brands">
              {/* DashGo Card - Back (Pink/Orange, Leftmost) */}
              <div className="absolute top-8 right-0 w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] opacity-85 max-md:w-[220px] max-md:top-[20px] transform rotate-6">
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
              <div className="absolute bottom-0 left-[110px] w-[260px] aspect-16/10 rounded-[14px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.35)] max-md:w-[220px] max-md:left-[88px] max-md:top-10 transform -rotate-2 z-20">
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
            <div className="max-md:hidden">
              <DashQardsFilters
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                query={query}
                setQuery={setQuery}
                cardTabs={cardTabs}
                priceRanges={priceRanges}
                vendors={vendors}
                cardsCount={filteredQardsAll.length}
                getCardTypeCount={getCardTypeCount}
                setPriceRange={setPriceRange}
                isPriceRangeActive={isPriceRangeActive}
                clearAllFilters={clearAllFilters}
              />
            </div>

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

                <div className="flex items-center gap-2 justify-between max-md:flex-wrap">
                  <div className="hidden max-md:flex">
                    <Button
                      variant="outline"
                      size="medium"
                      className="border border-[#e2e4ed] bg-white rounded-md text-xs text-[#212529] font-medium"
                      onClick={() => setIsMobileFiltersOpen(true)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon icon="bi:funnel" className="size-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                            {activeFiltersCount}
                          </span>
                        )}
                      </span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Text variant="p" weight="medium" className="text-[#212529]">
                      Sort by:
                    </Text>
                    <Dropdown
                      contentClassName=""
                      align="start"
                      actions={sortActions.map((action) => ({
                        label: action.label,
                        onClickFn: () => setSortBy(action.value),
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
                          const selectedVendors = vendors.filter((v) =>
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

      <Modal
        isOpen={isMobileFiltersOpen}
        setIsOpen={setIsMobileFiltersOpen}
        panelClass="max-w-[95vw] w-full"
      >
        <div className="p-3">
          <DashQardsFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            query={query}
            setQuery={setQuery}
            cardTabs={cardTabs}
            priceRanges={priceRanges}
            vendors={vendors}
            cardsCount={filteredQardsAll.length}
            getCardTypeCount={getCardTypeCount}
            setPriceRange={setPriceRange}
            isPriceRangeActive={isPriceRangeActive}
            clearAllFilters={clearAllFilters}
          />
          <div className="pt-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
