import { Text, Button, Loader } from '@/components'
import { Icon } from '@/libs'
import { StarImage } from '@/assets/images'
import { cn } from '@/libs'
import {
  RecentTransactions,
  CompleteCorporateWidget,
  CorporateAccountStatusBanner,
  CorporateVendorAccountsCard,
  CreateVendorAccount,
} from '@/features/dashboard/components'
import { useCorporateHome } from '../../hooks/useCorporateHome'

export default function CorporateHome() {
  const {
    metrics,
    formatCurrency,
    isLoading,
    isOnboardingStatusLoading,
    isCorporateAdmin,
    onboardingProgress: { hasProfileAndID, hasBusinessDetailsAndDocs },
    completedCount,
    totalCount,
    progressPercentage,
    isComplete,
    // isPendingAndKYCComplete,
    canAccessRestrictedFeatures,
    handleContinue,
    getNextStepName,
    navigateToProfileStep,
    navigateToBusinessStep,
    isCorporateSuperAdmin,
    openCreateVendorAccount,
    myVendorAccounts,
    isLoadingVendorAccounts,
    addAccountParam,
    accountStatusBanner,
  } = useCorporateHome()

  const nextStepName = getNextStepName()

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-x-hidden min-h-[600px]">
      <section className="py-6 sm:py-8 flex flex-col gap-6 min-w-0">
        <Text variant="h2" weight="bold" className="text-gray-900 text-3xl">
          Dashboard
        </Text>

        {/* Account status banner – explains why some features are locked or coming soon */}
        <CorporateAccountStatusBanner status={accountStatusBanner} />

        {/* Onboarding status loading state to prevent flash before profile resolves */}
        {isOnboardingStatusLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center gap-4 min-h-[240px]">
            <Loader />
            <Text variant="span" className="text-sm text-gray-500">
              Checking onboarding status...
            </Text>
          </div>
        ) : null}

        {/* Onboarding Steps Section - Only show if not complete */}
        {!isOnboardingStatusLoading && !isComplete && (
          <div className="bg-linear-to-br from-[#f9f5ff] via-white to-[#fdf9ff] border border-gray-100 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 min-w-0">
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#402D87] text-white flex items-center justify-center shadow-lg shadow-[#402D87]/30 shrink-0">
                  <Icon icon="bi:shield-check" className="text-2xl sm:text-3xl" />
                </div>
                <div className="min-w-0">
                  <p className="uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-[#402D87]/70 font-semibold mb-2">
                    Corporate Onboarding
                  </p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] mb-2">
                    Complete your onboarding
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                    Finish all {totalCount} {totalCount === 1 ? 'step' : 'steps'} to activate your
                    corporate account and unlock full access to all features.
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex shrink-0">
                <Button
                  variant="secondary"
                  onClick={handleContinue}
                  className="rounded-full whitespace-normal text-center h-auto min-h-12 py-3 px-5 leading-snug"
                >
                  {nextStepName ? `Continue with ${nextStepName}` : 'Continue'}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Overall Progress
                </span>
                <span className="text-sm font-semibold text-[#402D87]">
                  {progressPercentage}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-[#402D87] via-[#7950ed] to-[#d977ff] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {completedCount} of {totalCount} steps complete
              </p>
            </div>

            <div className="mb-6 lg:hidden">
              <Button
                variant="secondary"
                onClick={handleContinue}
                className="rounded-full w-full whitespace-normal text-center h-auto min-h-12 py-3 px-4 leading-snug"
              >
                {nextStepName ? 'Continue onboarding' : 'Continue'}
              </Button>
              {nextStepName ? (
                <p className="mt-2 text-xs text-center text-gray-500">Next: {nextStepName}</p>
              ) : null}
            </div>

            {/* Steps Checklist */}
            <div className={cn('grid gap-4', isCorporateAdmin ? 'grid-cols-1' : 'md:grid-cols-2')}>
              <div
                className={cn(
                  'relative rounded-xl border p-4 sm:p-5 transition-all min-w-0',
                  hasProfileAndID
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-[#402D87]/20 shadow-md hover:shadow-lg',
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0',
                      hasProfileAndID
                        ? 'bg-[#ecfdf5] text-[#059669]'
                        : 'bg-[#fff7ed] text-[#c2410c]',
                    )}
                  >
                    <Icon
                      icon={hasProfileAndID ? 'bi:check-circle-fill' : 'bi:exclamation-circle'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-2">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          {isCorporateAdmin ? 'Required Step' : 'Step 1'}
                        </p>
                        <h4 className="text-base sm:text-lg font-semibold text-[#111827]">
                          Profile Information & ID Upload
                        </h4>
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold px-3 py-1 rounded-full shrink-0 self-start',
                          hasProfileAndID
                            ? 'bg-[#ecfdf5] text-[#059669]'
                            : 'bg-[#fef2f2] text-[#dc2626]',
                        )}
                      >
                        {hasProfileAndID ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete your profile information and upload a government-issued photo ID for
                      verification.
                    </p>
                    {!hasProfileAndID && (
                      <Button
                        variant="secondary"
                        size="small"
                        className="rounded-full"
                        onClick={navigateToProfileStep}
                      >
                        Complete step
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Only show Business Details step for non-corporate-admin users */}
              {!isCorporateAdmin && (
                <div
                  className={cn(
                    'relative rounded-xl border p-4 sm:p-5 transition-all min-w-0',
                    hasBusinessDetailsAndDocs
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : 'bg-white border-[#402D87]/20 shadow-md hover:shadow-lg',
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0',
                        hasBusinessDetailsAndDocs
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : 'bg-[#fff7ed] text-[#c2410c]',
                      )}
                    >
                      <Icon
                        icon={
                          hasBusinessDetailsAndDocs
                            ? 'bi:check-circle-fill'
                            : 'bi:exclamation-circle'
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-2">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                            Step 2
                          </p>
                          <h4 className="text-base sm:text-lg font-semibold text-[#111827]">
                            Business Details & Documents
                          </h4>
                        </div>
                        <span
                          className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full shrink-0 self-start',
                            hasBusinessDetailsAndDocs
                              ? 'bg-[#ecfdf5] text-[#059669]'
                              : 'bg-[#fef2f2] text-[#dc2626]',
                          )}
                        >
                          {hasBusinessDetailsAndDocs ? 'Complete' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete your business information and provide proof of incorporation and
                        supporting files.
                      </p>
                      {!hasBusinessDetailsAndDocs && (
                        <Button
                          variant="secondary"
                          size="small"
                          className="rounded-full"
                          onClick={navigateToBusinessStep}
                        >
                          Complete step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Approval Message - Show when status is pending and KYC is complete */}
        {/* {isPendingAndKYCComplete && (
          <div className="bg-linear-to-br from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-md shrink-0">
                <Icon icon="bi:clock-history" className="text-3xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Text variant="h4" weight="semibold" className="text-gray-900">
                    Account Under Review
                  </Text>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                    Pending
                  </span>
                </div>
                <Text variant="p" className="text-gray-700 leading-relaxed mb-4">
                  Thank you for completing your Know Your Customer (KYC) verification. Our team at
                  Dashqard is currently reviewing your submitted information and documents. We will
                  notify you once the review process is complete and your corporate account has been
                  approved.
                </Text>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <Text variant="p" className="text-sm text-gray-600">
                    <Icon icon="bi:info-circle" className="inline mr-2 text-blue-600" />
                    <strong>What happens next?</strong> You will receive an email notification once
                    your account has been reviewed. In the meantime, you can continue to explore
                    your dashboard, though some features may be limited until approval is granted.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {isCorporateSuperAdmin && (
          <CorporateVendorAccountsCard
            vendors={myVendorAccounts}
            isLoading={isLoadingVendorAccounts}
            canCreate={canAccessRestrictedFeatures}
            accountStatus={accountStatusBanner}
            onCreateVendor={openCreateVendorAccount}
            addAccountParam={addAccountParam}
          />
        )}

        {/* Metrics Cards */}
        {!isLoading && (
          <div className="group relative bg-[#702DFF] rounded-2xl p-6 shadow-lg shadow-[#402D87]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#402D87]/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full blur-2xl" />
            {/* Decorative stars on the right */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={StarImage}
                alt=""
                className="absolute top-2 right-4 w-12 h-12 object-contain opacity-35"
              />
              <img
                src={StarImage}
                alt=""
                className="absolute top-4 right-14 w-10 h-10 object-contain opacity-30"
              />
              <img
                src={StarImage}
                alt=""
                className="absolute top-0 right-24 w-14 h-14 object-contain opacity-40"
              />
              <img
                src={StarImage}
                alt=""
                className="absolute bottom-2 right-6 w-12 h-12 object-contain opacity-32"
              />
              <img
                src={StarImage}
                alt=""
                className="absolute bottom-4 right-20 w-10 h-10 object-contain opacity-28"
              />
              <img
                src={StarImage}
                alt=""
                className="absolute top-1/2 -translate-y-1/2 right-0 w-16 h-16 object-contain opacity-25"
              />
            </div>
            <div className="relative flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl shrink-0 shadow-lg">
                <Icon icon="bi:cart-plus-fill" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold mb-1 leading-tight text-white">
                  {formatCurrency(metrics.totalPurchased)}
                </div>
                <div className="text-sm text-white/80 font-medium">Total Purchased</div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Sections */}
        <div className="grid grid-cols-1 gap-6">
          <div
            className={cn(
              'relative',
              !canAccessRestrictedFeatures && 'opacity-50 pointer-events-none',
            )}
          >
            <RecentTransactions />
            {!canAccessRestrictedFeatures && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
                <div className="text-center p-4">
                  <Icon icon="bi:lock-fill" className="text-3xl text-gray-400 mb-2 mx-auto" />
                  <Text variant="span" className="text-sm text-gray-600 block">
                    Complete onboarding and get approved to access Transactions
                  </Text>
                </div>
              </div>
            )}
          </div>
          {/* <div
            className={cn(
              'relative',
              !canAccessRestrictedFeatures && 'opacity-50 pointer-events-none',
            )}
          >
            <RecentAuditLogs />
            {!canAccessRestrictedFeatures && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
                <div className="text-center p-4">
                  <Icon icon="bi:lock-fill" className="text-3xl text-gray-400 mb-2 mx-auto" />
                  <Text variant="span" className="text-sm text-gray-600 block">
                    Complete onboarding and get approved to access Audit Logs
                  </Text>
                </div>
              </div>
            )}
          </div> */}
        </div>

        {!isOnboardingStatusLoading && !isComplete && (
          <div className="hidden lg:block fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
            <CompleteCorporateWidget />
          </div>
        )}
      </section>
      {isCorporateSuperAdmin && <CreateVendorAccount />}
    </div>
  )
}
