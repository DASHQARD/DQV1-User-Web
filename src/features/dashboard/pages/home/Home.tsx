import React from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { useVendorDashboardMetrics } from '../../hooks/useVendorDashboardMetrics'
import { useAuthStore } from '@/stores'
import { formatRelativeTime, updateLastLoginTime } from '@/utils/format'
import LoaderGif from '@/assets/gifs/loader.gif'
import { ROUTES } from '@/utils/constants'
import BecomeVendorWidget from '../../components/BecomeVendorWidget'
import { useUserProfile } from '@/hooks'
import { cn } from '@/libs'
import { Text } from '@/components'
import { AuditLogs, QardsPerformance, SummaryCards } from '../../components'

interface Activity {
  type: 'purchase' | 'redemption'
  icon: string
  title: string
  description: string
  amount: number
  date: string
}

export default function Home() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfile()

  // Check URL for account parameter, fallback to user type
  const urlAccount = searchParams.get('account')
  const userType = (user as any)?.user_type

  // Handle corporate_vendor users - they can switch between vendor and corporate
  const isVendor =
    urlAccount === 'vendor' ||
    (!urlAccount && (userType === 'vendor' || userType === 'corporate_vendor'))
  const isCorporate = urlAccount === 'corporate' || (!urlAccount && userType === 'corporate')

  // Corporate/User dashboard metrics
  const {
    isLoading: isCorporateLoading,
    recentPurchases,
    recentRedemptions,
    formatCurrency,
  } = useDashboardMetrics()

  // Vendor dashboard metrics
  const {
    isLoading: isVendorLoading,
    metrics: vendorMetrics,
    recentRedemptions: vendorRedemptions,
    formatCurrency: formatVendorCurrency,
  } = useVendorDashboardMetrics()

  const isLoading = isVendor ? isVendorLoading : isCorporateLoading

  // Update last login time on mount
  React.useEffect(() => {
    updateLastLoginTime()
  }, [])

  // Combined activity timeline
  const combinedActivity = React.useMemo<Activity[]>(() => {
    const activities: Activity[] = []

    // Calculate cutoff date based on selected period
    const daysAgo = 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    if (isVendor) {
      // For vendors, only show redemptions
      vendorRedemptions.forEach((redemption) => {
        const redemptionDate = new Date(redemption.updated_at)
        if (redemptionDate >= cutoffDate) {
          activities.push({
            type: 'redemption',
            icon: 'bi:credit-card-2-front',
            title: 'Gift Card Redemption',
            description: `${redemption.giftCardType} redeemed`,
            amount: redemption.amount,
            date: redemption.updated_at,
          })
        }
      })
    } else {
      // For corporate/users, show both purchases and redemptions
      recentPurchases.forEach((purchase) => {
        const purchaseDate = new Date(purchase.updated_at)
        if (purchaseDate >= cutoffDate) {
          activities.push({
            type: 'purchase',
            icon: 'bi:cart-plus',
            title: 'Purchase Transaction',
            description: 'DashPro card purchased',
            amount: purchase.amount,
            date: purchase.updated_at,
          })
        }
      })

      recentRedemptions.forEach((redemption) => {
        const redemptionDate = new Date(redemption.updated_at)
        if (redemptionDate >= cutoffDate) {
          activities.push({
            type: 'redemption',
            icon: 'bi:credit-card-2-front',
            title: 'Redemption Transaction',
            description: 'Amount redeemed at vendor',
            amount: redemption.amount,
            date: redemption.updated_at,
          })
        }
      })
    }

    // Sort by date (most recent first) and limit to 8 items
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [isVendor, recentPurchases, recentRedemptions, vendorRedemptions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl">
        <div className="text-center">
          <img src={LoaderGif} alt="Loading..." className="w-20 h-auto mx-auto mb-5" />
          <p className="text-[#6c757d] text-base m-0">Loading dashboard analytics...</p>
        </div>
      </div>
    )
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
              Dashboard Overview
            </Text>
          </div>
        </div>

        {/* Continue Your Onboarding - Only for Corporate Users */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {isCorporate &&
              (() => {
                const hasProfile =
                  Boolean(userProfile?.fullname) &&
                  Boolean(userProfile?.street_address) &&
                  Boolean(userProfile?.dob) &&
                  Boolean(userProfile?.id_number)
                const hasIdentityDocs = Boolean(userProfile?.id_images?.length)
                const hasBusinessDetails = Boolean(userProfile?.business_details?.length)
                const hasBusinessDocs = Boolean(userProfile?.business_documents?.length)

                const completedCount =
                  (hasProfile ? 1 : 0) +
                  (hasIdentityDocs ? 1 : 0) +
                  (hasBusinessDetails ? 1 : 0) +
                  (hasBusinessDocs ? 1 : 0)
                const totalCount = 4
                const progressPercentage = (completedCount / totalCount) * 100

                const addAccountParam = (path: string): string => {
                  const separator = path?.includes('?') ? '&' : '?'
                  return `${path}${separator}account=corporate`
                }

                const getNextIncompleteStep = () => {
                  if (!hasProfile) return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION
                  if (!hasIdentityDocs) return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.UPLOAD_ID
                  if (!hasBusinessDetails)
                    return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS
                  if (!hasBusinessDocs)
                    return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_IDENTIFICATION_CARDS
                  return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT
                }

                return (
                  <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden h-full">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex flex-col gap-6 flex-1">
                        <div className="flex flex-col gap-1">
                          <Text variant="h2" weight="semibold" className="text-[#111827]">
                            Continue your setup...
                          </Text>
                          <Text variant="span" className=" text-gray-600">
                            It looks like you've still got a few steps to complete before you're
                            selling gift cards online.
                          </Text>
                        </div>

                        {/* Progress Section */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Progress
                            </span>
                            <span className="text-2xl font-bold text-[#111827]">
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#402D87] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Continue Button - At Bottom */}
                      <button
                        onClick={() => navigate(addAccountParam(getNextIncompleteStep()))}
                        disabled={completedCount === totalCount}
                        className={cn(
                          'w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-auto',
                          completedCount === totalCount
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#402D87] text-white hover:bg-[#5B4397] shadow-sm',
                        )}
                      >
                        {completedCount === totalCount ? (
                          'Onboarding Complete'
                        ) : (
                          <>
                            Continue set up
                            <Icon icon="bi:arrow-right" className="text-base" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })()}
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
                Recent Activity
              </h5>
              <div>
                <Link
                  to={ROUTES.IN_APP.DASHBOARD.HOME + '/transactions'}
                  className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                >
                  View All <Icon icon="bi:arrow-right" className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="px-6 pb-6">
              {combinedActivity.length === 0 ? (
                <div className="text-center py-10 text-[#6c757d]">
                  <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
                  <p className="m-0 text-sm">No recent activity to display</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {combinedActivity.map((activity, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 py-4 ${
                        index < combinedActivity.length - 1 ? 'border-b border-[#f1f3f4]' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 ${
                          activity.type === 'purchase'
                            ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745]'
                            : 'bg-[rgba(64,45,135,0.1)] text-[#402D87]'
                        }`}
                      >
                        <Icon icon={activity.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-[#495057] text-sm">
                            {activity.title}
                          </span>
                          <span className="font-bold text-[#402D87] text-sm whitespace-nowrap ml-4">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#6c757d] text-[13px]">{activity.description}</span>
                          <span className="text-[#adb5bd] text-xs whitespace-nowrap ml-4">
                            {formatRelativeTime(activity.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <SummaryCards />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QardsPerformance />
          <AuditLogs />
        </div>

        {isVendor && (
          /* Vendor Metrics */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Number of Gift Cards Redeemed */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:credit-card-2-front" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {vendorMetrics.totalRedemptions}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Gift Cards Redeemed</div>
              </div>
            </div>

            {/* Total DashX Redeemed */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:wallet2" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatVendorCurrency(vendorMetrics.totalDashxRedeemed)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Total DashX Redeemed</div>
              </div>
            </div>

            {/* Total DashPass Redeemed */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:wallet2" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatVendorCurrency(vendorMetrics.totalDashpassRedeemed)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">
                  Total DashPass Redeemed
                </div>
              </div>
            </div>

            {/* Pending Payout */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:cash-coin" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatVendorCurrency(vendorMetrics.pendingPayout)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Pending Payout</div>
              </div>
            </div>
          </div>
        )}

        {/* Vendor-Specific Sections */}
        {isVendor && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gift Card Performance Analytics */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
              <div className="p-6 pb-0 mb-5">
                <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                  <Icon icon="bi:bar-chart" className="text-[#402D87] mr-2" />
                  Gift Card Performance Analytics
                </h5>
                <p className="text-sm text-[#6c757d] mt-2 m-0">
                  See which gift cards are performing well - ranked by total redemptions
                </p>
              </div>

              <div className="px-6 pb-6">
                {vendorMetrics.giftCardPerformance.length === 0 ? (
                  <div className="text-center py-10 text-[#6c757d]">
                    <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
                    <p className="m-0 text-sm">No performance data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendorMetrics.giftCardPerformance.map((performance, index) => (
                      <div
                        key={index}
                        className={`pb-4 border-b border-[#f1f3f4] last:border-b-0 ${
                          index === 0 ? 'bg-[#f8f9fa] -mx-6 px-6 pt-4 rounded-lg' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            {index === 0 && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#402D87] text-white text-xs font-bold">
                                <Icon icon="bi:star-fill" className="text-xs" />
                              </div>
                            )}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-sm font-bold">
                              {performance.type.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-[#495057] flex items-center gap-2">
                                {performance.type}
                                {index === 0 && (
                                  <span className="text-xs bg-[#402D87] text-white px-2 py-0.5 rounded-full">
                                    Top Performer
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#6c757d]">
                                {performance.redemptionCount} redemptions
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#402D87]">
                              {formatVendorCurrency(performance.totalRedeemed)}
                            </div>
                            <div className="text-xs text-[#6c757d]">
                              {performance.percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-[#e9ecef] rounded-full h-2 mt-2">
                          <div
                            className="bg-gradient-to-r from-[#402D87] to-[#2d1a72] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${performance.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-[#6c757d] mt-1">
                          Avg: {formatVendorCurrency(performance.averageAmount)} per redemption
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payout Information */}
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
              <div className="p-6 pb-0 mb-5">
                <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                  <Icon icon="bi:cash-coin" className="text-[#402D87] mr-2" />
                  Payout Information
                </h5>
              </div>

              <div className="px-6 pb-6 space-y-0">
                <div className="py-4 border-b border-[#f1f3f4]">
                  <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                    Pending Payout
                  </div>
                  <div className="text-2xl font-bold text-[#402D87] mb-1">
                    {formatVendorCurrency(vendorMetrics.pendingPayout)}
                  </div>
                  <div className="text-[13px] text-[#adb5bd]">Amount pending for next payout</div>
                </div>

                <div className="py-4 border-b border-[#f1f3f4]">
                  <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                    Last Payout Amount
                  </div>
                  <div className="text-xl font-semibold text-[#495057] mb-1">
                    {formatVendorCurrency(vendorMetrics.payoutAmount)}
                  </div>
                  <div className="text-[13px] text-[#adb5bd]">Previous payout amount</div>
                </div>

                <div className="py-4">
                  <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                    Payout Schedule
                  </div>
                  <div className="text-base font-semibold text-[#495057] mb-1">
                    {vendorMetrics.payoutPeriod}
                  </div>
                  <div className="text-[13px] text-[#adb5bd]">
                    Your next payout will be processed at the end of this period
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Become Vendor Widget - Fixed at Bottom Right */}
        {(isCorporate || userType === 'corporate') && (
          <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
            <BecomeVendorWidget />
          </div>
        )}
      </section>
    </div>
  )
}
