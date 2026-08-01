import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { SearchBox, Loader, EmptyState, Combobox } from '@/components'
import { VendorItems } from '../../components/VendorItems'
import { usePublicCatalogQueries } from '../../hooks/website'
import { PUBLIC_VENDORS_QUERY, PUBLIC_CATALOG_STALE_MS } from '../../constants/publicCatalog'
import { vendorHasCatalogCards } from '../../utils/vendorCatalogStats'
import { buildVendorProfilePath } from '../../utils/vendorProfilePath'
import { EmptyStateImage } from '@/assets/images'

type VendorRow = {
  id?: number | string
  vendor_id?: number | string
  business_name?: string
  vendor_name?: string
  business_address?: string
  business_country?: string | null
  business_industry?: string
  industry?: string
  branches_with_cards?: Array<{
    branch_location?: string
    cards?: Array<{ card_type?: string; type?: string }>
  }>
}

function getVendorDisplayName(vendor: VendorRow): string {
  return vendor.business_name || vendor.vendor_name || 'Unnamed Vendor'
}

function getVendorIndustry(vendor: VendorRow): string {
  const direct = vendor.business_industry || vendor.industry
  if (direct?.trim()) return direct.trim()
  return ''
}

function getVendorLocations(vendor: VendorRow): string[] {
  const locations = new Set<string>()
  const country = vendor.business_country?.trim()
  if (country) locations.add(country)
  const address = vendor.business_address?.trim()
  if (address) locations.add(address)
  for (const branch of vendor.branches_with_cards || []) {
    const loc = branch.branch_location?.trim()
    if (loc) locations.add(loc)
  }
  return Array.from(locations)
}

function getVendorCategories(vendor: VendorRow): string[] {
  const categories = new Set<string>()
  for (const branch of vendor.branches_with_cards || []) {
    for (const card of branch.cards || []) {
      const type = String(card.card_type || card.type || '')
        .trim()
        .toLowerCase()
      if (!type) continue
      if (type.includes('dashx')) categories.add('DashX')
      else if (type.includes('dashpass')) categories.add('DashPass')
      else if (type.includes('dashgo')) categories.add('DashGo')
      else if (type.includes('dashpro')) categories.add('DashPro')
    }
  }
  return Array.from(categories)
}

export default function Vendors() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [industry, setIndustry] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [location, setLocation] = React.useState('')
  const { usePublicVendors } = usePublicCatalogQueries()
  const { data: vendors, isLoading: vendorsLoading } = usePublicVendors(PUBLIC_VENDORS_QUERY, {
    staleTime: PUBLIC_CATALOG_STALE_MS,
  })

  const vendorsWithCards = React.useMemo(
    () =>
      (vendors as VendorRow[] | undefined)?.filter((vendor) =>
        vendorHasCatalogCards(vendor.branches_with_cards || []),
      ) ?? [],
    [vendors],
  )

  const industryOptions = React.useMemo(() => {
    const values = new Set<string>()
    for (const vendor of vendorsWithCards) {
      const value = getVendorIndustry(vendor)
      if (value) values.add(value)
    }
    return [
      { label: 'All industries', value: '' },
      ...Array.from(values)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value })),
    ]
  }, [vendorsWithCards])

  const categoryOptions = React.useMemo(() => {
    const values = new Set<string>()
    for (const vendor of vendorsWithCards) {
      getVendorCategories(vendor).forEach((value) => values.add(value))
    }
    return [
      { label: 'All categories', value: '' },
      ...Array.from(values)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value })),
    ]
  }, [vendorsWithCards])

  const locationOptions = React.useMemo(() => {
    const values = new Set<string>()
    for (const vendor of vendorsWithCards) {
      getVendorLocations(vendor).forEach((value) => values.add(value))
    }
    return [
      { label: 'All locations', value: '' },
      ...Array.from(values)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value })),
    ]
  }, [vendorsWithCards])

  const visibleVendors = vendorsWithCards.filter((vendor) => {
    if (search.trim()) {
      const vendorName = getVendorDisplayName(vendor).toLowerCase()
      if (!vendorName.includes(search.trim().toLowerCase())) return false
    }
    if (industry) {
      if (getVendorIndustry(vendor).toLowerCase() !== industry.toLowerCase()) return false
    }
    if (category) {
      if (!getVendorCategories(vendor).includes(category)) return false
    }
    if (location) {
      if (!getVendorLocations(vendor).some((loc) => loc.toLowerCase() === location.toLowerCase())) {
        return false
      }
    }
    return true
  })

  const hasActiveFilters = Boolean(search.trim() || industry || category || location)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-500 via-primary-600 to-primary-700 text-white pt-24 md:pt-28 pb-12 md:pb-16 -mt-[72px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>
        <div className="wrapper relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <Icon icon="bi:building" className="size-5" />
              <span className="text-sm font-medium">Partner Vendor Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight">
              Partner Vendor Network
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Explore our network of trusted vendors offering the best gift cards and services
              across Ghana.
            </p>
          </div>
        </div>
      </section>

      <div className="wrapper py-8 md:py-12">
        {/* Search & Filters */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <SearchBox
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search vendors by name..."
                className="w-full"
              />
            </div>
            {visibleVendors.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <Icon icon="bi:building" className="size-4 text-primary-600" />
                <span className="font-medium">
                  {visibleVendors.length} {visibleVendors.length === 1 ? 'Vendor' : 'Vendors'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Combobox
              placeholder="Industry"
              options={industryOptions}
              value={industry}
              onChange={(e: { target: { value: string } }) => setIndustry(e.target.value)}
            />
            <Combobox
              placeholder="Category"
              options={categoryOptions}
              value={category}
              onChange={(e: { target: { value: string } }) => setCategory(e.target.value)}
            />
            <Combobox
              placeholder="Location"
              options={locationOptions}
              value={location}
              onChange={(e: { target: { value: string } }) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Vendors Grid */}
        {vendorsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : visibleVendors.length === 0 ? (
          <div className="py-12">
            <EmptyState
              image={EmptyStateImage}
              title={hasActiveFilters ? 'No vendors found' : 'No vendors available'}
              description={
                hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new partner vendors'
              }
            />
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {visibleVendors.map((vendor) => {
              const vendorName = getVendorDisplayName(vendor)
              return (
                <div
                  key={vendor.id || vendor.vendor_id}
                  onClick={() => navigate(buildVendorProfilePath(vendor))}
                  className="h-full cursor-pointer"
                >
                  <VendorItems
                    name={vendorName}
                    logo={(vendor as { logo?: string }).logo}
                    logo_key={(vendor as { logo_key?: string }).logo_key}
                    business_logo={(vendor as { business_logo?: string }).business_logo}
                    businessAddress={vendor.business_address}
                    businessCountry={vendor.business_country ?? undefined}
                    branchesWithCards={vendor.branches_with_cards || []}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
