import { PARTNER_VENDORS_MOCKS } from '@/mocks'
import { VendorItems } from '../VendorItems'
import type { VendorItemProps } from '@/types'
import { usePublicVendors } from '../../hooks'
import { Text } from '@/components'

export const PartnerVendors = () => {
  const { data } = usePublicVendors()
  console.log('data', data)

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <Text variant="h3" weight="medium" className="text-gray-900">
            Partner Vendors
          </Text>
          <button className="text-sm font-medium text-[#014fd3]">See more</button>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PARTNER_VENDORS_MOCKS.map((vendor: VendorItemProps, idx: number) => (
              <VendorItems key={idx} {...vendor} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
