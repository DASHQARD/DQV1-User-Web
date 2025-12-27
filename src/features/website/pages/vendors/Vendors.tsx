import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { SearchBox, Loader } from '@/components'
import { VendorItems } from '../../components/VendorItems'
import { usePublicCatalog } from '../../hooks/website'

export default function Vendors() {
  const navigate = useNavigate()
  const { vendors, vendorsLoading, query, setQuery } = usePublicCatalog()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-500 to-primary-700 text-white pt-20 pb-12 -mt-[72px]">
        <div className="wrapper">
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 items-center max-md:grid-cols-1 max-md:text-center max-md:gap-8">
            <div className="hero__text">
              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight">
                Discover Our Partner Vendors
              </h1>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                Explore our network of trusted vendors offering the best gift cards and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrapper py-12">
        {/* Search and Sort Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <SearchBox
                value={query.search || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery({ ...query, search: e.target.value })
                }
                placeholder="Search vendors..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {vendorsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : vendors?.length === 0 ? (
          <div className="text-center py-20 px-5 text-grey-500">
            <Icon icon="bi:shop" className="text-6xl text-[#e6e6e6] mb-4" />
            <h5 className="text-xl font-extrabold text-[#212529] mb-2">No vendors found</h5>
            <p className="text-sm text-grey-500">
              {query.search
                ? 'Try adjusting your search criteria'
                : 'No vendors are available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {vendors?.map((vendor: any) => (
                <div
                  key={vendor.id}
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${vendor.vendor_id}&id=${vendor.id}&name=${encodeURIComponent(vendor.branch_name || '')}`,
                    )
                  }
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <VendorItems
                    name={vendor.branch_name || 'Unnamed Vendor'}
                    branches={vendor.branches_with_cards.length}
                    rating={4.5}
                  />
                </div>
              ))}
            </div>

            {/* Pagination - TODO: Implement cursor-based pagination when API supports it */}
            {/* Note: VendorDetailsResponse is an array, pagination info would need to come from API response wrapper if available */}
          </>
        )}
      </div>
    </div>
  )
}
