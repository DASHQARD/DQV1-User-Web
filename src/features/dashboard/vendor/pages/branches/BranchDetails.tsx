import React from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { CustomIcon, Loader, PaginatedTable, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread, usePersistedModalState, userProfile } from '@/hooks'
import { RedemptionDetails, BranchDetailsModal } from '@/features/dashboard/components'
import { ROUTES, MODALS } from '@/utils/constants'
import { vendorQueries } from '@/features'

type QueryType = typeof DEFAULT_QUERY

// Audit log types
type ActivityData = {
  id: string
  actor_name?: string
  actor_type?: string
  action: string
  new_values?: Record<string, any>
  created_at: string
}

// Mock redemption data with gift card types
// type Redemption = {
//   id: string
//   giftCardType: 'DashX' | 'DashPro' | 'DashGo' | 'DashPass'
//   amount: number
//   updated_at: string
//   branch_id?: string
// }

// const MOCK_REDEMPTIONS: Redemption[] = [
//   {
//     id: '1',
//     giftCardType: 'DashX',
//     amount: 150.0,
//     updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '2',
//     giftCardType: 'DashPro',
//     amount: 250.0,
//     updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '3',
//     giftCardType: 'DashGo',
//     amount: 100.0,
//     updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '4',
//     giftCardType: 'DashX',
//     amount: 75.0,
//     updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '5',
//     giftCardType: 'DashPass',
//     amount: 300.0,
//     updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '6',
//     giftCardType: 'DashPro',
//     amount: 200.0,
//     updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '7',
//     giftCardType: 'DashX',
//     amount: 125.0,
//     updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
//   {
//     id: '8',
//     giftCardType: 'DashGo',
//     amount: 180.0,
//     updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
//     branch_id: '1',
//   },
// ]

// Helper functions for audit logs
const actionStyles: Record<'Create' | 'Edit' | 'Request' | 'Approve' | 'Reject', string> = {
  Create: 'text-success-600',
  Edit: 'text-warning-400',
  Request: 'text-blue-600',
  Approve: 'text-green-600',
  Reject: 'text-red-600',
}

function getActionType(action: string): 'Create' | 'Edit' | 'Request' | 'Approve' | 'Reject' {
  const lowerAction = action.toLowerCase()

  if (
    lowerAction.includes('approve') ||
    lowerAction.includes('approved') ||
    lowerAction.includes('approval')
  ) {
    return 'Approve'
  }

  if (
    lowerAction.includes('reject') ||
    lowerAction.includes('rejected') ||
    lowerAction.includes('rejection')
  ) {
    return 'Reject'
  }

  if (
    lowerAction.includes('create') ||
    lowerAction.includes('created') ||
    lowerAction.includes('add') ||
    lowerAction.includes('new')
  ) {
    return 'Create'
  }

  if (
    lowerAction.includes('request') ||
    lowerAction.includes('requested') ||
    lowerAction.includes('submitted')
  ) {
    return 'Request'
  }

  if (
    lowerAction.includes('edit') ||
    lowerAction.includes('edited') ||
    lowerAction.includes('modify') ||
    lowerAction.includes('modified') ||
    lowerAction.includes('update') ||
    lowerAction.includes('updated')
  ) {
    return 'Edit'
  }

  return 'Create'
}

function formatActivityDate(timestamp: string): string {
  if (!timestamp) return 'N/A'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`
}

function formatActorType(actorType: string): string {
  if (!actorType) return 'Admin'
  return actorType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getActivityDescription(action: string, newValues?: Record<string, any>): string {
  const lowerAction = action.toLowerCase()

  if (lowerAction.includes('experience')) {
    if (newValues?.experience_name) {
      return newValues.experience_name
    }
    if (newValues?.product_name) {
      return newValues.product_name
    }
    return 'Experience'
  }

  if (lowerAction.includes('branch')) {
    if (newValues?.branch_name) {
      return newValues.branch_name
    }
    return 'Branch'
  }

  if (lowerAction.includes('payment')) {
    return 'Payment Method'
  }

  if (lowerAction.includes('request')) {
    if (newValues?.request_type) {
      return newValues.request_type
    }
    return 'Request'
  }

  // Fallback: create a readable description from the action
  return action
    .replace(/_/g, ' ')
    .replace(/ADMIN\s+/i, '')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Mock audit log data for branch manager actions
const createMockAuditLogs = (): ActivityData[] => {
  const now = Date.now()
  return [
    {
      id: '1',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Created Experience',
      new_values: {
        experience_name: 'DashX Gift Card Experience',
        product_name: 'DashX Gift Card',
      },
      created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: '2',
      actor_name: 'Sarah Admin',
      actor_type: 'vendor_admin',
      action: 'Approved Experience Request',
      new_values: {
        experience_name: 'DashX Gift Card Experience',
      },
      created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    },
    {
      id: '3',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Edited Experience',
      new_values: {
        experience_name: 'DashPro Gift Card Experience',
        product_name: 'DashPro Gift Card',
      },
      created_at: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: '4',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Requested Payment Method Change',
      new_values: {
        request_type: 'Payment Method Change',
        payment_type: 'Mobile Money',
      },
      created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: '5',
      actor_name: 'Super Admin',
      actor_type: 'super_admin',
      action: 'Approved Payment Method Request',
      new_values: {
        request_type: 'Payment Method Change',
      },
      created_at: new Date(now - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), // 2 days ago + 1 hour
    },
    {
      id: '6',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Created Branch Location Update Request',
      new_values: {
        request_type: 'Branch Location Update',
        branch_name: 'Accra Main Branch',
      },
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: '7',
      actor_name: 'Sarah Admin',
      actor_type: 'vendor_admin',
      action: 'Rejected Branch Location Request',
      new_values: {
        request_type: 'Branch Location Update',
        branch_name: 'Accra Main Branch',
      },
      created_at: new Date(now - 3 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), // 3 days ago + 2 hours
    },
    {
      id: '8',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Edited Experience Pricing',
      new_values: {
        experience_name: 'DashGo Gift Card Experience',
        product_name: 'DashGo Gift Card',
      },
      created_at: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    },
    {
      id: '9',
      actor_name: 'Super Admin',
      actor_type: 'super_admin',
      action: 'Approved Experience Request',
      new_values: {
        experience_name: 'DashGo Gift Card Experience',
      },
      created_at: new Date(now - 4 * 24 * 60 * 60 * 1000 + 10800000).toISOString(), // 4 days ago + 3 hours
    },
    {
      id: '10',
      actor_name: 'John Manager',
      actor_type: 'branch_manager',
      action: 'Requested Branch Settings Change',
      new_values: {
        request_type: 'Branch Settings Change',
      },
      created_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
  ]
}

// Audit log table columns
const auditLogsColumns = [
  {
    header: 'Actor',
    accessorKey: 'actor',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const actor = activity.actor_name || 'Admin'
      const role = formatActorType(activity.actor_type || 'admin')
      return (
        <div>
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
      const description = getActivityDescription(activity.action, activity.new_values)
      return (
        <Text variant="span" className="text-sm text-gray-600 line-clamp-1">
          {description}
        </Text>
      )
    },
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const date = formatActivityDate(activity.created_at)
      return (
        <Text variant="span" className="text-xs text-gray-400">
          {date}
        </Text>
      )
    },
  },
]

const auditLogsCsvHeaders = [
  { name: 'Actor', accessor: 'actor_name' },
  { name: 'Role', accessor: 'actor_type' },
  { name: 'Action', accessor: 'action' },
  { name: 'Date', accessor: 'created_at' },
]

export function BranchDetails() {
  const navigate = useNavigate()
  // const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const branchModal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })

  // Get user profile and vendor ID
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService } = vendorQueries()

  // Get vendor_id from URL params or user profile
  const vendorIdFromParams = searchParams.get('vendor_id')
  const vendorIdFromProfile = userProfileData?.vendor_id
  const vendorId = vendorIdFromParams
    ? Number(vendorIdFromParams)
    : vendorIdFromProfile
      ? Number(vendorIdFromProfile)
      : null

  // Fetch branches for the vendor
  const {
    data: branchData,
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
  } = useGetBranchesByVendorIdService(vendorId, false)

  const branchesResponse = branchData?.[0]

  console.log('branchesResponse', branchesResponse)

  const branches = React.useMemo(() => {
    if (!branchesResponse) return []
    return branchesResponse
  }, [branchesResponse])

  // Mock experiences data (to be replaced with API call later)
  const MOCK_EXPERIENCES = [
    {
      id: '1',
      product: 'DashX Gift Card',
      type: 'Gift Card',
      price: 100,
    },
    {
      id: '2',
      product: 'DashPro Gift Card',
      type: 'Gift Card',
      price: 200,
    },
    {
      id: '3',
      product: 'DashGo Gift Card',
      type: 'Gift Card',
      price: 150,
    },
    {
      id: '4',
      product: 'DashPass Gift Card',
      type: 'Gift Card',
      price: 250,
    },
  ]
  const experiences = MOCK_EXPERIENCES

  // Get all redemptions for this branch, sorted by most recent first

  // Filter redemptions by selected card type from query

  // Get recent redemptions (first 5) - always from all redemptions

  // Get audit logs for this branch
  const branchAuditLogs = React.useMemo(() => {
    return createMockAuditLogs().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [])

  // Show loading state
  if (isLoadingBranches) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

  // Show error state
  if (isErrorBranches || !branches) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Icon icon="bi:exclamation-circle" className="text-4xl text-red-500" />
        <Text variant="h3" className="text-gray-700">
          {isErrorBranches ? 'Error loading branch details' : 'Branch not found'}
        </Text>
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
        >
          Back to Branches
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="md:py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
              className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer"
            >
              <CustomIcon
                name="ArrowTurnBackward"
                className="-rotate-x-180"
                width={20}
                height={20}
              />
              Back to Branches
            </button>
            <h2 className="text-2xl font-semibold text-primary-900 mt-2">Branch Details</h2>
          </div>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => branchModal.openModal(MODALS.BRANCH.VIEW)}
            className="rounded-full"
          >
            View Branch Details
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Redemptions */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:credit-card-2-front" />
            </div>
            <div className="flex-1">
              {/* <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {metrics.totalRedemptions}
              </div> */}
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemptions</div>
            </div>
          </div>

          {/* Total Payouts */}
          {/* <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:currency-exchange" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalPayouts, 'GHS')}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Payouts</div>
            </div>
          </div> */}

          {/* Total Payouts - DashX */}
          {/* <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:wallet2" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalPayoutsDashX, 'GHS')}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Payouts - DashX</div>
            </div>
          </div> */}
        </div>

        {/* Recent Redemptions */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent Redemptions
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          {/* <div className="px-6 pb-6">
            {recentRedemptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon icon="bi:inbox" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm m-0">No redemptions to display</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRedemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center">
                        <Icon icon="bi:credit-card-2-front" className="text-[#402D87]" />
                      </div>
                      <div>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {redemption.giftCardType}
                        </Text>
                        <Text variant="span" className="text-gray-500 text-sm block">
                          {new Date(redemption.updated_at).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                    <Text variant="span" weight="semibold" className="text-[#402D87]">
                      {formatCurrency(redemption.amount, 'GHS')}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>

        {/* Experiences */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> Experiences
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon icon="bi:briefcase" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm m-0">No experiences created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiences
                  .slice(0, 6)
                  .map(
                    (experience: { id: string; product: string; type: string; price: number }) => (
                      <div
                        key={experience.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <Text variant="span" weight="semibold" className="text-gray-900 block mb-2">
                          {experience.product}
                        </Text>
                        <Text variant="span" className="text-gray-500 text-sm block mb-2">
                          {experience.type}
                        </Text>
                        <Text variant="span" weight="semibold" className="text-[#402D87]">
                          {formatCurrency(experience.price, 'GHS')}
                        </Text>
                      </div>
                    ),
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:journal-text" className="text-[#402D87] mr-2" /> Audit Logs
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.AUDIT_LOGS}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={auditLogsColumns}
              data={branchAuditLogs}
              total={branchAuditLogs.length}
              loading={false}
              query={query}
              setQuery={setQuery}
              csvHeaders={auditLogsCsvHeaders}
              printTitle="Audit Logs"
              filterBy={{
                simpleSelects: [
                  {
                    label: 'action',
                    options: [
                      { label: 'All Actions', value: 'all' },
                      { label: 'Create', value: 'Create' },
                      { label: 'Edit', value: 'Edit' },
                      { label: 'Request', value: 'Request' },
                      { label: 'Approve', value: 'Approve' },
                      { label: 'Reject', value: 'Reject' },
                    ],
                  },
                ],
              }}
              noSearch
            />
          </div>
        </div>
      </div>

      <BranchDetailsModal branch={branches} />
      <RedemptionDetails />
    </>
  )
}
