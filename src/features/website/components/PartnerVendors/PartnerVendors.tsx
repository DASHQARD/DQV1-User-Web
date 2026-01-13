import { useNavigate } from 'react-router-dom'
import { VendorItems } from '../VendorItems'
import { Loader, Text, EmptyState } from '@/components'
import { usePublicCatalogQueries } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'

export const PartnerVendors = () => {
  const navigate = useNavigate()
  const { usePublicVendors } = usePublicCatalogQueries()
  const { data: vendors, isLoading } = usePublicVendors()

  const vendorsWithCards = vendors?.filter((vendor) => vendor.branches_with_cards?.length > 0)

  return (
    <section className="py-8 md:py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl shadow-sm">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Text variant="h3" weight="medium" className="text-gray-900">
            Partner Vendors
          </Text>
          <button
            onClick={() => navigate('/vendors')}
            className="text-sm font-medium text-[#014fd3] hover:underline whitespace-nowrap transition-colors"
          >
            See more
          </button>
        </div>

        <div className="px-4 md:px-6 pb-4 md:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : vendorsWithCards?.length === 0 ? (
            <EmptyState
              image={EmptyStateImage}
              title="No vendors available"
              description="Check back soon for new partner vendors or browse our full collection."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {vendorsWithCards?.map((vendor) => (
                <div
                  key={vendor.vendor_id}
                  onClick={() => navigate(`/vendor?vendor_id=${vendor.vendor_id}`)}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  <VendorItems
                    name={vendor.business_name || 'Unnamed Vendor'}
                    branches={vendor.branches_with_cards?.length || 0}
                    rating={4.5}
                    business_logo={(vendor as any).business_logo || null}
                    businessAddress={(vendor as any).business_address}
                    businessCountry={(vendor as any).business_country}
                    branchesWithCards={vendor.branches_with_cards || []}
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
