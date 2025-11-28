import { useState, useMemo, useCallback } from 'react'
import { Icon } from '@/libs'
import { DataTable, Input, Dropdown } from '@/components'
import type { ColumnDef } from '@tanstack/react-table'
import { useVendors } from '../../hooks/useVendors'
import type { Vendor } from '@/types/vendor'
import { cn } from '@/libs'
import { VendorDetailsModal } from './VendorDetailsModal'
import { UpdateStatusModal } from './UpdateStatusModal'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function Vendors() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [limit, setLimit] = useState(10)
  const [after, setAfter] = useState<string | undefined>(undefined)
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { data, isLoading, error } = useVendors({
    limit,
    status: status || undefined,
    search: search || undefined,
    after,
  })

  const vendors = data?.data || []
  const pagination = data?.pagination

  const handleViewDetails = useCallback((vendor: Vendor) => {
    setSelectedVendorId(vendor.id)
    setShowDetailsModal(true)
  }, [])

  const handleUpdateStatus = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowStatusModal(true)
  }, [])

  const handleAddBranch = useCallback(
    (vendor: Vendor) => {
      // Navigate to add branch page with vendor context
      // You may want to pass vendor info via state or query params
      navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH, {
        state: { vendorId: vendor.id },
      })
    },
    [navigate],
  )

  const columns: ColumnDef<Vendor>[] = useMemo(
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
        accessorKey: 'phonenumber',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.phonenumber || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'branch_name',
        header: 'Branch Name',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.branch_name || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusValue = row.original.status
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            active: 'bg-blue-100 text-blue-800',
            inactive: 'bg-gray-100 text-gray-800',
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
          const vendor = row.original
          return (
            <Dropdown
              actions={[
                {
                  label: 'View Vendor Details',
                  onClickFn: () => handleViewDetails(vendor),
                },
                {
                  label: 'Update Vendor Status',
                  onClickFn: () => handleUpdateStatus(vendor),
                },
                {
                  label: 'Add Branch',
                  onClickFn: () => handleAddBranch(vendor),
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
    [handleViewDetails, handleUpdateStatus, handleAddBranch],
  )

  const handleNextPage = () => {
    if (pagination?.next) {
      setAfter(pagination.next)
    }
  }

  const handlePreviousPage = () => {
    // Note: The API doesn't provide a previous cursor, so we'd need to track history
    // For now, we'll reset to the beginning
    setAfter(undefined)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <Icon icon="bi:exclamation-triangle" className="text-4xl text-red-500 mb-4" />
          <p className="text-gray-700 font-medium">Failed to load vendors</p>
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
                <Icon icon="bi:shop" className="text-[#402D87] mr-3" />
                Vendors Management
              </h1>
              <p className="text-base text-[#6c757d] m-0 leading-relaxed">
                View and manage all vendors on the platform.
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
                  placeholder="Search by email, phone, or branch..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
                  setAfter(undefined) // Reset pagination when changing limit
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
            <div className="text-sm text-gray-600 mb-1">Total Vendors</div>
            <div className="text-2xl font-bold text-[#402D87]">
              {pagination ? vendors.length + (pagination.hasNextPage ? '+' : '') : '-'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {vendors.filter((v) => v.status === 'suspended').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-600">
              {vendors.filter((v) => v.status === 'verified' || v.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#f1f3f4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Suspended</div>
            <div className="text-2xl font-bold text-red-600">
              {vendors.filter((v) => v.status === 'suspended').length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#f1f3f4] shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={vendors}
            isLoading={isLoading}
            initialPageSize={limit}
            emptyState={
              <div className="py-16 text-center">
                <Icon icon="bi:shop" className="text-6xl text-gray-300 mb-4" />
                <p className="font-semibold text-gray-700">No vendors found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {search || status
                    ? 'Try adjusting your filters'
                    : 'No vendors have been registered yet'}
                </p>
              </div>
            }
          />

          {/* Pagination */}
          {pagination && vendors.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {vendors.length} of {pagination.hasNextPage ? 'many' : vendors.length}{' '}
                vendors
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
      <VendorDetailsModal
        vendorId={selectedVendorId}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedVendorId(null)
        }}
      />
      <UpdateStatusModal
        vendor={selectedVendor}
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false)
          setSelectedVendor(null)
        }}
      />
    </div>
  )
}
