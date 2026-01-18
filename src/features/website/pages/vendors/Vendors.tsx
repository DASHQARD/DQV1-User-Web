import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { SearchBox, Loader, EmptyState } from '@/components'
import { VendorItems } from '../../components/VendorItems'
import { usePublicCatalog } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'

export default function Vendors() {
  const navigate = useNavigate()
  const { vendors, vendorsLoading, query, setQuery } = usePublicCatalog()

  const vendorsWithCards = vendors?.filter((vendor) => {
    // Filter out vendors without branches
    if (!vendor.branches_with_cards || vendor.branches_with_cards.length === 0) {
      return false
    }
    // Filter out vendors where branches don't have any cards
    return vendor.branches_with_cards.some((branch: any) => branch.cards && branch.cards.length > 0)
  })

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
              <span className="text-sm font-medium">Partner Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight">
              Discover Our Partner Vendors
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Explore our network of trusted vendors offering the best gift cards and services
              across Ghana.
            </p>
          </div>
        </div>
      </section>

      <div className="wrapper py-8 md:py-12">
        {/* Search Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <SearchBox
                value={query.search || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery({ ...query, search: e.target.value })
                }
                placeholder="Search vendors by name..."
                className="w-full"
              />
            </div>
            {vendorsWithCards && vendorsWithCards.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <Icon icon="bi:building" className="size-4 text-primary-600" />
                <span className="font-medium">
                  {vendorsWithCards.length} {vendorsWithCards.length === 1 ? 'Vendor' : 'Vendors'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Vendors Grid */}
        {vendorsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : vendorsWithCards?.length === 0 ? (
          <div className="py-12">
            <EmptyState
              image={EmptyStateImage}
              title={query.search ? 'No vendors found' : 'No vendors available'}
              description={
                query.search
                  ? 'Try adjusting your search criteria or browse all vendors'
                  : 'Check back soon for new partner vendors'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {vendorsWithCards?.map((vendor: any) => {
              const vendorName = vendor.business_name || vendor.vendor_name || 'Unnamed Vendor'
              return (
                <div
                  key={vendor.id || vendor.vendor_id}
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${vendor.vendor_id}&id=${vendor.id || vendor.vendor_id}&name=${encodeURIComponent(vendorName)}`,
                    )
                  }
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  <VendorItems
                    name={vendorName}
                    branches={vendor.branches_with_cards?.length || 0}
                    rating={4.5}
                    business_logo={(vendor as any).business_logo || null}
                    businessAddress={(vendor as any).business_address}
                    businessCountry={(vendor as any).business_country}
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
