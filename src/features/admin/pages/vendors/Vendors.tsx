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
import { Select } from '@/components/Select'

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function Vendors() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const limit = 10
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null])
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { data, isLoading, error } = useVendors({
    limit,
    status: status === 'all' ? undefined : status || undefined,
    search: search || undefined,
    after: cursor || undefined,
  })

  const vendors = data?.data || []
  const pagination = data?.pagination

  const handleViewDetails = useCallback((vendor: Vendor) => {
    setSelectedVendorId(vendor.user_id)
    setShowDetailsModal(true)
  }, [])

  const handleUpdateStatus = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowStatusModal(true)
  }, [])

  const handleAddBranch = useCallback(
    (vendor: Vendor) => {
      navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH, {
        state: { vendorId: vendor.id },
      })
    },
    [navigate],
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCursor(null)
    setCursorHistory([null])
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setCursor(null)
    setCursorHistory([null])
  }

  const handleNextPage = () => {
    if (pagination?.next) {
      setCursorHistory((prev) => [...prev, cursor])
      setCursor(pagination.next)
    }
  }

  const handlePreviousPage = () => {
    if (cursorHistory.length > 1) {
      const newHistory = [...cursorHistory]
      newHistory.pop()
      setCursorHistory(newHistory)
      setCursor(newHistory[newHistory.length - 1])
    }
  }

  const currentPage = cursorHistory.length
  const hasPreviousPage = cursorHistory.length > 1

  const columns: ColumnDef<Vendor>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'GVID',
        cell: ({ row }) => (
          <span className="font-semibold text-[#212529]">{row.original.full_branch_id}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-[#212529]">{row.original.branch_manager_email || 'N/A'}</span>
        ),
      },
      {
        accessorKey: 'phonenumber',
        header: 'Phone Number',
        cell: () => <span className="text-grey-500">N/A</span>,
      },
      {
        accessorKey: 'branch_name',
        header: 'Branch Name',
        cell: ({ row }) => (
          <span className="text-grey-500">{row.original.branch_name || 'N/A'}</span>
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
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                statusColors[statusValue] || 'bg-[#f0f0f0] text-grey-500',
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
            <span className="text-grey-500">
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
                className="text-grey-500 hover:text-primary-500 transition-colors p-1 rounded-lg hover:bg-primary-500/10"
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="wrapper py-12">
          <div className="flex items-center justify-center min-h-[400px] bg-white border border-[#e6e6e6] rounded-xl">
            <div className="text-center">
              <Icon icon="bi:exclamation-triangle" className="text-5xl text-red-500 mb-4" />
              <p className="text-[#212529] font-extrabold text-lg mb-2">Failed to load vendors</p>
              <p className="text-sm text-grey-500">Please try again later</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col gap-12">
      <section
        className="bg-gradient-to-br from-primary-500 to-primary-700 text-white pt-20 pb-12"
        style={{ marginTop: '-72px', paddingTop: '88px' }}
      >
        <div className="wrapper">
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-12 items-center max-md:grid-cols-1 max-md:text-center max-md:gap-8">
            <div className="hero__text">
              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight">
                Manage Your Vendors
              </h1>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                View, manage, and monitor all vendor accounts and their status across your platform.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="wrapper">
        {/* Filters and Table Section */}
        <div className="grid grid-cols-[280px_1fr] gap-8 items-start max-lg:grid-cols-[260px_1fr] max-md:grid-cols-1 max-md:gap-6">
          {/* Filter Sidebar */}
          <aside className="bg-white border border-[#e6e6e6] rounded-xl sticky top-[88px] max-h-[calc(100vh-120px)] overflow-y-auto max-md:static max-md:max-h-none max-md:overflow-y-visible">
            <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e6e6e6]">
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-[#212529] mb-1">Filter Results</h3>
                <p className="text-sm text-grey-500 font-medium">
                  {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} available
                </p>
              </div>
            </div>
            <section className="flex flex-col gap-4 p-6">
              <Input
                type="text"
                label="Search vendors..."
                placeholder="Search vendors..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearchChange(e.target.value)
                }
              />

              <Select
                label="Status"
                options={statusOptions}
                placeholder="Select status"
                value={status}
                onValueChange={handleStatusChange}
                className="w-full"
              />
            </section>
          </aside>

          {/* Table Section */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border border-[#e6e6e6] rounded-xl overflow-hidden">
              <div className="bg-[#f0f0f0] px-6 py-5 border-b border-[#e6e6e6] flex items-center justify-between">
                <h5 className="text-lg font-extrabold text-[#212529] m-0">Vendor List</h5>
                <div>
                  <span className="text-sm text-grey-500 bg-white px-3 py-1 rounded-full border border-[#e6e6e6]">
                    {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'} found
                  </span>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={vendors}
                isLoading={isLoading}
                initialPageSize={limit}
                emptyState={
                  <div className="py-20 px-5 text-center">
                    <Icon icon="bi:shop" className="text-6xl text-[#e6e6e6] mb-4" />
                    <h5 className="text-xl font-extrabold text-[#212529] mb-2">No vendors found</h5>
                    <p className="text-sm text-grey-500">
                      {search || (status && status !== 'all')
                        ? 'Try adjusting your filters'
                        : 'No vendors have been registered yet'}
                    </p>
                  </div>
                }
              />

              {/* Pagination */}
              {pagination && vendors.length > 0 && (
                <div className="px-6 py-5 border-t border-[#e6e6e6] bg-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-grey-500">
                    Showing {(currentPage - 1) * limit + 1} to{' '}
                    {Math.min(currentPage * limit, vendors.length)} of {vendors.length}{' '}
                    {vendors.length === 1 ? 'vendor' : 'vendors'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={!hasPreviousPage}
                      className={cn(
                        'w-9 h-9 border-2 border-[#e6e6e6] bg-white rounded-lg flex items-center justify-center cursor-pointer transition-all hover:border-primary-500 hover:text-primary-500',
                        !hasPreviousPage && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <Icon icon="bi:chevron-left" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage}
                      className={cn(
                        'w-9 h-9 border-2 border-[#e6e6e6] bg-white rounded-lg flex items-center justify-center cursor-pointer transition-all hover:border-primary-500 hover:text-primary-500',
                        !pagination.hasNextPage && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <Icon icon="bi:chevron-right" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
