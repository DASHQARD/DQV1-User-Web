import React from 'react'
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom'
import { PaginatedTable, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread, usePersistedModalState, userProfile } from '@/hooks'
import {
  RedemptionDetails,
  BranchDetailsModal,
  ViewExperience,
} from '@/features/dashboard/components'
import { CardItems } from '@/features/website/components'
import { ROUTES, MODALS } from '@/utils/constants'
import { vendorQueries } from '@/features'
import LoaderGif from '@/assets/gifs/loader.gif'

type QueryType = typeof DEFAULT_QUERY

type ActivityData = {
  id: string
  actor_name?: string
  actor_type?: string
  action: string
  new_values?: Record<string, any>
  created_at: string
}

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
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const branchModal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })
  const experienceModal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const { useGetAllVendorsDetailsForVendorService } = vendorQueries()
  const { data: vendorsDetailsResponse, isLoading: isLoadingVendorsDetails } =
    useGetAllVendorsDetailsForVendorService()

  // Get user profile and vendor ID
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService } = vendorQueries()

  // Get vendor_id from URL params or user profile
  const vendorIdFromParams = searchParams.get('vendor_id')
  const branchIdFromParams = searchParams.get('branch_id')
  const branchIdFromPath = params.id // Branch ID from URL path
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

  // Extract branch_id from URL path or query params first
  const branchId = React.useMemo(() => {
    // Priority: 1. Query param, 2. URL path param
    if (branchIdFromParams) return Number(branchIdFromParams)
    if (branchIdFromPath) return Number(branchIdFromPath)
    return null
  }, [branchIdFromParams, branchIdFromPath])

  // Find the specific branch that matches branchId from the branches array
  const branches = React.useMemo(() => {
    if (!branchData || !Array.isArray(branchData)) return null
    if (!branchId) {
      // If no branchId specified, return first branch as fallback
      return branchData[0] || null
    }
    // Find branch that matches the branchId
    const foundBranch = branchData.find((branch: any) => {
      const bId = branch.id || branch.branch_id
      return String(bId) === String(branchId)
    })
    return foundBranch || branchData[0] || null
  }, [branchData, branchId])

  // Extract cards for the specific branch from vendors details
  const experiences = React.useMemo(() => {
    if (!vendorsDetailsResponse || !vendorId || !branchId) return []

    // Handle both direct array response and wrapped response with data property
    const vendorsData = Array.isArray(vendorsDetailsResponse)
      ? vendorsDetailsResponse
      : (vendorsDetailsResponse as any)?.data || []

    if (!Array.isArray(vendorsData)) return []

    // Find the vendor that matches the current vendor_id
    const vendor = vendorsData.find((v: any) => {
      const vId = v.vendor_id || v.id
      return String(vId) === String(vendorId)
    })

    if (!vendor || !vendor.branches_with_cards || !Array.isArray(vendor.branches_with_cards)) {
      return []
    }

    // Find the specific branch
    const branch = vendor.branches_with_cards.find((b: any) => {
      const bId = b.branch_id || b.id
      return String(bId) === String(branchId)
    })

    if (!branch || !branch.cards || !Array.isArray(branch.cards)) {
      return []
    }

    // Transform cards to experiences format
    return branch.cards.map((card: any) => ({
      id: String(card.card_id || card.id || ''),
      card_id: card.card_id || card.id,
      product: card.card_name || card.product || 'Gift Card',
      type: card.card_type || card.type || 'Gift Card',
      price: String(card.card_price || card.price || 0),
      currency: card.currency || 'GHS',
      description: card.card_description || card.description || '',
      status: card.card_status || card.status || 'active',
      expiry_date: card.expiry_date || '',
      issue_date: card.issue_date || '',
      images: card.images || [],
      terms_and_conditions: card.terms_and_conditions || [],
      vendor_name: branch.branch_name || vendor.business_name || '',
      branch_name: branch.branch_name || '',
      branch_location: branch.branch_location || '',
      base_price: String(card.card_price || card.price || 0),
      markup_price: null,
      service_fee: '0',
      rating: 0,
      created_at: card.created_at || '',
      updated_at: card.updated_at || card.created_at || '',
      recipient_count: '0',
      vendor_id: vendor.vendor_id || vendor.id || 0,
    }))
  }, [vendorsDetailsResponse, vendorId, branchId])

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
  if (isLoadingBranches || isLoadingVendorsDetails) {
    return (
      <div className="flex justify-center items-center h-full">
        <img src={LoaderGif} alt="loading" className="w-10 h-10" />
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
              <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              Back to Branches
            </button>
            <h2 className="text-2xl font-semibold text-primary-900 mt-2">Branch Details</h2>
          </div>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => branchModal.openModal(MODALS.BRANCH.VIEW, branches || undefined)}
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
          <div className="p-6 pb-0 flex justify-between items-center mb-6">
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
              <div className="flex flex-col items-center justify-center py-12 min-h-[300px]">
                <Icon icon="bi:briefcase" className="text-6xl text-gray-300 opacity-40 mb-4" />
                <Text variant="p" className="text-sm text-gray-400 font-normal">
                  No experiences created yet
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-4">
                {experiences
                  .slice(0, 6)
                  .map(
                    (experience: {
                      id: string
                      card_id?: number
                      product: string
                      type: string
                      price: string
                      currency?: string
                      description?: string
                      status?: string
                      expiry_date?: string
                      issue_date?: string
                      images?: any[]
                      terms_and_conditions?: any[]
                      vendor_name?: string
                      branch_name?: string
                      branch_location?: string
                      base_price?: string
                      markup_price?: number | null
                      service_fee?: string
                      rating?: number
                      created_at?: string
                      updated_at?: string
                      recipient_count?: string
                      vendor_id?: number
                    }) => (
                      <div
                        key={experience.id}
                        onClick={() => {
                          experienceModal.openModal(MODALS.EXPERIENCE.VIEW, experience)
                        }}
                        className="cursor-pointer"
                      >
                        <CardItems
                          card_id={experience.card_id || Number(experience.id)}
                          product={experience.product}
                          vendor_name={experience.vendor_name || ''}
                          branch_name={experience.branch_name || ''}
                          branch_location={experience.branch_location || ''}
                          description={experience.description || ''}
                          price={experience.price}
                          base_price={experience.base_price || experience.price}
                          markup_price={experience.markup_price ?? null}
                          service_fee={experience.service_fee || '0'}
                          currency={experience.currency || 'GHS'}
                          expiry_date={experience.expiry_date || ''}
                          status={experience.status || 'active'}
                          rating={experience.rating || 0}
                          created_at={experience.created_at || ''}
                          recipient_count={experience.recipient_count || '0'}
                          images={(experience.images || []) as []}
                          terms_and_conditions={(experience.terms_and_conditions || []) as []}
                          type={experience.type}
                          updated_at={experience.updated_at || experience.created_at || ''}
                          vendor_id={experience.vendor_id || 0}
                          buttonText="View Details"
                          onGetQard={() => {
                            experienceModal.openModal(MODALS.EXPERIENCE.VIEW, experience)
                          }}
                        />
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
      <ViewExperience />
    </>
  )
}
