import React from 'react'
import { Text } from '@/components'
import {
  VendorSummaryCards,
  CompleteVendorWidget,
  RecentRequests,
  RecentExperiences,
  RecentBranches,
} from '@/features/dashboard/components'
import { useUserProfile } from '@/hooks'
import { vendorQueries } from '@/features'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
// import { useRedemptionQueries } from '@/features/dashboard/hooks'
import BranchHome from '../branches/BranchHome'

export default function VendorHome() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService, useGetCardsByVendorIdService } = vendorQueries()
  const { useGetCorporateBranchesListService, useGetCorporateSuperAdminCardsService } =
    corporateQueries()
  // const { useGetRedemptionsSummaryService } = useRedemptionQueries()

  // Check if user is a branch manager
  const isBranchManager = userProfileData?.user_type === 'branch'
  // Check if user is corporate super admin
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

  // Get vendor_id from user profile
  const vendorId = userProfileData?.vendor_id ? Number(userProfileData.vendor_id) : null

  // Fetch branches - use corporate endpoint if corporate super admin
  const { data: vendorBranchesResponse, isLoading: isLoadingVendorBranches } =
    useGetBranchesByVendorIdService(isCorporateSuperAdmin ? null : vendorId, false)
  const { data: corporateBranchesResponse, isLoading: isLoadingCorporateBranches } =
    useGetCorporateBranchesListService()

  // Fetch experiences/cards - use corporate super admin endpoint if corporate super admin
  const { data: vendorExperiencesData, isLoading: isLoadingVendorExperiences } =
    useGetCardsByVendorIdService()
  const { data: corporateExperiencesData, isLoading: isLoadingCorporateExperiences } =
    useGetCorporateSuperAdminCardsService()

  // Determine which data source to use
  const branchesResponse = isCorporateSuperAdmin
    ? corporateBranchesResponse
    : vendorBranchesResponse
  const isLoadingBranches = isCorporateSuperAdmin
    ? isLoadingCorporateBranches
    : isLoadingVendorBranches

  const experiencesData = isCorporateSuperAdmin ? corporateExperiencesData : vendorExperiencesData
  const isLoadingExperiences = isCorporateSuperAdmin
    ? isLoadingCorporateExperiences
    : isLoadingVendorExperiences
  // const { data: redemptionSummaryData, isLoading: isLoadingRedemptionSummary } =
  //   useGetRedemptionsSummaryService()
  // const { useGetVendorRedemptionsListService } = useRedemptionQueries()
  // const { data: redemptionsData, isLoading: isLoadingRedemptions } =
  //   useGetVendorRedemptionsListService({ limit: 5 })

  const branches = React.useMemo(() => {
    if (!branchesResponse) return []
    // Handle both array and wrapped response formats
    return Array.isArray(branchesResponse) ? branchesResponse : branchesResponse?.data || []
  }, [branchesResponse])

  const experiences = React.useMemo(() => {
    if (!experiencesData) return []
    return Array.isArray(experiencesData?.data)
      ? experiencesData.data
      : Array.isArray(experiencesData)
        ? experiencesData
        : []
  }, [experiencesData])

  // Extract redemptions from API response
  // const redemptions = React.useMemo(() => {
  //   if (!redemptionsData?.data) return []
  //   return Array.isArray(redemptionsData.data) ? redemptionsData.data : []
  // }, [redemptionsData])

  // Extract redemption summary from API response
  // const redemptionSummary = React.useMemo(() => {
  //   if (!redemptionSummaryData?.data) {
  //     return {
  //       total_redemptions: 0,
  //       total_dashx_redeemed: 0,
  //       total_dashpass_redeemed: 0,
  //       pending_payout: 0,
  //       currency: 'GHS',
  //     }
  //   }
  //   return {
  //     total_redemptions: redemptionSummaryData.data.total_redemptions || 0,
  //     total_dashx_redeemed: redemptionSummaryData.data.total_dashx_redeemed || 0,
  //     total_dashpass_redeemed: redemptionSummaryData.data.total_dashpass_redeemed || 0,
  //     pending_payout: redemptionSummaryData.data.pending_payout || 0,
  //     currency: redemptionSummaryData.data.currency || 'GHS',
  //   }
  // }, [redemptionSummaryData])

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
      <section className="py-8 flex flex-col gap-6">
        <Text variant="h2" weight="semibold">
          Vendor Dashboard
        </Text>

        {/* <div className="group relative bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
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
        </div> */}

        <VendorSummaryCards />

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
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
          </div> */}

          {/* Recent Experiences */}
          <RecentExperiences
            experiences={experiences}
            isLoading={isLoadingExperiences}
            addAccountParam={addAccountParam}
          />
        </section>

        {/* Recent Requests - Only show for corporate super admin */}
        {isCorporateSuperAdmin && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <RecentRequests />
          </div>
        )}

        {/* Branches Overview */}
        <RecentBranches
          branches={branches}
          isLoading={isLoadingBranches}
          addAccountParam={addAccountParam}
        />

        {/* Complete Vendor Onboarding Widget */}
        <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
          <CompleteVendorWidget />
        </div>
      </section>
    </div>
  )
}
