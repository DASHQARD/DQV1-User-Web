import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { CustomIcon, Loader, PaginatedTable, Text, Tag, TabbedView } from '@/components'
import { MOCK_BRANCHES } from '@/mocks'
import { formatCurrency } from '@/utils/format'
import { getStatusVariant } from '@/utils/helpers/common'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread } from '@/hooks'
import { BranchGiftCards, VendorProfile, RedemptionDetails } from '@/features/dashboard/components'
import { redemptionListColumns, redemptionListCsvHeaders } from '@/features/dashboard/components'
import { ROUTES } from '@/utils/constants'
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

  // Find branch from mock data
  const branch = React.useMemo(() => {
    return MOCK_BRANCHES.find((b) => b.id === id) || null
  }, [id])

  // Get redemptions for this branch, sorted by most recent first
  const branchRedemptions = React.useMemo(() => {
    const filtered = MOCK_REDEMPTIONS.filter((r) => r.branch_id === branch?.id)
    return filtered.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
  }, [branch?.id])

  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!branchRedemptions.length) {
      return {
        totalRedemptions: 0,
        totalAmount: 0,
        dashXTotal: 0,
        dashXCount: 0,
        dashProTotal: 0,
        dashProCount: 0,
        dashGoTotal: 0,
        dashGoCount: 0,
        dashPassTotal: 0,
        dashPassCount: 0,
      }
    }

    const totalAmount = branchRedemptions.reduce((sum, r) => sum + r.amount, 0)
    const dashX = branchRedemptions.filter((r) => r.giftCardType === 'DashX')
    const dashPro = branchRedemptions.filter((r) => r.giftCardType === 'DashPro')
    const dashGo = branchRedemptions.filter((r) => r.giftCardType === 'DashGo')
    const dashPass = branchRedemptions.filter((r) => r.giftCardType === 'DashPass')

    return {
      totalRedemptions: branchRedemptions.length,
      totalAmount,
      dashXTotal: dashX.reduce((sum, r) => sum + r.amount, 0),
      dashXCount: dashX.length,
      dashProTotal: dashPro.reduce((sum, r) => sum + r.amount, 0),
      dashProCount: dashPro.length,
      dashGoTotal: dashGo.reduce((sum, r) => sum + r.amount, 0),
      dashGoCount: dashGo.length,
      dashPassTotal: dashPass.reduce((sum, r) => sum + r.amount, 0),
      dashPassCount: dashPass.length,
    }
  }, [branchRedemptions])

  // Branch info fields
  const branchInfo = React.useMemo(() => {
    if (!branch) return []
    return [
      { label: 'Branch ID', value: branch.full_branch_id || branch.id },
      { label: 'Branch Code', value: branch.branch_code },
      { label: 'Location', value: branch.branch_location },
      { label: 'Branch Type', value: branch.branch_type },
      { label: 'Created Date', value: new Date(branch.created_at).toLocaleDateString() },
      { label: 'Last Updated', value: new Date(branch.updated_at).toLocaleDateString() },
    ]
  }, [branch])

  const tabConfigs = [
    {
      key: 'branch-wallet' as const,
      component: () => (
        <BranchGiftCards
          dashx_redemptions={formatCurrency(0, 'GHS')}
          dashpro_redemptions={formatCurrency(0, 'GHS')}
          dashgo_redemptions={formatCurrency(0, 'GHS')}
          dashpass_redemptions={formatCurrency(0, 'GHS')}
        />
      ),
      label: 'Branch wallet',
    },
  ]

  // Performance info fields
  const performanceInfo = React.useMemo(() => {
    return [
      { label: 'Total Redemptions', value: performanceMetrics.totalRedemptions.toString() },
      {
        label: 'Total Amount Redeemed',
        value: formatCurrency(performanceMetrics.totalAmount, 'GHS'),
      },
    ]
  }, [performanceMetrics])

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
        </div>

        <VendorProfile
          name={branch.branch_name}
          tier={branch.branch_code || 'N/A'}
          status={branch.status || 'active'}
        >
          <div className="flex flex-col gap-6 w-full">
            <Text variant="h5" weight="medium">
              Branch Information
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {branchInfo.map((item) => (
                <div className="flex flex-col gap-1 min-w-0" key={item.label}>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{item.label}</p>
                  <Text variant="span" className="wrap-break-word overflow-hidden">
                    {item.value}
                  </Text>
                </div>
              ))}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs text-gray-400 whitespace-nowrap">Status</p>
                <Tag value={branch.status} variant={getStatusVariant(branch.status) as any} />
              </div>
            </section>

            {/* Branch Manager Section */}
            <div className="border-t border-gray-200 pt-6 mt-4">
              <Text variant="h5" weight="medium" className="mb-4">
                Branch Manager
              </Text>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">Manager Name</p>
                  <Text variant="span" className="wrap-break-word overflow-hidden">
                    {branch.branch_manager_name}
                  </Text>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">Manager Email</p>
                  <Text variant="span" className="wrap-break-word overflow-hidden">
                    {branch.branch_manager_email}
                  </Text>
                </div>
              </section>
            </div>

            {/* Performance Metrics Section */}
            <div className="border-t border-gray-200 pt-6 mt-4">
              <Text variant="h5" weight="medium" className="mb-4">
                Performance Metrics
              </Text>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {performanceInfo.map((item) => (
                  <div className="flex flex-col gap-1 min-w-0" key={item.label}>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{item.label}</p>
                    <Text
                      variant="span"
                      weight="semibold"
                      className="wrap-break-word overflow-hidden"
                    >
                      {item.value}
                    </Text>
                  </div>
                ))}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">DashX Redemptions</p>
                  <Text
                    variant="span"
                    weight="semibold"
                    className="wrap-break-word overflow-hidden"
                  >
                    {performanceMetrics.dashXCount} (
                    {formatCurrency(performanceMetrics.dashXTotal, 'GHS')})
                  </Text>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">DashPro Redemptions</p>
                  <Text
                    variant="span"
                    weight="semibold"
                    className="wrap-break-word overflow-hidden"
                  >
                    {performanceMetrics.dashProCount} (
                    {formatCurrency(performanceMetrics.dashProTotal, 'GHS')})
                  </Text>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">DashGo Redemptions</p>
                  <Text
                    variant="span"
                    weight="semibold"
                    className="wrap-break-word overflow-hidden"
                  >
                    {performanceMetrics.dashGoCount} (
                    {formatCurrency(performanceMetrics.dashGoTotal, 'GHS')})
                  </Text>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 whitespace-nowrap">DashPass Redemptions</p>
                  <Text
                    variant="span"
                    weight="semibold"
                    className="wrap-break-word overflow-hidden"
                  >
                    {performanceMetrics.dashPassCount} (
                    {formatCurrency(performanceMetrics.dashPassTotal, 'GHS')})
                  </Text>
                </div>
              </section>
            </div>
          </div>
        </VendorProfile>

        <TabbedView
          tabs={tabConfigs}
          defaultTab="branch-wallet"
          urlParam="tab"
          containerClassName="space-y-4"
          btnClassName="pb-2"
          tabsClassName="gap-6"
        />

        {/* Recent Activities */}

        <div className="relative space-y-6">
          <h2>Recent activities</h2>

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
              simpleSelects: [{ label: 'status', options: OPTIONS.TRANSACTION_STATUS }],
            }}
            noSearch
          />
        </div>
      </div>

      <RedemptionDetails />
    </>
  )
}
