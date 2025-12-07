import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { SearchBox } from '@/components'
import { VendorItems } from '../../components/VendorItems'
import { usePublicVendors, useVendorsFilters } from '../../hooks'

export default function Vendors() {
  const navigate = useNavigate()

  const { search, setSearch } = useVendorsFilters()
  const { data, isLoading, error } = usePublicVendors()

  const vendors = data?.data || []
  // const pagination = data?.pagination

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
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Icon
                icon="bi:arrow-repeat"
                className="text-5xl text-primary-500 mb-4 animate-spin"
              />
              <p className="text-grey-500">Loading vendors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Icon icon="bi:exclamation-triangle" className="text-5xl text-red-500 mb-4" />
              <p className="text-[#212529] font-extrabold text-lg mb-2">Failed to load vendors</p>
              <p className="text-sm text-grey-500">Please try again later</p>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-20 px-5 text-grey-500">
            <Icon icon="bi:shop" className="text-6xl text-[#e6e6e6] mb-4" />
            <h5 className="text-xl font-extrabold text-[#212529] mb-2">No vendors found</h5>
            <p className="text-sm text-grey-500">
              {search
                ? 'Try adjusting your search criteria'
                : 'No vendors are available at the moment'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${vendor.vendor_id}&id=${vendor.id}&name=${vendor.branch_name}`,
                    )
                  }
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <VendorItems
                    name={vendor.branch_name || vendor.vendor || 'Unnamed Vendor'}
                    shops={1}
                    rating={4.5}
                  />
                </div>
              ))}
            </div>

            {/* Pagination - TODO: Implement cursor-based pagination when API supports it */}
          </>
        )}
      </div>
    </div>
  )
}
