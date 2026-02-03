import { useMemo, useCallback } from 'react'
import { DateCell, StatusCell, Text } from '@/components'
import { cn } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { ActivityData, QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { corporateQueries } from '../../hooks'

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
  if (description) {
    return description.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }
  return action
    .replace(/_/g, ' ')
    .replace(/ADMIN\s+/i, '')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const auditLogsCsvHeaders = [
  { name: 'Actor', accessor: 'name' },
  { name: 'Email', accessor: 'user_email' },
  { name: 'Role', accessor: 'user_type' },
  { name: 'Action', accessor: 'action' },
  { name: 'Description', accessor: 'description' },
  { name: 'Status', accessor: 'status' },
  { name: 'Date', accessor: 'created_at' },
]

const auditLogsColumns = [
  {
    header: 'Actor',
    accessorKey: 'actor',
    cell: ({ row }: { row: { original: ActivityData } }) => {
      const activity = row.original
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
    cell: ({ row }: { row: { original: ActivityData } }) => {
      const activity = row.original
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
    cell: ({ row }: { row: { original: ActivityData } }) => {
      const activity = row.original
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

export function useAuditLogs() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAuditLogsCorporateService } = corporateQueries()

  const params = useMemo(() => {
    const apiParams: Record<string, unknown> = {
      limit: query.limit || 10,
    }
    if (query.after) apiParams.after = query.after
    if (query.search) apiParams.search = query.search
    return apiParams
  }, [query])

  const { data: auditLogsResponse, isLoading } = useGetAuditLogsCorporateService(params)
  const auditLogsData = auditLogsResponse?.data || []
  const pagination = auditLogsResponse?.pagination

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

  const estimatedTotal = useMemo(
    () =>
      pagination?.hasNextPage
        ? auditLogsData.length + (Number(query.limit) || 10)
        : auditLogsData.length,
    [pagination?.hasNextPage, auditLogsData.length, query.limit],
  )

  return {
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
  }
}
