import { useNavigate } from 'react-router-dom'
import { VendorItems } from '../VendorItems'
import { Loader, Text, EmptyState } from '@/components'
import { useHomePageCatalog } from '../../hooks/website/useHomePageCatalog'
import { Icon } from '@/libs'
import { EmptyStateImage } from '@/assets/images'
import { vendorHasCatalogCards } from '../../utils/vendorCatalogStats'

type VendorWithCards = NonNullable<ReturnType<typeof useHomePageCatalog>['vendors']>[number]

export const PartnerVendors = () => {
  const navigate = useNavigate()
  const { vendors, isLoadingVendors: isLoading } = useHomePageCatalog()

  const vendorsWithCards =
    vendors?.filter((vendor) => vendorHasCatalogCards(vendor.branches_with_cards || [])) ?? []

  const openVendor = (vendorId: string | number) => {
    navigate(`/vendor?vendor_id=${vendorId}`)
  }

  const renderVendor = (vendor: VendorWithCards, variant: 'default' | 'compact') => (
    <div
      role="link"
      tabIndex={0}
      onClick={() => openVendor(vendor.vendor_id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openVendor(vendor.vendor_id)
        }
      }}
      className="h-full cursor-pointer"
    >
      <VendorItems
        variant={variant}
        name={vendor.business_name || 'Unnamed Vendor'}
        logo={vendor.logo}
        logo_key={vendor.logo_key}
        business_logo={(vendor as { business_logo?: string }).business_logo}
        businessAddress={(vendor as { business_address?: string }).business_address}
        businessCountry={vendor.business_country ?? undefined}
        branchesWithCards={vendor.branches_with_cards || []}
      />
    </div>
  )

  return (
    <section className="w-full max-md:bg-transparent max-md:shadow-none max-md:border-0 md:rounded-2xl md:bg-white md:shadow-sm md:border md:border-gray-100/80">
      <div className="flex flex-col gap-4 md:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-3 max-md:px-2">
          <Text variant="h3" weight="medium" className="text-gray-900">
            Partner Vendors
          </Text>
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="inline-flex items-center gap-0.5 text-sm font-medium text-[#014fd3] hover:text-[#0139a8] whitespace-nowrap shrink-0"
          >
            All
            <Icon icon="bi:chevron-right" className="size-4" aria-hidden />
          </button>
        </div>

        <div>
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
            <>
              <div
                className="md:hidden flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory pl-2 pr-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Partner vendors carousel"
              >
                {vendorsWithCards.map((vendor) => (
                  <div
                    key={vendor.vendor_id}
                    className="snap-start shrink-0 w-[min(300px,calc(100vw-1rem))]"
                  >
                    {renderVendor(vendor, 'compact')}
                  </div>
                ))}
              </div>

              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vendorsWithCards.map((vendor) => (
                  <div key={vendor.vendor_id}>{renderVendor(vendor, 'default')}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
