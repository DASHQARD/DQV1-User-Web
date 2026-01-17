import React from 'react'
import { Text, Loader, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import {
  VendorSummaryCards,
  VendorQardsPerformance,
  CompleteVendorWidget,
} from '@/features/dashboard/components'
import { useUserProfile } from '@/hooks'
import { vendorQueries } from '@/features'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { cn } from '@/libs'
import { formatCurrency, formatDate } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import BranchHome from '../branches/BranchHome'

export default function VendorHome() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService, useGetCardsByVendorIdService } = vendorQueries()
  const { useGetRedemptionsSummaryService } = useRedemptionQueries()

  // Check if user is a branch manager
  const isBranchManager = userProfileData?.user_type === 'branch'

  // Get vendor_id from user profile
  const vendorId = userProfileData?.vendor_id ? Number(userProfileData.vendor_id) : null

  const { data: branchesResponse, isLoading: isLoadingBranches } = useGetBranchesByVendorIdService(
    vendorId,
    false,
  )
  const { data: experiencesData, isLoading: isLoadingExperiences } = useGetCardsByVendorIdService()
  const { data: redemptionSummaryData, isLoading: isLoadingRedemptionSummary } =
    useGetRedemptionsSummaryService()
  const { useGetVendorRedemptionsListService } = useRedemptionQueries()
  const { data: redemptionsData, isLoading: isLoadingRedemptions } =
    useGetVendorRedemptionsListService({ limit: 5 })

  const branches = React.useMemo(() => {
    if (!branchesResponse) return []
    return branchesResponse
  }, [branchesResponse])

  // Get recent branches (first 5)
  const recentBranches = React.useMemo(() => {
    return branches.slice(0, 5)
  }, [branches])

  const experiences = React.useMemo(() => {
    if (!experiencesData) return []
    return Array.isArray(experiencesData) ? experiencesData : []
  }, [experiencesData])

  // Get recent experiences (first 5)
  const recentExperiences = React.useMemo(() => {
    return experiences.slice(0, 5)
  }, [experiences])

  // Extract redemptions from API response
  const redemptions = React.useMemo(() => {
    if (!redemptionsData?.data) return []
    return Array.isArray(redemptionsData.data) ? redemptionsData.data : []
  }, [redemptionsData])

  // Extract redemption summary from API response
  const redemptionSummary = React.useMemo(() => {
    if (!redemptionSummaryData?.data) {
      return {
        total_redemptions: 0,
        total_dashx_redeemed: 0,
        total_dashpass_redeemed: 0,
        pending_payout: 0,
        currency: 'GHS',
      }
    }
    return {
      total_redemptions: redemptionSummaryData.data.total_redemptions || 0,
      total_dashx_redeemed: redemptionSummaryData.data.total_dashx_redeemed || 0,
      total_dashpass_redeemed: redemptionSummaryData.data.total_dashpass_redeemed || 0,
      pending_payout: redemptionSummaryData.data.pending_payout || 0,
      currency: redemptionSummaryData.data.currency || 'GHS',
    }
  }, [redemptionSummaryData])

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  // If branch manager, render BranchHome instead
  if (isBranchManager) {
    return <BranchHome />
  }

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-8">
        <div className="pb-6 border-b border-[#e9ecef]">
          <div className="flex flex-col gap-2">
            <Text variant="span" weight="semibold" className="text-[#95aac9]">
              Dashboard
            </Text>
            <Text variant="h2" weight="semibold">
              Vendor Dashboard
            </Text>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="group relative bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/20 to-transparent rounded-bl-full" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/30">
                <Icon icon="bi:credit-card-2-front" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {isLoadingRedemptionSummary ? (
                <Loader />
              ) : (
                <>
                  <div className="text-4xl font-bold leading-tight text-gray-900">
                    {redemptionSummary.total_redemptions}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Redemptions</div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Redemptions */}

          {/* Total DashX Redeemed */}
          <div className="group relative bg-linear-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-400/20 to-transparent rounded-bl-full" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/30">
                  <Icon icon="bi:wallet2" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isLoadingRedemptionSummary ? (
                  <Loader />
                ) : (
                  <>
                    <div className="text-4xl font-bold leading-tight text-gray-900">
                      {formatCurrency(
                        redemptionSummary.total_dashx_redeemed,
                        redemptionSummary.currency,
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Total DashX Redeemed</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Total DashPass Redeemed */}
          <div className="group relative bg-linear-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-pink-400/20 to-transparent rounded-bl-full" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-pink-500/30">
                  <Icon icon="bi:ticket-perforated" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isLoadingRedemptionSummary ? (
                  <Loader />
                ) : (
                  <>
                    <div className="text-4xl font-bold leading-tight text-gray-900">
                      {formatCurrency(
                        redemptionSummary.total_dashpass_redeemed,
                        redemptionSummary.currency,
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Total DashPass Redeemed</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pending Payout */}
          <div className="group relative bg-linear-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-400/20 to-transparent rounded-bl-full" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/30">
                  <Icon icon="bi:currency-exchange" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isLoadingRedemptionSummary ? (
                  <Loader />
                ) : (
                  <>
                    <div className="text-4xl font-bold leading-tight text-gray-900">
                      {formatCurrency(redemptionSummary.pending_payout, redemptionSummary.currency)}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Pending Payout</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent
                Redemptions
              </h5>
              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS)}
                className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
              >
                View all <Icon icon="bi:arrow-right" className="ml-1" />
              </Link>
            </div>
            <div className="px-6 pb-6">
              {isLoadingRedemptions ? (
                <div className="flex justify-center items-center py-8">
                  <Loader />
                </div>
              ) : redemptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Icon icon="bi:inbox" className="text-4xl mb-2 opacity-50 text-gray-500" />
                  <p className="text-sm m-0 text-gray-500">No redemptions to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((redemption: any) => {
                    const redemptionDate = formatDate(redemption.redemption_date)

                    return (
                      <div
                        key={redemption.redemption_id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                            <Icon icon="bi:arrow-left-right" className="text-[#402D87]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text variant="span" weight="semibold" className="text-gray-900 block">
                              {redemption.card_type || 'Gift Card'}
                            </Text>
                            <div className="flex items-center gap-2 mt-1">
                              <Text variant="span" className="text-gray-500 text-sm">
                                {redemption.branch_name || redemption.vendor_name || 'Branch'}
                              </Text>
                              <span className="text-gray-400">•</span>
                              <Text variant="span" className="text-gray-500 text-sm">
                                {redemptionDate}
                              </Text>
                              {redemption.status && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      redemption.status === 'success' ||
                                        redemption.status === 'completed'
                                        ? 'text-green-600'
                                        : redemption.status === 'pending'
                                          ? 'text-yellow-600'
                                          : 'text-gray-600',
                                    )}
                                  >
                                    {redemption.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Text variant="span" weight="semibold" className="text-[#402D87]">
                            {formatCurrency(redemption.amount || 0, 'GHS')}
                          </Text>
                          <Icon
                            icon="bi:chevron-right"
                            className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                          />
                        </div>
                      </div>
                    )
                  })}
                  {redemptionsData?.pagination?.hasMore && (
                    <div className="text-center pt-2">
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS)}
                        className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                      >
                        View all redemptions
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Experiences */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> My Experiences
                {experiences.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({experiences.length})
                  </span>
                )}
              </h5>
              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
              >
                View all <Icon icon="bi:arrow-right" className="ml-1" />
              </Link>
            </div>
            <div className="px-6 pb-6">
              {isLoadingExperiences ? (
                <div className="flex justify-center items-center py-8">
                  <Loader />
                </div>
              ) : recentExperiences.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    image={EmptyStateImage}
                    title="No experiences created yet"
                    description="Create your first experience to start offering gift cards to customers"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExperiences.map((experience: any) => (
                    <Link
                      key={experience.id}
                      to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                          <Icon icon="bi:briefcase" className="text-[#402D87]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text variant="span" weight="semibold" className="text-gray-900 block">
                            {experience.product || experience.card_name || 'Experience'}
                          </Text>
                          <div className="flex items-center gap-2 mt-1">
                            <Text variant="span" className="text-gray-500 text-sm">
                              {experience.type || experience.card_type || 'Gift Card'}
                            </Text>
                            {experience.status && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    experience.status === 'approved' ||
                                      experience.status === 'verified'
                                      ? 'text-green-600'
                                      : experience.status === 'pending'
                                        ? 'text-yellow-600'
                                        : 'text-gray-600',
                                  )}
                                >
                                  {experience.status}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {experience.price && (
                          <Text variant="span" weight="semibold" className="text-[#402D87]">
                            {formatCurrency(Number(experience.price), experience.currency || 'GHS')}
                          </Text>
                        )}
                        <Icon
                          icon="bi:chevron-right"
                          className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                        />
                      </div>
                    </Link>
                  ))}
                  {experiences.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                        className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                      >
                        View all {experiences.length} experiences
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Branches Overview */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:building" className="text-[#402D87] mr-2" /> Branches
              {branches.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({branches.length})</span>
              )}
            </h5>
            <Link
              to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              Manage branches <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            {isLoadingBranches ? (
              <div className="flex justify-center items-center py-8">
                <Loader />
              </div>
            ) : recentBranches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Icon icon="bi:building" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm m-0">No branches added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBranches.map((branch: any) => (
                  <Link
                    key={branch.id}
                    to={addAccountParam(`${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branch.id}`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                        <Icon icon="bi:building" className="text-[#402D87]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text variant="span" weight="semibold" className="text-gray-900 block">
                          {branch.branch_name}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                          <Icon icon="bi:geo-alt" className="text-gray-400 text-sm" />
                          <Text variant="span" className="text-gray-500 text-sm truncate">
                            {branch.branch_location}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {branch.status && (
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            branch.status === 'approved' || branch.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : branch.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800',
                          )}
                        >
                          {branch.status}
                        </span>
                      )}
                      <Icon
                        icon="bi:chevron-right"
                        className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                      />
                    </div>
                  </Link>
                ))}
                {branches.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
                      className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                    >
                      View all {branches.length} branches
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vendor Widgets */}
        <VendorSummaryCards />
        <VendorQardsPerformance />

        {/* Complete Vendor Onboarding Widget */}
        <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
          <CompleteVendorWidget />
        </div>
      </section>
    </div>
  )
}
