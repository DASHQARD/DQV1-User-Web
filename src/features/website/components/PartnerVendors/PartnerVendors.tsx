import { useNavigate } from 'react-router-dom'
import { VendorItems } from '../VendorItems'
import { Loader, Text } from '@/components'
import { usePublicCatalogQueries } from '../../hooks/website'

export const PartnerVendors = () => {
  const navigate = useNavigate()
  const { usePublicVendors } = usePublicCatalogQueries()
  const { data: vendors, isLoading } = usePublicVendors()
  console.log('vendors', vendors)

  const displayVendors = vendors?.slice(0, 4) || []

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <Text variant="h3" weight="medium" className="text-gray-900">
            Partner Vendors
          </Text>
          <button
            onClick={() => navigate('/vendors')}
            className="text-sm font-medium text-[#014fd3] hover:underline"
          >
            See more
          </button>
        </div>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : displayVendors.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">No vendors available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayVendors.map((vendor) => (
                <div
                  key={vendor.vendor_id}
                  onClick={() => navigate(`/vendor?vendor_id=${vendor.vendor_id}`)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <VendorItems
                    name={vendor.business_name || 'Unnamed Vendor'}
                    branches={vendor.branches_with_cards.length}
                    rating={4.5}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
