import React, { useState, useMemo } from 'react'
import { Icon } from '@/libs'
import { DataTable, Input, Loader, Dropdown } from '@/components'
import type { ColumnDef } from '@tanstack/react-table'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '@/types/customer'
import { cn } from '@/libs'
import { CustomerDetailsModal } from './CustomerDetailsModal'
import { UpdateCustomerStatusModal } from './UpdateCustomerStatusModal'

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Verified', value: 'verified' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function Customers() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [after, setAfter] = useState<string | undefined>(undefined)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { data, isLoading, error } = useCustomers({
    limit,
    status: status || undefined,
    search: search || undefined,
    after,
  })

  console.log('customers', data)

  const customers = data?.data || []
  const pagination = data?.pagination

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowStatusModal(true)
  }

  const columns: ColumnDef<Customer>[] = useMemo(
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
        accessorKey: 'fullname',
        header: 'Full Name',
        cell: ({ row }) => <span className="text-gray-900">{row.original.fullname || 'N/A'}</span>,
      },
      {
        accessorKey: 'phonenumber',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.phonenumber || 'N/A'}</span>
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
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const customer = row.original
          return (
            <Dropdown
              actions={[
                {
                  label: 'View Customer Details',
                  onClickFn: () => handleViewDetails(customer),
                },
                {
                  label: 'Update Customer Status',
                  onClickFn: () => handleUpdateStatus(customer),
                },
              ]}
              align="end"
            >
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                title="Actions"
              >
                <Icon icon="bi:three-dots-vertical" className="text-xl" />
              </button>
            </Dropdown>
          )
        },
      },
    ],
    [],
  )

  const handleNextPage = () => {
    if (pagination?.next) {
      setAfter(pagination.next)
    }
  }

  const handlePreviousPage = () => {
    setAfter(undefined)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <Icon icon="bi:exclamation-triangle" className="text-4xl text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load customers</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="pb-6 border-b border-[#e9ecef]">
          <div className="flex justify-between items-start flex-wrap gap-5">
            <div>
              <h1 className="text-[32px] font-bold text-[#2c3e50] mb-2 flex items-center">
                <Icon icon="bi:people-fill" className="text-[#402D87] mr-3" />
                Customers Management
              </h1>
              <p className="text-base text-[#6c757d] m-0 leading-relaxed">
                View and manage all customers on the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-[#f1f3f4] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Icon
                  icon="hugeicons:search-02"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                />
                <Input
                  type="text"
                  placeholder="Search by email, name, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items per page</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setAfter(undefined)
                }}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-2xl font-bold text-[#402D87]">
              {pagination ? customers.length + (pagination.hasNextPage ? '+' : '') : '-'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Suspended</div>
            <div className="text-2xl font-bold text-red-600">
              {customers.filter((c) => c.status === 'suspended').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.status === 'verified' || c.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-2xl font-bold text-gray-600">
              {customers.filter((c) => c.status === 'inactive').length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#f1f3f4] shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={customers}
            isLoading={isLoading}
            initialPageSize={limit}
            emptyState={
              <div className="py-16 text-center">
                <Icon icon="bi:people" className="text-6xl text-gray-300 mb-4" />
                <p className="font-semibold text-gray-700">No customers found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {search || status
                    ? 'Try adjusting your filters'
                    : 'No customers have been registered yet'}
                </p>
              </div>
            }
          />

          {/* Pagination */}
          {pagination && customers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {customers.length} of {pagination.hasNextPage ? 'many' : customers.length}{' '}
                customers
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={!after}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                    after
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                    pagination.hasNextPage
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed',
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCustomerId(null)
        }}
      />
      <UpdateCustomerStatusModal
        customer={selectedCustomer}
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false)
          setSelectedCustomer(null)
        }}
      />
    </div>
  )
}
