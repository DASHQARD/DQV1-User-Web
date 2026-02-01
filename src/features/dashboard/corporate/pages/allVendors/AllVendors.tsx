import { Text, PaginatedTable } from '@/components'
import { allVendorsListColumns, allVendorsListCsvHeaders } from '@/features/dashboard/components'
import { useAllVendors } from '@/features/dashboard/hooks'
import { OPTIONS } from '@/utils/constants/filter'

export default function AllVendors() {
  const {
    query,
    vendorList,
    pagination,
    isLoading,
    setQuery,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  } = useAllVendors()

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            All Vendors
          </Text>
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={allVendorsListColumns}
            data={vendorList}
            total={estimatedTotal}
            loading={isLoading}
            query={query}
            setQuery={setQuery}
            csvHeaders={allVendorsListCsvHeaders}
            searchPlaceholder="Search vendors"
            printTitle="All Vendors"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              simpleSelects: [{ label: 'status', options: OPTIONS.VENDOR_STATUS }],
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
