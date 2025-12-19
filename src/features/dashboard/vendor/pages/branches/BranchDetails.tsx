import React from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CustomIcon, Loader, PaginatedTable, Text, Button } from '@/components'
import { Icon } from '@/libs'
import { MOCK_BRANCHES } from '@/mocks'
import { formatCurrency } from '@/utils/format'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread, usePersistedModalState } from '@/hooks'
import { RedemptionDetails, BranchDetailsModal } from '@/features/dashboard/components'
import { redemptionListColumns, redemptionListCsvHeaders } from '@/features/dashboard/components'
import { ROUTES, MODALS } from '@/utils/constants'
import { OPTIONS } from '@/utils/constants/filter'

type QueryType = typeof DEFAULT_QUERY

// Mock redemption data with gift card types
type Redemption = {
  id: string
  giftCardType: 'DashX' | 'DashPro' | 'DashGo' | 'DashPass'
  amount: number
  updated_at: string
  branch_id?: string
}

const MOCK_REDEMPTIONS: Redemption[] = [
  {
    id: '1',
    giftCardType: 'DashX',
    amount: 150.0,
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '2',
    giftCardType: 'DashPro',
    amount: 250.0,
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '3',
    giftCardType: 'DashGo',
    amount: 100.0,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '4',
    giftCardType: 'DashX',
    amount: 75.0,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '5',
    giftCardType: 'DashPass',
    amount: 300.0,
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '6',
    giftCardType: 'DashPro',
    amount: 200.0,
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '7',
    giftCardType: 'DashX',
    amount: 125.0,
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
  {
    id: '8',
    giftCardType: 'DashGo',
    amount: 180.0,
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    branch_id: '1',
  },
]

export function BranchDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const branchModal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })

  // Mock experiences data
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

  // Find branch from mock data
  const branch = React.useMemo(() => {
    return MOCK_BRANCHES.find((b) => b.id === id) || null
  }, [id])

  // Get all redemptions for this branch, sorted by most recent first
  const allBranchRedemptions = React.useMemo(() => {
    const filtered = MOCK_REDEMPTIONS.filter((r) => r.branch_id === branch?.id)
    return filtered.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
  }, [branch?.id])

  // Filter redemptions by selected card type from query
  const cardTypeFilter = (query as any).cardType
  const branchRedemptions = React.useMemo(() => {
    if (cardTypeFilter === 'all' || !cardTypeFilter) {
      return allBranchRedemptions
    }
    return allBranchRedemptions.filter((r) => r.giftCardType === cardTypeFilter)
  }, [allBranchRedemptions, cardTypeFilter])

  // Get recent redemptions (first 5) - always from all redemptions
  const recentRedemptions = React.useMemo(() => {
    return allBranchRedemptions.slice(0, 5)
  }, [allBranchRedemptions])

  // Calculate metrics based on filtered data
  const metrics = React.useMemo(() => {
    if (!branchRedemptions.length) {
      return {
        totalRedemptions: 0,
        totalPayouts: 0,
        totalPayoutsDashX: 0,
      }
    }

    const totalPayouts = branchRedemptions.reduce((sum, r) => sum + r.amount, 0)
    const dashXRedemptions = branchRedemptions.filter((r) => r.giftCardType === 'DashX')
    const totalPayoutsDashX = dashXRedemptions.reduce((sum, r) => sum + r.amount, 0)

    return {
      totalRedemptions: branchRedemptions.length,
      totalPayouts,
      totalPayoutsDashX,
    }
  }, [branchRedemptions])

  if (!branch) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
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
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {metrics.totalRedemptions}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemptions</div>
            </div>
          </div>

          {/* Total Payouts */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:currency-exchange" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalPayouts, 'GHS')}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Payouts</div>
            </div>
          </div>

          {/* Total Payouts - DashX */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:wallet2" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalPayoutsDashX, 'GHS')}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Payouts - DashX</div>
            </div>
          </div>
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
          <div className="px-6 pb-6">
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
          </div>
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

        {/* Recent Activities */}
        <div className="p-6 pb-0 flex justify-between items-center mb-5">
          <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
            <Icon icon="bi:clock-history" className="text-[#402D87] mr-2" /> Recent Activities
          </h5>
        </div>
        <div className="px-6 pb-6">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={redemptionListColumns}
            data={branchRedemptions}
            total={branchRedemptions.length}
            loading={false}
            query={query}
            setQuery={setQuery}
            csvHeaders={redemptionListCsvHeaders}
            printTitle="Recent Activities"
            filterBy={{
              simpleSelects: [
                {
                  label: 'cardType',
                  options: [
                    { label: 'All Cards', value: 'all' },
                    { label: 'DashX', value: 'DashX' },
                    { label: 'DashPro', value: 'DashPro' },
                    { label: 'DashGo', value: 'DashGo' },
                    { label: 'DashPass', value: 'DashPass' },
                  ],
                },
                { label: 'status', options: OPTIONS.TRANSACTION_STATUS },
              ],
            }}
            noSearch
          />
        </div>
      </div>

      <BranchDetailsModal branch={branch} />
      <RedemptionDetails />
    </>
  )
}
