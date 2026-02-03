import { Text, Loader, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs'
import { formatCurrency, formatDate } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import LoaderGif from '@/assets/gifs/loader.gif'
import { StatusCell } from '@/components'
import { CompleteVendorWidget } from '@/features/dashboard/components'
import { MetricsCard } from '@/features/dashboard/branch'
import { useBranchHome } from '@/features/dashboard/branch'

export default function BranchHome() {
  const {
    isLoading,
    isLoadingRedemptions,
    isLoadingBranchExperiences,
    branchExperiences,
    recentRedemptions,
    addAccountParam,
    branchOnboardingProgress,
    branchOnboardingComplete,
    branchOnboardingSteps,
    metrics,
  } = useBranchHome()

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      ) : (
        <>
          <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
            <section className="py-8 flex flex-col gap-8">
              <div className="pb-6 border-b border-[#e9ecef]">
                <div className="flex flex-col gap-2">
                  <Text variant="span" weight="semibold" className="text-[#95aac9]">
                    Dashboard
                  </Text>
                  <Text variant="h2" weight="semibold">
                    Branch Manager Dashboard
                  </Text>
                </div>
              </div>

              {/* Branch Manager Onboarding Section */}
              {!branchOnboardingComplete && (
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
                          Finish all {branchOnboardingSteps.total} steps to activate your branch
                          manager account and unlock full access to all features.
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
                      {branchOnboardingSteps.completed} of {branchOnboardingSteps.total} steps
                      complete
                    </p>
                  </div>

                  {/* Onboarding Steps */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link
                      to={addAccountParam(
                        ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.PROFILE_INFORMATION,
                      )}
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
                            Complete your profile information and upload a government-issued photo
                            ID
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        branchOnboardingProgress?.hasPaymentDetails
                          ? 'border-green-200 bg-green-50'
                          : 'border-[#402D87]/20 bg-white',
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
                            {branchOnboardingProgress?.hasPaymentDetails
                              ? 'Your vendor account has already set up payment methods. Payouts will be processed through the vendor account.'
                              : 'Your vendor account will set up payment methods for receiving payouts.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Cards - Only show if onboarding is complete */}
              {branchOnboardingComplete && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MetricsCard
                    icon="bi:wallet2"
                    value={formatCurrency(Number(metrics.totalDashXRedeemed), 'GHS')}
                    label="Total DashX Redeemed"
                  />
                  <MetricsCard
                    icon="bi:ticket-perforated"
                    value={formatCurrency(Number(metrics.totalDashPassRedeemed), 'GHS')}
                    label="Total DashPass Redeemed"
                  />
                  <MetricsCard
                    icon="bi:currency-exchange"
                    value={formatCurrency(Number(metrics.pendingPayout), 'GHS')}
                    label="Pending Payout"
                  />
                </div>
              )}

              {/* Quick Actions - Only show if onboarding is complete */}
              {branchOnboardingComplete && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Redemptions */}
                  <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
                    <div className="p-6 pb-0 flex justify-between items-center mb-5">
                      <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                        <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent
                        Redemptions
                      </h5>
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.BRANCH.REDEMPTIONS)}
                        className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                      >
                        View all <Icon icon="bi:arrow-right" className="ml-1" />
                      </Link>
                    </div>
                    <div className="px-6 pb-6">
                      {isLoadingRedemptions ? (
                        <div className="flex items-center justify-center py-8">
                          <img src={LoaderGif} alt="Loading..." className="w-8 h-8" />
                        </div>
                      ) : recentRedemptions.length === 0 ? (
                        <EmptyState
                          image={EmptyStateImage}
                          title="No Redemptions Yet"
                          description="Once redemptions are made for this branch, they will appear here."
                        />
                      ) : (
                        <div className="space-y-3">
                          {recentRedemptions.map((redemption: any) => {
                            const redemptionDate =
                              redemption.redemption_date ||
                              redemption.created_at ||
                              redemption.updated_at
                            return (
                              <div
                                key={redemption.id || redemption.redemption_id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                                    <Icon
                                      icon="bi:arrow-left-right"
                                      className="text-[#402D87] text-lg"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Text
                                        variant="span"
                                        weight="semibold"
                                        className="text-gray-900 text-sm"
                                      >
                                        {redemption.card_type || 'Gift Card'}
                                      </Text>
                                      {redemption.redemption_id && (
                                        <Text variant="span" className="text-gray-500 text-xs">
                                          #{redemption.redemption_id}
                                        </Text>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {redemption.phone_number && (
                                        <span className="flex items-center gap-1">
                                          <Icon icon="bi:phone" className="size-3" />
                                          {redemption.phone_number}
                                        </span>
                                      )}
                                      {redemptionDate && (
                                        <span className="flex items-center gap-1">
                                          <Icon icon="bi:calendar" className="size-3" />
                                          {formatDate(redemptionDate)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                  <div className="text-right">
                                    <Text
                                      variant="span"
                                      weight="bold"
                                      className="text-gray-900 block"
                                    >
                                      {formatCurrency(
                                        redemption.amount || '0',
                                        redemption.currency || 'GHS',
                                      )}
                                    </Text>
                                    {redemption.status && (
                                      <StatusCell
                                        getValue={() => redemption.status}
                                        row={{
                                          original: {
                                            id: String(
                                              redemption.id || redemption.redemption_id || '',
                                            ),
                                            status: redemption.status,
                                          },
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Experiences */}
                  <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
                    <div className="p-6 pb-0 flex justify-between items-center mb-5">
                      <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                        <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> My
                        Experiences
                        {branchExperiences.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({branchExperiences.length})
                          </span>
                        )}
                      </h5>
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.BRANCH.EXPERIENCE)}
                        className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                      >
                        View all <Icon icon="bi:arrow-right" className="ml-1" />
                      </Link>
                    </div>
                    <div className="px-6 pb-6">
                      {isLoadingBranchExperiences ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader />
                        </div>
                      ) : branchExperiences.length === 0 ? (
                        <div className="py-8">
                          <EmptyState
                            image={EmptyStateImage}
                            title="No experiences created yet"
                            description="Create your first experience to start offering gift cards to customers"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {branchExperiences.map((experience: any) => (
                            <Link
                              key={experience.id}
                              to={addAccountParam(ROUTES.IN_APP.DASHBOARD.BRANCH.EXPERIENCE)}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                                  <Icon icon="bi:briefcase" className="text-[#402D87]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Text
                                    variant="span"
                                    weight="semibold"
                                    className="text-gray-900 block"
                                  >
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
                                    {formatCurrency(
                                      Number(experience.price),
                                      experience.currency || 'GHS',
                                    )}
                                  </Text>
                                )}
                                <Icon
                                  icon="bi:chevron-right"
                                  className="text-gray-400 group-hover:text-[#402D87] transition-colors"
                                />
                              </div>
                            </Link>
                          ))}
                          {branchExperiences.length > 5 && (
                            <div className="text-center pt-2">
                              <Link
                                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.BRANCH.EXPERIENCE)}
                                className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                              >
                                View all {branchExperiences.length} experiences
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </section>
            <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
              <CompleteVendorWidget />
            </div>
          </div>
        </>
      )}
    </>
  )
}
