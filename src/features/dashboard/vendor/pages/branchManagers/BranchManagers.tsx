import { useMemo, useCallback } from 'react'
import { Text, PaginatedTable } from '@/components'
import {
  branchManagerInvitationsListCsvHeaders,
  branchManagerInvitationsListColumns,
} from '@/features/dashboard/components/vendors/tableConfigs'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType, GetBranchManagerInvitationsQuery } from '@/types'
import { useReducerSpread } from '@/hooks'
import { vendorQueries } from '../../hooks'

export default function BranchManagers() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const apiQuery = useMemo((): GetBranchManagerInvitationsQuery => {
    const params: GetBranchManagerInvitationsQuery = {
      limit: Number(query.limit) || 10,
    }
    if (query.after) params.after = query.after
    if (query.search) params.search = query.search
    if ((query as any).status) params.status = (query as any).status
    if (query.dateFrom) params.dateFrom = query.dateFrom
    if (query.dateTo) params.dateTo = query.dateTo
    return params
  }, [query])

  const { useGetBranchManagerInvitationsService } = vendorQueries()
  const { data: invitationsResponse, isLoading: isLoadingInvitations } =
    useGetBranchManagerInvitationsService(apiQuery)

  const invitations = useMemo(() => {
    if (!invitationsResponse) return []
    return Array.isArray(invitationsResponse?.data) ? invitationsResponse.data : []
  }, [invitationsResponse])

  const pagination = invitationsResponse?.pagination

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  const estimatedTotal = useMemo(() => {
    return pagination?.hasNextPage
      ? invitations.length + (Number(query.limit) || 10)
      : invitations.length
  }, [pagination, invitations.length, query.limit])

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Branch Managers
          </Text>
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={branchManagerInvitationsListColumns}
            data={invitations}
            total={estimatedTotal}
            loading={isLoadingInvitations}
            query={query}
            setQuery={setQuery}
            searchPlaceholder="Search by email or name..."
            csvHeaders={branchManagerInvitationsListCsvHeaders}
            printTitle="Branch Manager Invitations"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
