import { Link } from 'react-router-dom'
import { Text, Button, Dropdown, Tag, EmptyState } from '@/components'
import { Icon, cn } from '@/libs'
import {
  RedemptionDetails,
  BranchDetailsModal,
  ViewExperience,
  UpdateBranchStatusModal,
  UpdateBranchManagerDetailsModal,
  DeleteBranchModal,
  DeleteBranchPaymentDetailsModal,
  BranchMetricsCards,
} from '@/features/dashboard/components'
import { CardItems } from '@/features/website/components'
import { ROUTES, MODALS } from '@/utils/constants'
import LoaderGif from '@/assets/gifs/loader.gif'
import { getStatusVariant } from '@/utils/helpers/common'
import EmptyStateImage from '@/assets/images/empty-state.png'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusCell } from '@/components'
import { useBranchDetails } from './useBranchDetails'

export function BranchDetails() {
  const {
    branchModal,
    experienceModal,
    branchStatusModal,
    branches,
    experiences,
    recentRedemptions,
    branchSummary,
    isLoading,
    isError,
    errorMessage,
    isLoadingRedemptions,
    isLoadingCorporateBranchSummary,
    goToBranches,
  } = useBranchDetails()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <img src={LoaderGif} alt="loading" className="w-10 h-10" />
      </div>
    )
  }

  if (isError || !branches) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Icon icon="bi:exclamation-circle" className="text-4xl text-red-500" />
        <Text variant="h3" className="text-gray-700">
          {errorMessage}
        </Text>
        <Button variant="secondary" onClick={goToBranches}>
          Back to Branches
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="md:py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="flex-1">
            <button
              onClick={goToBranches}
              className="flex items-center gap-1 text-gray-500 text-xs cursor-pointer"
            >
              <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              Back to Branches
            </button>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <h2 className="text-2xl font-semibold text-primary-900">
                {branches?.branch_name || 'Branch Details'}
              </h2>
              {branches?.status && (
                <Tag
                  value={branches.status}
                  variant={getStatusVariant(branches.status) as any}
                  className={cn(branches.status === 'pending' && 'animate-pulse')}
                />
              )}
              {branches?.status === 'pending' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Icon icon="bi:clock-history" className="text-yellow-600 text-sm" />
                  <Text variant="span" className="text-xs font-medium text-yellow-800">
                    Pending Approval
                  </Text>
                </div>
              )}
            </div>
            {branches?.branch_location && (
              <Text variant="span" className="text-sm text-gray-600 mt-1 block">
                {branches.branch_location}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              actions={[
                ...(branches?.user_id
                  ? [
                      {
                        label: 'Update Branch Manager Details',
                        onClickFn: () => {
                          branchStatusModal.openModal(
                            MODALS.BRANCH.UPDATE_MANAGER_DETAILS,
                            branches,
                          )
                        },
                      },
                    ]
                  : []),
                {
                  label: 'Update Status',
                  onClickFn: () => {
                    branchStatusModal.openModal(MODALS.BRANCH.UPDATE_STATUS, branches)
                  },
                },
                // {
                //   label: 'Delete Branch',
                //   onClickFn: () => {
                //     branchStatusModal.openModal(MODALS.BRANCH.DELETE, branches)
                //   },
                // },
              ]}
            >
              <Button variant="outline" size="medium" className="rounded-full">
                <Icon icon="hugeicons:more-vertical" className="mr-2" />
                Actions
              </Button>
            </Dropdown>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => branchModal.openModal(MODALS.BRANCH.VIEW, branches || undefined)}
              className="rounded-full"
            >
              View Branch Details
            </Button>
          </div>
        </div>

        <BranchMetricsCards
          summary={branchSummary}
          isLoading={isLoadingRedemptions || isLoadingCorporateBranchSummary}
        />

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent Redemptions
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`}
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
                    redemption.redemption_date || redemption.created_at || redemption.updated_at
                  return (
                    <div
                      key={redemption.id || redemption.redemption_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                          <Icon icon="bi:arrow-left-right" className="text-[#402D87] text-lg" />
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
                          <Text variant="span" weight="bold" className="text-gray-900 block">
                            {formatCurrency(redemption.amount || '0', redemption.currency || 'GHS')}
                          </Text>
                          {redemption.status && (
                            <StatusCell
                              getValue={() => redemption.status}
                              row={{
                                original: {
                                  id: redemption.id || redemption.redemption_id || '',
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

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> Experiences
            </h5>
            <Link
              to={`${ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE}?account=vendor`}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              View all <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            {experiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 min-h-[300px]">
                <Icon icon="bi:briefcase" className="text-6xl text-gray-300 opacity-40 mb-4" />
                <Text variant="p" className="text-sm text-gray-400 font-normal">
                  No experiences created yet
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-4">
                {experiences.slice(0, 6).map((experience: any) => (
                  <div
                    key={experience.id}
                    onClick={() => {
                      experienceModal.openModal(MODALS.EXPERIENCE.VIEW, experience)
                    }}
                    className="cursor-pointer"
                  >
                    <CardItems
                      card_id={experience.card_id || Number(experience.id)}
                      product={experience.product}
                      vendor_name={experience.vendor_name || ''}
                      branch_name={experience.branch_name || ''}
                      branch_location={experience.branch_location || ''}
                      description={experience.description || ''}
                      price={experience.price}
                      base_price={experience.base_price || experience.price}
                      markup_price={experience.markup_price ?? null}
                      service_fee={experience.service_fee || '0'}
                      currency={experience.currency || 'GHS'}
                      expiry_date={experience.expiry_date || ''}
                      status={experience.status || 'active'}
                      rating={experience.rating || 0}
                      created_at={experience.created_at || ''}
                      recipient_count={experience.recipient_count || '0'}
                      images={(experience.images || []) as []}
                      terms_and_conditions={(experience.terms_and_conditions || []) as []}
                      type={experience.type}
                      updated_at={experience.updated_at || experience.created_at || ''}
                      vendor_id={experience.vendor_id || 0}
                      buttonText="View Details"
                      onGetQard={() => {
                        experienceModal.openModal(MODALS.EXPERIENCE.VIEW, experience)
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BranchDetailsModal />
      <DeleteBranchPaymentDetailsModal />
      <RedemptionDetails />
      <ViewExperience />
      <UpdateBranchStatusModal />
      <UpdateBranchManagerDetailsModal />
      <DeleteBranchModal />
    </>
  )
}
