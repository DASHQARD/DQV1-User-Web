import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { useAuditLogs } from './useAuditLogs'

export default function AuditLogs() {
  const {
    query,
    setQuery,
    auditLogsData,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
    auditLogsColumns,
    auditLogsCsvHeaders,
  } = useAuditLogs()

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Audit Logs
          </Text>
        </div>
        <div className="relative space-y-[37px]">
          <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
            <Text variant="h6" weight="medium">
              All audit logs
            </Text>
          </div>
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={auditLogsColumns}
            data={auditLogsData}
            total={estimatedTotal}
            loading={isLoading}
            query={query}
            setQuery={setQuery}
            csvHeaders={auditLogsCsvHeaders}
            printTitle="Audit Logs"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            searchPlaceholder="Search by description"
          />
        </div>
      </div>
    </div>
  )
}
