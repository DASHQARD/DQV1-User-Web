import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components'
import { PARTNER_VENDORS_MOCKS } from '@/mocks'
import { VendorItems } from '../VendorItems'
import type { VendorItemProps } from '@/types'

export const PartnerVendors = () => {
  return (
    <section className="py-12 bg-white">
      <div className="wrapper flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[clamp(22px,2.4vw,28px)] font-extrabold text-gray-900">
            Partner Vendors
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PARTNER_VENDORS_MOCKS.map((vendor: VendorItemProps, idx: number) => (
            <VendorItems key={idx} {...vendor} />
          ))}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  )
}
