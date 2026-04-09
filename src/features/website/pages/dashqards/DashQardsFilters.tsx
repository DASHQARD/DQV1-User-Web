import { useState } from 'react'
import { Icon } from '@/libs'

import type { DashQardsTabId, DashQardsVendor } from '../../hooks/useDashQards'

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
}

const SECTION_KEYS = ['cardSelection', 'search', 'vendors', 'priceRange'] as const
type SectionKey = (typeof SECTION_KEYS)[number]

function sanitizeNonNegativePrice(value: string): string | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return undefined
  return String(Math.max(0, parsed))
}

function parsePrice(value?: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return Math.max(0, parsed)
}

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
}: DashQardsFiltersProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    () => Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<SectionKey, boolean>,
  )

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeFiltersCount = [
    query.min_price,
    query.max_price,
    query.search,
    query.vendor_ids,
  ].filter(Boolean).length

  return (
    <aside className="bg-white border border-[#e6e6e6] rounded-xl sticky top-[120px] w-[280px] max-h-[calc(100vh-140px)] overflow-y-auto shrink-0 max-lg:w-[260px] max-md:static max-md:w-full max-md:max-h-none max-md:overflow-y-visible">
      <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e6e6e6]">
        <div className="flex-1">
          <h3 className="text-xl font-extrabold text-[#212529] mb-1">Filter Results</h3>
          <p className="text-sm text-grey-500 font-medium">{cardsCount} cards available</p>
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
      <div className="border-b border-[#f0f0f0] last:border-b-0">
        <div>
          {/* Search Filter */}
          <div className={openSections.search ? 'p-5 pt-0' : ''}>
            <button
              type="button"
              onClick={() => toggleSection('search')}
              className={`flex justify-between items-center w-full py-4 px-5 cursor-pointer transition-colors text-left -mx-0.5 rounded-md ${
                openSections.search
                  ? 'mb-3 hover:bg-primary-500/5'
                  : 'bg-[#f8f9fa] hover:bg-[#f0f1f3]'
              }`}
            >
              <h5 className="text-[15px] font-semibold text-[#212529]">Search</h5>
              <div className="flex items-center gap-2">
                {query.search && (
                  <span className="text-xs text-[#28a745] font-semibold bg-[#d4edda] px-2 py-0.5 rounded-xl">
                    Active
                  </span>
                )}
                <span className="w-6 h-6 flex items-center justify-center text-grey-500 rounded-full transition-all duration-300 ease-in-out hover:bg-primary-500/10 hover:text-primary-500">
                  <Icon
                    icon="bi:chevron-down"
                    className={`size-3 transition-transform duration-300 ease-in-out ${openSections.search ? '' : '-rotate-180'}`}
                  />
                </span>
              </div>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.search ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="relative">
                <Icon
                  icon="bi:search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={query.search || ''}
                  onChange={(e) => setQuery({ ...query, search: e.target.value || undefined })}
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
          <div className={`border-t border-[#e8e8e8] ${openSections.vendors ? 'px-6 pb-5' : ''}`}>
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
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.priceRange ? 'max-h-[380px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
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
                        onChange={(e) => {
                          const nextMin = parsePrice(sanitizeNonNegativePrice(e.target.value))
                          const currentMax = parsePrice(query.max_price)
                          const safeMin =
                            nextMin !== null && currentMax !== null
                              ? Math.min(nextMin, currentMax)
                              : nextMin
                          setQuery({
                            ...query,
                            min_price: safeMin !== null ? String(safeMin) : undefined,
                          })
                        }}
                        placeholder="0"
                        min={0}
                        max={query.max_price || undefined}
                        className="w-full pl-7 pr-3 py-2.5 border-2 border-[#e6e6e6] rounded-md text-sm font-medium bg-white transition-colors focus:outline-none focus:border-primary-500 placeholder:text-[#aaa]"
                      />
                    </div>
                  </div>
                  <div className="w-5 h-0.5 bg-[#ddd] mb-3.5 rounded" />
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
                        onChange={(e) => {
                          const nextMax = parsePrice(sanitizeNonNegativePrice(e.target.value))
                          const currentMin = parsePrice(query.min_price)
                          const safeMax =
                            nextMax !== null && currentMin !== null
                              ? Math.max(nextMax, currentMin)
                              : nextMax
                          setQuery({
                            ...query,
                            max_price: safeMax !== null ? String(safeMax) : undefined,
                          })
                        }}
                        placeholder="1000"
                        min={query.min_price || 0}
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

      {/* Filter Footer */}
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
    </aside>
  )
}
