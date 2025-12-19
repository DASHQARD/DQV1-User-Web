import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { useUserProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { Text } from '@/components'

export default function CompleteVendorWidget() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { data: userProfile } = useUserProfile()
  const navigate = useNavigate()

  // Helper function to add account parameter to URLs
  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  // Check completion status for vendor onboarding steps
  // Step 1: Profile Information & ID Upload (combined in one form)
  const hasProfile =
    Boolean(userProfile?.fullname) &&
    Boolean(userProfile?.street_address) &&
    Boolean(userProfile?.dob) &&
    Boolean(userProfile?.id_number)
  const hasID = Boolean(userProfile?.id_images?.length)
  const hasProfileAndID = hasProfile && hasID

  // Step 2: Business Details & Business Documents (combined flow)
  const hasBusinessDetails = Boolean(userProfile?.business_details?.length)
  const hasBusinessDocs = Boolean(userProfile?.business_documents?.length)
  const hasBusinessDetailsAndDocs = hasBusinessDetails && hasBusinessDocs

  const completedCount = (hasProfileAndID ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0)
  const totalCount = 2
  const progressPercentage = (completedCount / totalCount) * 100

  // Find the first incomplete step - use compliance routes which work for vendors too
  const getNextIncompleteStep = () => {
    if (!hasProfileAndID) {
      return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION
    }
    if (!hasBusinessDetailsAndDocs) {
      return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS
    }
    return ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT
  }

  const handleContinue = () => {
    const nextStep = getNextIncompleteStep()
    navigate(addAccountParam(nextStep))
  }

  const isComplete = completedCount === totalCount

  // Don't show widget if already complete
  if (isComplete) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[#f1f3f4] overflow-hidden w-full">
      {/* Collapsed State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-full border-2 border-gray-400 border-t-transparent" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">
                Complete your vendor onboarding
              </div>
              <div className="text-xs text-gray-500">
                Finish your profile to activate your vendor account
              </div>
            </div>
          </div>
          <Icon icon="bi:chevron-down" className="text-gray-400 text-lg" />
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="p-6 flex flex-col gap-4">
          <section className="p-4 border-4 border-[#F5F6F9] rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between w-full">
                <section>
                  <Text variant="h4" weight="medium" className="text-gray-900 mb-1">
                    Complete your vendor onboarding process
                  </Text>
                  <Text variant="span" className="text-gray-600">
                    Finish all 2 steps to activate your vendor account.
                  </Text>
                </section>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg
                    fill="none"
                    focusable="false"
                    height="24"
                    role="img"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                    width="24"
                    className="text-gray-600 shrink-0"
                  >
                    <path
                      d="M17.4697 8.46973L12.0001 13.9394L6.53039 8.46973L5.46973 9.53039L12.0001 16.0607L18.5304 9.53039L17.4697 8.46973Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-sm font-semibold text-[#402D87]">
                  {progressPercentage}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#402D87] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </section>

          {/* Requirements Checklist */}
          <div className="space-y-3 mb-6">
            <Link
              to={addAccountParam(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                hasProfileAndID ? 'bg-gray-50 opacity-75' : 'bg-[#f5f1ff] hover:bg-[#ede9fe]',
              )}
            >
              <Icon
                icon={hasProfileAndID ? 'bi:check-circle-fill' : 'bi:circle'}
                className={cn(
                  'text-lg shrink-0',
                  hasProfileAndID ? 'text-[#059669]' : 'text-gray-400',
                )}
              />
              <div className="flex-1">
                <div
                  className={cn(
                    'text-sm font-medium',
                    hasProfileAndID ? 'text-gray-500 line-through' : 'text-gray-900',
                  )}
                >
                  Profile Information & ID Upload
                </div>
                {!hasProfileAndID && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Complete your profile information and upload a government-issued photo ID
                  </div>
                )}
              </div>
            </Link>

            <Link
              to={addAccountParam(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                hasBusinessDetailsAndDocs
                  ? 'bg-gray-50 opacity-75'
                  : 'bg-[#f5f1ff] hover:bg-[#ede9fe]',
              )}
            >
              <Icon
                icon={hasBusinessDetailsAndDocs ? 'bi:check-circle-fill' : 'bi:circle'}
                className={cn(
                  'text-lg shrink-0',
                  hasBusinessDetailsAndDocs ? 'text-[#059669]' : 'text-gray-400',
                )}
              />
              <div className="flex-1">
                <div
                  className={cn(
                    'text-sm font-medium',
                    hasBusinessDetailsAndDocs ? 'text-gray-500 line-through' : 'text-gray-900',
                  )}
                >
                  Business Details & Documents
                </div>
                {!hasBusinessDetailsAndDocs && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Complete your business information and upload business documents
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Continue Button */}
          {(() => {
            const getNextStepName = () => {
              if (!hasProfileAndID) return 'Profile Information & ID Upload'
              if (!hasBusinessDetailsAndDocs) return 'Business Details & Documents'
              return null
            }

            const nextStepName = getNextStepName()

            return (
              <button
                onClick={handleContinue}
                disabled={isComplete}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200',
                  isComplete
                    ? 'bg-[#059669] text-white hover:bg-[#047857] shadow-sm cursor-default'
                    : 'bg-[#402D87] text-white hover:bg-[#5B4397] shadow-sm',
                )}
              >
                {isComplete
                  ? 'Onboarding Complete'
                  : nextStepName
                    ? `Continue with ${nextStepName}`
                    : 'Continue'}
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )
}
