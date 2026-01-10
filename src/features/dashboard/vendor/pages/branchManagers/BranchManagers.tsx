import React from 'react'
import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
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

  // Build the query params for the API
  const apiQuery: GetBranchManagerInvitationsQuery = React.useMemo(() => {
    const queryParams: GetBranchManagerInvitationsQuery = {}

    if (query.limit) {
      queryParams.limit = Number(query.limit)
    }

    if (query.after) {
      queryParams.after = query.after
    }

    if (query.search) {
      queryParams.search = query.search
    }

    if (query.status) {
      queryParams.status = query.status
    }

    if (query.dateFrom) {
      queryParams.dateFrom = query.dateFrom
    }

    if (query.dateTo) {
      queryParams.dateTo = query.dateTo
    }

    return queryParams
  }, [query])

  const { useGetBranchManagerInvitationsService } = vendorQueries()
  const { data: invitationsResponse, isLoading: isLoadingInvitations } =
    useGetBranchManagerInvitationsService(apiQuery)

  // Extract data array from response
  const invitations = React.useMemo(() => {
    if (!invitationsResponse) return []
    return Array.isArray(invitationsResponse)
      ? invitationsResponse
      : Array.isArray(invitationsResponse?.data)
        ? invitationsResponse.data
        : []
  }, [invitationsResponse])

  // Calculate total for pagination
  const total = React.useMemo(() => {
    if (invitationsResponse?.pagination) {
      // If pagination info is available, use it
      return invitations.length
    }
    return invitations.length
  }, [invitationsResponse, invitations])

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Branch Managers
          </Text>
        </div>
        <div className="relative space-y-[37px]">
          <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
            <Text variant="h6" weight="medium">
              Branch Manager Invitations ({total})
            </Text>
          </div>
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={branchManagerInvitationsListColumns}
            data={invitations}
            total={total}
            loading={isLoadingInvitations}
            query={query}
            setQuery={setQuery}
            searchPlaceholder="Search by email or name..."
            csvHeaders={branchManagerInvitationsListCsvHeaders}
            filterBy={{
              simpleSelects: [
                {
                  label: 'status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Accepted', value: 'accepted' },
                    { label: 'Rejected', value: 'rejected' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ],
            }}
            printTitle="Branch Manager Invitations"
          />
        </div>
      </div>
    </div>
  )
}
