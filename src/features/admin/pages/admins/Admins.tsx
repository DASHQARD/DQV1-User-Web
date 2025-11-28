import { useState, useMemo } from 'react'
import { Icon } from '@/libs'
import { DataTable, Input, Loader, Button } from '@/components'
import type { ColumnDef } from '@tanstack/react-table'
import type { Admin } from '@/types/admin'
import { cn } from '@/libs'
import { InviteAdminModal } from './InviteAdminModal'

// TODO: Replace with actual API call when available
const mockAdmins: Admin[] = []

export default function Admins() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // TODO: Replace with actual hook when API is available
  const isLoading = false
  const admins = mockAdmins

  const columns: ColumnDef<Admin>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-medium text-gray-900">#{row.original.id}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-gray-900">{row.original.email || 'N/A'}</span>,
      },
      {
        accessorKey: 'first_name',
        header: 'First Name',
        cell: ({ row }) => (
          <span className="text-gray-900">{row.original.first_name || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        cell: ({ row }) => <span className="text-gray-900">{row.original.last_name || 'N/A'}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-gray-600 capitalize">{row.original.type || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusValue = row.original.status
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            active: 'bg-blue-100 text-blue-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
          }
          return (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusColors[statusValue] || 'bg-gray-100 text-gray-800',
              )}
            >
              {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
            </span>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <span className="text-gray-600">
              {date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )
        },
      },
    ],
    [],
  )

  // Statistics
  const totalAdmins = admins.length
  const activeAdmins = admins.filter((a) => a.status === 'active').length
  const pendingAdmins = admins.filter((a) => a.status === 'pending').length
  const inactiveAdmins = admins.filter((a) => a.status === 'inactive').length

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admins</h1>
            <p className="text-gray-600">Manage admin users and permissions</p>
          </div>
          <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
            <Icon icon="bi:person-plus" className="mr-2" />
            Invite Admin
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Icon icon="bi:people" className="text-2xl text-primary-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeAdmins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Icon icon="bi:check-circle" className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAdmins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon icon="bi:clock-history" className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveAdmins}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon icon="bi:x-circle" className="text-2xl text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-[200px]">
              <select
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer transition-colors focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25 hover:border-gray-400"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="w-[150px]">
              <select
                value={limit}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setLimit(Number(e.target.value))
                }
                className="w-full border-2 border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer transition-colors focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25 hover:border-gray-400"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : (
            <DataTable columns={columns} data={admins} />
          )}
        </div>
      </div>

      {/* Invite Admin Modal */}
      <InviteAdminModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  )
}
