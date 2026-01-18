import { Link } from 'react-router-dom'
import { Icon } from '@/libs'

import { useAuthStore } from '@/stores'

import { ROUTES } from '@/utils/constants'
import { Text } from '@/components'
import { AuditLogs, SummaryCards, VendorQardsPerformance } from '../../../components'

export default function Home() {
  const { user } = useAuthStore()

  const userType = (user as any)?.user_type

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
          {/* <div>
            {isCorporate &&
              (() => {
                const hasProfile =
                  Boolean(userProfile?.fullname) &&
                  Boolean(userProfile?.street_address) &&
                  Boolean(userProfile?.dob) &&
                  Boolean(userProfile?.id_number)
                const hasIdentityDocs = Boolean(userProfile?.id_images?.length)
                const hasProfileAndIdentity = hasProfile && hasIdentityDocs
                const hasBusinessDetails = Boolean(userProfile?.business_details?.length)
                const hasBusinessDocs = Boolean(userProfile?.business_documents?.length)
                const hasBusinessDetailsAndDocs = hasBusinessDetails && hasBusinessDocs

                const completedCount =
                  (hasProfileAndIdentity ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0)
                const totalCount = 2
                const progressPercentage = (completedCount / totalCount) * 100

                const addAccountParam = (path: string): string => {
                  const separator = path?.includes('?') ? '&' : '?'
                  return `${path}${separator}account=corporate`
                }

                const getNextIncompleteStep = () => {
                  if (!hasProfileAndIdentity) {
                    return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION
                  }
                  if (!hasBusinessDetailsAndDocs) {
                    return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS
                  }
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
          </div> */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
                Recent Activity
              </h5>
              <div>
                <Link
                  to={ROUTES.IN_APP.DASHBOARD.TRANSACTIONS}
                  className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                >
                  View All <Icon icon="bi:arrow-right" className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Show SummaryCards and QardsPerformance only if corporate has vendor account or user is vendor */}
        {(userType === 'corporate_vendor' || userType === 'vendor') && (
          <>
            <SummaryCards />
            <VendorQardsPerformance />
          </>
        )}
        <AuditLogs />
      </section>
    </div>
  )
}
