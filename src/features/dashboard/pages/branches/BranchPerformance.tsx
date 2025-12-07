import { useState, useMemo } from 'react'
import { Icon } from '@/libs'
import { Loader } from '@/components'
import { formatRelativeTime } from '@/utils/format'
import { useBranches } from '../../hooks/useBranches'

interface BranchPerformance {
  id: string
  branch_name: string
  branch_location: string
  branch_manager_name: string
  branch_manager_email: string
  totalRedemptions: number
  totalRevenue: number
  giftCardRedemptions: number
  dashxRedeemed: number
  dashpassRedeemed: number
  lastActivity: string
  performanceTrend: 'up' | 'down' | 'stable'
  performanceChange: number
}

type SortField = 'name' | 'revenue' | 'redemptions' | 'performance'
type SortOrder = 'asc' | 'desc'

export default function BranchPerformance() {
  const { data: branchesResponse, isLoading } = useBranches()
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Helper function to generate stable pseudo-random values based on branch ID
  const stableRandom = (seed: number, min: number, max: number): number => {
    // Simple seeded random number generator
    const x = Math.sin(seed) * 10000
    const normalized = x - Math.floor(x)
    return Math.floor(normalized * (max - min + 1)) + min
  }

  // Mock branch performance data - TODO: Replace with actual API call for performance metrics
  const branchPerformance: BranchPerformance[] = useMemo(() => {
    const branches = branchesResponse?.data || []
    if (!Array.isArray(branches) || branches.length === 0) {
      return []
    }

    // Use a fixed reference timestamp for deterministic mock data
    const fixedTimestamp = 1704067200000 // 2024-01-01 00:00:00 UTC

    return branches.map((branch) => {
      // Convert string id to number for seed calculation
      const seed = parseInt(branch.id, 10) || 0
      const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable']
      const daysAgo = stableRandom(seed * 7, 0, 7)
      const lastActivityDate = new Date(fixedTimestamp - daysAgo * 24 * 60 * 60 * 1000)

      return {
        id: branch.id,
        branch_name: branch.branch_name,
        branch_location: branch.branch_location,
        branch_manager_name: branch.branch_manager_name || 'N/A',
        branch_manager_email: branch.branch_manager_email || 'N/A',
        totalRedemptions: stableRandom(seed * 2, 50, 550),
        totalRevenue: stableRandom(seed * 3, 5000, 55000),
        giftCardRedemptions: stableRandom(seed * 4, 20, 220),
        dashxRedeemed: stableRandom(seed * 5, 3000, 33000),
        dashpassRedeemed: stableRandom(seed * 6, 2000, 22000),
        lastActivity: lastActivityDate.toISOString(),
        performanceTrend: trends[stableRandom(seed * 8, 0, 2)] as 'up' | 'down' | 'stable',
        performanceChange: stableRandom(seed * 9, -20, 20),
      }
    })
  }, [branchesResponse])

  // Filter and sort branches
  const filteredBranches = useMemo(() => {
    let filtered = branchPerformance

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (branch) =>
          branch.branch_name.toLowerCase().includes(query) ||
          branch.branch_location.toLowerCase().includes(query) ||
          branch.branch_manager_name.toLowerCase().includes(query),
      )
    }

    // Sort branches
    const sorted = [...filtered].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortField) {
        case 'name':
          aValue = a.branch_name.toLowerCase()
          bValue = b.branch_name.toLowerCase()
          break
        case 'revenue':
          aValue = a.totalRevenue
          bValue = b.totalRevenue
          break
        case 'redemptions':
          aValue = a.totalRedemptions
          bValue = b.totalRedemptions
          break
        case 'performance':
          aValue = a.performanceChange
          bValue = b.performanceChange
          break
        default:
          aValue = a.totalRevenue
          bValue = b.totalRevenue
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    return sorted
  }, [branchPerformance, searchQuery, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

  if (!branchPerformance || branchPerformance.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Branch Performance</h1>
          <p className="text-gray-600">No branches found. Add your first branch to get started.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Branch Performance Analytics</h1>
        <p className="text-gray-600">Monitor and analyze performance metrics for each branch</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon
              icon="bi:search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search branches by name, location, or manager..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25"
            />
          </div>
        </div>
        <div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm bg-white text-gray-700 cursor-pointer focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon icon="bi:geo-alt-fill" className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredBranches.length}</div>
              <div className="text-sm text-gray-600">Total Branches</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon icon="bi:credit-card-2-front" className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredBranches.reduce((sum, b) => sum + b.totalRedemptions, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Redemptions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Icon icon="bi:graph-up" className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredBranches.reduce((sum, b) => sum + b.totalRevenue, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Icon icon="bi:wallet2" className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredBranches.reduce(
                    (sum, b) => sum + b.dashxRedeemed + b.dashpassRedeemed,
                    0,
                  ),
                )}
              </div>
              <div className="text-sm text-gray-600">Total Cards Redeemed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Branch Name
                    {sortField === 'name' && (
                      <Icon
                        icon={sortOrder === 'asc' ? 'bi:arrow-up' : 'bi:arrow-down'}
                        className="text-[#402D87]"
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Manager
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('redemptions')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Redemptions
                    {sortField === 'redemptions' && (
                      <Icon
                        icon={sortOrder === 'asc' ? 'bi:arrow-up' : 'bi:arrow-down'}
                        className="text-[#402D87]"
                      />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Revenue
                    {sortField === 'revenue' && (
                      <Icon
                        icon={sortOrder === 'asc' ? 'bi:arrow-up' : 'bi:arrow-down'}
                        className="text-[#402D87]"
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  DashX
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  DashPass
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('performance')}
                >
                  <div className="flex items-center gap-2">
                    Performance
                    {sortField === 'performance' && (
                      <Icon
                        icon={sortOrder === 'asc' ? 'bi:arrow-up' : 'bi:arrow-down'}
                        className="text-[#402D87]"
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{branch.branch_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{branch.branch_location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{branch.branch_manager_name}</div>
                    <div className="text-xs text-gray-500">{branch.branch_manager_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {branch.totalRedemptions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(branch.totalRevenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(branch.dashxRedeemed)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(branch.dashpassRedeemed)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {branch.performanceTrend === 'up' && (
                        <Icon icon="bi:arrow-up" className="text-green-600" />
                      )}
                      {branch.performanceTrend === 'down' && (
                        <Icon icon="bi:arrow-down" className="text-red-600" />
                      )}
                      {branch.performanceTrend === 'stable' && (
                        <Icon icon="bi:arrow-left-right" className="text-gray-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          branch.performanceChange > 0
                            ? 'text-green-600'
                            : branch.performanceChange < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {branch.performanceChange > 0 ? '+' : ''}
                        {branch.performanceChange}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatRelativeTime(branch.lastActivity)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
