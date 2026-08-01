import { useState } from 'react'
import { cn, Icon } from '@/libs'

import type { DashQardsTabId, DashQardsVendor } from '../../hooks/useDashQards'
import {
  getPriceRangeValidationError,
  isInvertedPriceRange,
  normalizePriceInput,
} from '../../utils/priceRangeFilter'

export interface DashQardsFiltersQuery {
  search?: string
  vendor_ids?: string
  min_price?: string
  max_price?: string
}

interface CardTab {
  id: string
  label: string
}

interface PriceRange {
  label: string
  min: number | null
  max: number | null
}

export interface DashQardsFiltersProps {
  activeTab: DashQardsTabId
  setActiveTab: (tab: DashQardsTabId) => void
  query: DashQardsFiltersQuery
  setQuery: (q: Partial<DashQardsFiltersQuery> & Record<string, unknown>) => void
  cardTabs: CardTab[]
  priceRanges: PriceRange[]
  vendors: DashQardsVendor[]
  cardsCount: number
  getCardTypeCount: (typeId: string) => number
  setPriceRange: (min: number | null | undefined, max: number | null | undefined) => void
  isPriceRangeActive: (min: number | null, max: number | null) => boolean
  clearAllFilters: () => void
  /** Sidebar on desktop; full-width when opened in the filters modal. */
  layout?: 'sidebar' | 'modal'
  /** When true, only show card type selection (used for DashPro/DashGo purchase flows). */
  cardSelectionOnly?: boolean
}

const SECTION_KEYS = ['cardSelection', 'vendors', 'priceRange'] as const
type SectionKey = (typeof SECTION_KEYS)[number]

export function DashQardsFilters({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  cardTabs,
  priceRanges,
  vendors,
  cardsCount,
  getCardTypeCount,
  setPriceRange,
  isPriceRangeActive,
  clearAllFilters,
  layout = 'sidebar',
  cardSelectionOnly = false,
}: DashQardsFiltersProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    () => Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<SectionKey, boolean>,
  )

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const priceRangeError = getPriceRangeValidationError(query.min_price, query.max_price)

  const activeFiltersCount = [
    query.min_price,
    isInvertedPriceRange(query.min_price, query.max_price) ? undefined : query.max_price,
    query.search,
    query.vendor_ids,
  ].filter(Boolean).length

  const clearInvalidMaxIfNeeded = () => {
    if (!isInvertedPriceRange(query.min_price, query.max_price)) return
    setQuery({ ...query, max_price: '' })
  }

  return (
    <aside
      className={cn(
        'bg-white border border-[#e6e6e6] rounded-xl shrink-0',
        layout === 'modal'
          ? 'w-full max-h-[min(70vh,640px)] overflow-y-auto'
          : 'sticky top-[120px] w-[300px] max-h-[calc(100vh-140px)] overflow-y-auto max-md:static max-md:w-full max-md:max-h-none max-md:overflow-y-visible',
      )}
    >
      <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e6e6e6]">
        <div className="flex-1">
          <h3 className="text-xl font-extrabold text-[#212529] mb-1">Filter Results</h3>
          <p className="text-sm text-grey-500 font-medium">
            {cardsCount} {cardsCount === 1 ? 'card' : 'cards'} available
          </p>
        </div>
      </div>

      {/* Card Type Selection */}
      <div className="border-b border-[#e8e8e8] last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection('cardSelection')}
          className={`flex justify-between items-center w-full py-4 px-5 cursor-pointer transition-colors text-left rounded-t-lg ${
            openSections.cardSelection
              ? 'hover:bg-primary-500/5'
              : 'bg-[#f8f9fa] hover:bg-[#f0f1f3]'
          }`}
        >
          <h4 className="text-[13px] font-bold text-[#212529] uppercase tracking-wider">
            Card Selection
          </h4>
          <span className="w-7 h-7 flex items-center justify-center text-grey-500 rounded-full transition-all duration-300 ease-in-out hover:bg-primary-500/10 hover:text-primary-500">
            <Icon
              icon="bi:chevron-down"
              className={`size-3.5 transition-transform duration-300 ease-in-out ${openSections.cardSelection ? '' : '-rotate-180'}`}
            />
          </span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.cardSelection ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
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
                        setActiveTab(tab.id as DashQardsTabId)
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[15px] font-semibold text-[#212529]">{tab.label}</span>
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
      </div>

      {/* Filter Options */}
      {!cardSelectionOnly && (
        <div className="border-b border-[#f0f0f0] last:border-b-0">
          <div>
            {/* Vendors Filter */}
            <div className={`${openSections.vendors ? 'px-6 pb-5' : ''}`}>
              <button
                type="button"
                onClick={() => toggleSection('vendors')}
                className={`flex justify-between items-center w-full py-4 px-5 cursor-pointer transition-colors text-left -mx-0.5 rounded-md ${
                  openSections.vendors
                    ? 'mb-3 hover:bg-primary-500/5'
                    : 'bg-[#f8f9fa] hover:bg-[#f0f1f3]'
                }`}
              >
                <h5 className="text-[15px] font-semibold text-[#212529]">Vendors</h5>
                <div className="flex items-center gap-2">
                  {query.vendor_ids && (
                    <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                      Active
                    </span>
                  )}
                  <span className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all duration-300 ease-in-out hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon
                      icon="bi:chevron-down"
                      className={`size-3 transition-transform duration-300 ease-in-out ${openSections.vendors ? '' : '-rotate-180'}`}
                    />
                  </span>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.vendors ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {vendors.length === 0 ? (
                      <p className="text-sm text-grey-500 text-center py-4">No vendors available</p>
                    ) : (
                      vendors.map((vendor) => {
                        const vendorIdStr = vendor.vendor_id?.toString() || ''
                        const currentIds =
                          query.vendor_ids
                            ?.split(',')
                            ?.map((id: string) => id.trim())
                            ?.filter(Boolean) || []
                        const isSelected = currentIds.includes(vendorIdStr)
                        return (
                          <label
                            key={vendor.id ?? vendor.vendor_id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary-500/10 border-2 border-primary-500'
                                : 'bg-white border-2 border-[#e6e6e6] hover:border-primary-500/30 hover:bg-primary-500/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setQuery({
                                    ...query,
                                    vendor_ids: [...currentIds, vendorIdStr].join(','),
                                  })
                                } else {
                                  const newIds = currentIds.filter((id) => id !== vendorIdStr)
                                  setQuery({
                                    ...query,
                                    vendor_ids: newIds.length > 0 ? newIds.join(',') : undefined,
                                  })
                                }
                              }}
                              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-[#212529] flex-1 truncate">
                              {vendor.name}
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div
              className={`border-t border-[#e8e8e8] ${openSections.priceRange ? 'px-6 pb-5' : ''}`}
            >
              <button
                type="button"
                onClick={() => toggleSection('priceRange')}
                className={`flex justify-between items-center w-full py-4 px-5 cursor-pointer transition-colors text-left -mx-0.5 rounded-md ${
                  openSections.priceRange
                    ? 'mb-3 hover:bg-primary-500/5'
                    : 'bg-[#f8f9fa] hover:bg-[#f0f1f3]'
                }`}
              >
                <h5 className="text-[15px] font-semibold text-[#212529]">Price Range</h5>
                <div className="flex items-center gap-2">
                  {(query.min_price || query.max_price) && (
                    <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                      Active
                    </span>
                  )}
                  <span className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all duration-300 ease-in-out hover:bg-primary-500/10 hover:text-primary-500">
                    <Icon
                      icon="bi:chevron-down"
                      className={`size-3 transition-transform duration-300 ease-in-out ${openSections.priceRange ? '' : '-rotate-180'}`}
                    />
                  </span>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.priceRange ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div>
                  <div className="mb-4 flex flex-col gap-3">
                    <div className="min-w-0 w-full">
                      <label className="block text-xs font-semibold text-grey-500 mb-1 uppercase tracking-wider">
                        Minimum
                      </label>
                      <div
                        className={`flex items-center gap-2 rounded-md border-2 bg-white px-3 py-2.5 transition-colors focus-within:border-primary-500 ${
                          priceRangeError ? 'border-red-400' : 'border-[#e6e6e6]'
                        }`}
                      >
                        <span className="shrink-0 text-sm font-semibold text-grey-500">GHS</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          step={1}
                          value={query.min_price || ''}
                          onChange={(e) => {
                            setQuery({
                              ...query,
                              min_price: normalizePriceInput(e.target.value),
                            })
                          }}
                          onBlur={clearInvalidMaxIfNeeded}
                          placeholder="0"
                          min={0}
                          aria-invalid={!!priceRangeError}
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-[#aaa]"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 w-full">
                      <label className="block text-xs font-semibold text-grey-500 mb-1 uppercase tracking-wider">
                        Maximum
                      </label>
                      <div
                        className={`flex items-center gap-2 rounded-md border-2 bg-white px-3 py-2.5 transition-colors focus-within:border-primary-500 ${
                          priceRangeError ? 'border-red-400' : 'border-[#e6e6e6]'
                        }`}
                      >
                        <span className="shrink-0 text-sm font-semibold text-grey-500">GHS</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          step={1}
                          value={query.max_price || ''}
                          onChange={(e) => {
                            setQuery({
                              ...query,
                              max_price: normalizePriceInput(e.target.value),
                            })
                          }}
                          onBlur={clearInvalidMaxIfNeeded}
                          placeholder="1000"
                          min={0}
                          aria-invalid={!!priceRangeError}
                          aria-describedby={priceRangeError ? 'price-range-error' : undefined}
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-[#aaa]"
                        />
                      </div>
                    </div>
                    {priceRangeError ? (
                      <p id="price-range-error" className="text-xs font-medium text-red-600 -mt-1">
                        {priceRangeError}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-grey-500 mb-2 uppercase tracking-wider">
                      Quick Select:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {priceRanges.map((range) => (
                        <button
                          key={range.label}
                          type="button"
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
        </div>
      )}

      {/* Filter Footer */}
      {!cardSelectionOnly && (
        <div className="p-4 border-t border-[#e6e6e6] bg-[#f8f9fa]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-grey-500 font-medium">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
            <button
              type="button"
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
  )
}
