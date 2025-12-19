import React from 'react'
import { Text, Button } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { InviteAdmin } from '../../../components/corporate/modals/InviteAdmin'

type AdminData = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  invited_at: string
  last_active?: string
}

// Mock data for admins
const MOCK_ADMINS: AdminData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Super Admin',
    status: 'active',
    invited_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    role: 'Admin',
    status: 'active',
    invited_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_active: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'Admin',
    status: 'pending',
    invited_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.brown@example.com',
    role: 'Viewer',
    status: 'active',
    invited_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_active: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function formatDate(timestamp: string): string {
  if (!timestamp) return 'N/A'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const year = dateObj.getFullYear()

  return `${day} ${month} ${year}`
}

function formatLastActive(timestamp: string): string {
  if (!timestamp) return 'Never'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'Never'

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins} min ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

function getStatusBadge(status: AdminData['status']) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status]
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Table columns for admins
const adminsColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }: any) => {
      const admin = row.original as AdminData
      return (
        <div>
          <Text variant="span" className="text-sm font-medium text-gray-900">
            {admin.name}
          </Text>
          <Text variant="span" className="text-xs text-gray-500 block">
            {admin.email}
          </Text>
        </div>
      )
    },
  },
  {
    header: 'Role',
    accessorKey: 'role',
    cell: ({ row }: any) => {
      const admin = row.original as AdminData
      return (
        <Text variant="span" className="text-sm text-gray-700">
          {admin.role}
        </Text>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }: any) => {
      const admin = row.original as AdminData
      return getStatusBadge(admin.status)
    },
  },
  {
    header: 'Invited',
    accessorKey: 'invited_at',
    cell: ({ row }: any) => {
      const admin = row.original as AdminData
      return (
        <Text variant="span" className="text-xs text-gray-500">
          {formatDate(admin.invited_at)}
        </Text>
      )
    },
  },
  {
    header: 'Last Active',
    accessorKey: 'last_active',
    cell: ({ row }: any) => {
      const admin = row.original as AdminData
      return (
        <Text variant="span" className="text-xs text-gray-500">
          {formatLastActive(admin.last_active || '')}
        </Text>
      )
    },
  },
]

const adminsCsvHeaders = [
  { label: 'Name', key: 'name' },
  { label: 'Email', key: 'email' },
  { label: 'Role', key: 'role' },
  { label: 'Status', key: 'status' },
  { label: 'Invited At', key: 'invited_at' },
  { label: 'Last Active', key: 'last_active' },
]

export default function Admins() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Admins
          </Text>
          <InviteAdmin />
        </div>
        <div className="relative space-y-[37px]">
          <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
            <Text variant="h6" weight="medium">
              All admins
            </Text>
          </div>
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={adminsColumns}
            data={MOCK_ADMINS}
            total={MOCK_ADMINS.length}
            loading={false}
            query={query}
            setQuery={setQuery}
            csvHeaders={adminsCsvHeaders}
            printTitle="Admins"
          />
        </div>
      </div>
    </div>
  )
}
