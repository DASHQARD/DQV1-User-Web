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
import { userProfile } from '@/hooks'
import { vendorQueries } from '@/features'
import { cn } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'

export default function VendorHome() {
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService, useGetCardsByVendorIdService } = vendorQueries()

  // Check if user is a branch manager
  const isBranchManager = userProfileData?.user_type === 'branch'

  // Get vendor_id from user profile
  const vendorId = userProfileData?.vendor_id ? Number(userProfileData.vendor_id) : null

  const { data: branchesResponse, isLoading: isLoadingBranches } = useGetBranchesByVendorIdService(
    vendorId,
    false,
  )
  const { data: experiencesData, isLoading: isLoadingExperiences } = useGetCardsByVendorIdService()

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

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  // Branch manager onboarding check
  const branchOnboardingProgress = React.useMemo(() => {
    if (!isBranchManager) return null

    const hasPersonalDetails =
      Boolean(userProfileData?.fullname) &&
      Boolean(userProfileData?.street_address) &&
      Boolean(userProfileData?.dob) &&
      Boolean(userProfileData?.id_type) &&
      Boolean(userProfileData?.id_number)

    const hasIDImages = Boolean(userProfileData?.id_images?.length)
    const hasPaymentDetails =
      Boolean(userProfileData?.momo_accounts?.length) ||
      Boolean(userProfileData?.bank_accounts?.length)

    return {
      hasPersonalDetails,
      hasIDImages,
      hasPersonalDetailsAndID: hasPersonalDetails && hasIDImages,
      hasPaymentDetails,
    }
  }, [isBranchManager, userProfileData])

  const branchOnboardingComplete = React.useMemo(() => {
    if (!branchOnboardingProgress) return true
    return (
      branchOnboardingProgress.hasPersonalDetailsAndID && branchOnboardingProgress.hasPaymentDetails
    )
  }, [branchOnboardingProgress])

  const branchOnboardingSteps = React.useMemo(() => {
    if (!branchOnboardingProgress) return { completed: 0, total: 0, percentage: 100 }
    const completed =
      (branchOnboardingProgress.hasPersonalDetailsAndID ? 1 : 0) +
      (branchOnboardingProgress.hasPaymentDetails ? 1 : 0)
    const total = 2
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    }
  }, [branchOnboardingProgress])

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-8">
        <div className="pb-6 border-b border-[#e9ecef]">
          <div className="flex flex-col gap-2">
            <Text variant="span" weight="semibold" className="text-[#95aac9]">
              Dashboard
            </Text>
            <Text variant="h2" weight="semibold">
              {isBranchManager ? 'Branch Manager Dashboard' : 'Vendor Dashboard'}
            </Text>
          </div>
        </div>

        {/* Branch Manager Onboarding Section */}
        {isBranchManager && !branchOnboardingComplete && (
          <div className="bg-linear-to-br from-[#f9f5ff] via-white to-[#fdf9ff] border border-gray-100 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#402D87] text-white flex items-center justify-center shadow-lg shadow-[#402D87]/30 shrink-0">
                  <Icon icon="bi:shield-check" className="text-3xl" />
                </div>
                <div>
                  <p className="uppercase text-xs tracking-[0.3em] text-[#402D87]/70 font-semibold mb-2">
                    Branch Manager Onboarding
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
                    Complete your onboarding
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                    Finish all {branchOnboardingSteps.total} steps to activate your branch manager
                    account and unlock full access to all features.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-sm font-semibold text-[#402D87]">
                  {branchOnboardingSteps.percentage}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-[#402D87] via-[#7950ed] to-[#d977ff] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${branchOnboardingSteps.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {branchOnboardingSteps.completed} of {branchOnboardingSteps.total} steps complete
              </p>
            </div>

            {/* Onboarding Steps */}
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.PROFILE_INFORMATION)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  branchOnboardingProgress?.hasPersonalDetailsAndID
                    ? 'border-green-200 bg-green-50'
                    : 'border-[#402D87]/20 bg-white hover:border-[#402D87]/40 hover:shadow-md',
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    icon={
                      branchOnboardingProgress?.hasPersonalDetailsAndID
                        ? 'bi:check-circle-fill'
                        : 'bi:circle'
                    }
                    className={cn(
                      'text-2xl shrink-0 mt-0.5',
                      branchOnboardingProgress?.hasPersonalDetailsAndID
                        ? 'text-green-600'
                        : 'text-gray-400',
                    )}
                  />
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'font-semibold mb-1',
                        branchOnboardingProgress?.hasPersonalDetailsAndID
                          ? 'text-green-800'
                          : 'text-gray-900',
                      )}
                    >
                      Personal Details & ID Upload
                    </h4>
                    <p className="text-sm text-gray-600">
                      Complete your profile information and upload a government-issued photo ID
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_METHODS)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  branchOnboardingProgress?.hasPaymentDetails
                    ? 'border-green-200 bg-green-50'
                    : 'border-[#402D87]/20 bg-white hover:border-[#402D87]/40 hover:shadow-md',
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    icon={
                      branchOnboardingProgress?.hasPaymentDetails
                        ? 'bi:check-circle-fill'
                        : 'bi:circle'
                    }
                    className={cn(
                      'text-2xl shrink-0 mt-0.5',
                      branchOnboardingProgress?.hasPaymentDetails
                        ? 'text-green-600'
                        : 'text-gray-400',
                    )}
                  />
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'font-semibold mb-1',
                        branchOnboardingProgress?.hasPaymentDetails
                          ? 'text-green-800'
                          : 'text-gray-900',
                      )}
                    >
                      Payment Details
                    </h4>
                    <p className="text-sm text-gray-600">
                      Set up your payment method to receive payouts
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Redemptions */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:credit-card-2-front" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">0</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemptions</div>
            </div>
          </div>

          {/* Total DashX Redeemed */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:wallet2" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total DashX Redeemed</div>
            </div>
          </div>

          {/* Total DashPass Redeemed */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:ticket-perforated" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total DashPass Redeemed</div>
            </div>
          </div>

          {/* Pending Payout */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:currency-exchange" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Pending Payout</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Redemptions */}
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
              <div className="flex flex-col items-center justify-center py-8">
                <Icon icon="bi:inbox" className="text-4xl mb-2 opacity-50 text-gray-500" />
                <p className="text-sm m-0 text-gray-500">No redemptions to display</p>
              </div>
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
