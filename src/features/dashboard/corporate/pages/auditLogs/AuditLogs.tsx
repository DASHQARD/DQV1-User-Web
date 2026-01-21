import { DateCell, StatusCell, Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { cn } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { ActivityData, QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { corporateQueries } from '../../hooks'
import { useMemo, useCallback } from 'react'

const actionStyles: Record<'Create' | 'Modify', string> = {
  Create: 'text-success-600',
  Modify: 'text-warning-400',
}

function getActionType(action: string): 'Create' | 'Modify' {
  const lowerAction = action.toLowerCase()

  if (
    lowerAction.includes('create') ||
    lowerAction.includes('created') ||
    lowerAction.includes('add') ||
    lowerAction.includes('new')
  ) {
    return 'Create'
  }
  return 'Modify'
}

function formatActorType(actorType: string): string {
  if (!actorType) return 'Admin'
  return actorType.charAt(0).toUpperCase() + actorType.slice(1)
}

function getActivityDescription(description: string, action: string): string {
  // Use description if available, otherwise format the action
  if (description) {
    return description.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Fallback: create a readable description from the action
  return action
    .replace(/_/g, ' ')
    .replace(/ADMIN\s+/i, '')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Table columns for audit logs
const auditLogsColumns = [
  {
    header: 'Actor',
    accessorKey: 'actor',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const actor = activity.name || activity.user_email || 'System'
      const role = formatActorType(activity.user_type || 'admin')
      return (
        <div className="flex items-center gap-2">
          <Text variant="span" className="text-sm text-gray-800">
            {actor}
          </Text>
          <Text variant="span" className="text-xs text-gray-500 ml-1">
            – {role}
          </Text>
        </div>
      )
    },
  },
  {
    header: 'Action',
    accessorKey: 'action',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const actionType = getActionType(activity.action)
      return (
        <Text variant="span" className={cn('text-xs font-medium', actionStyles[actionType])}>
          {actionType}
        </Text>
      )
    },
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const description = getActivityDescription(activity.description, activity.action)
      return (
        <Text variant="span" className="text-sm text-gray-600 line-clamp-1">
          {description}
        </Text>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
    cell: DateCell,
  },
]

const auditLogsCsvHeaders = [
  { name: 'Actor', accessor: 'name' },
  { name: 'Email', accessor: 'user_email' },
  { name: 'Role', accessor: 'user_type' },
  { name: 'Action', accessor: 'action' },
  { name: 'Description', accessor: 'description' },
  { name: 'Status', accessor: 'status' },
  { name: 'Date', accessor: 'created_at' },
]

export default function AuditLogs() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAuditLogsCorporateService } = corporateQueries()

  const params = useMemo(() => {
    const apiParams: any = {
      limit: query.limit || 10,
    }
    if (query.after) {
      apiParams.after = query.after
    }
    if (query.search) {
      apiParams.search = query.search
    }
    return apiParams
  }, [query])

  const { data: auditLogsResponse, isLoading } = useGetAuditLogsCorporateService(params)

  // Extract data and pagination from response
  const auditLogsData = auditLogsResponse?.data || []
  const pagination = auditLogsResponse?.pagination

  // Handle cursor-based pagination
  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination?.hasNextPage, pagination?.next, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  // Calculate estimated total for display
  const estimatedTotal = pagination?.hasNextPage
    ? auditLogsData.length + (query.limit || 10)
    : auditLogsData.length

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
