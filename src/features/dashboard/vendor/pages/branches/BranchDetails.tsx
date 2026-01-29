import React from 'react'
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom'
import { Text, Button, Dropdown, Tag, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import {
  RedemptionDetails,
  BranchDetailsModal,
  ViewExperience,
  UpdateBranchStatusModal,
  UpdateBranchManagerDetailsModal,
  DeleteBranchModal,
  BranchMetricsCards,
} from '@/features/dashboard/components'
import { CardItems } from '@/features/website/components'
import { ROUTES, MODALS } from '@/utils/constants'
import { vendorQueries } from '@/features'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { useAuthStore } from '@/stores'
import LoaderGif from '@/assets/gifs/loader.gif'
import { getStatusVariant } from '@/utils/helpers/common'
import EmptyStateImage from '@/assets/images/empty-state.png'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusCell } from '@/components'
import { useRedemptionQueries } from '@/features/dashboard/hooks'

export function BranchDetails() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const branchModal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })
  const experienceModal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  // Get user profile and vendor ID
  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetAllVendorsDetailsForVendorService } = vendorQueries()
  const { data: vendorsDetailsResponse, isLoading: isLoadingVendorsDetails } =
    useGetAllVendorsDetailsForVendorService(isCorporateSuperAdmin ? false : true)

  const { useGetBranchesByVendorIdService } = vendorQueries()
  const {
    useGetCorporateBranchByIdService,
    useGetCorporateBranchManagersService,
    useGetCorporateBranchRedemptionsService,
    useGetCorporateBranchCardsService,
    useGetCorporateBranchSummaryService,
  } = corporateQueries()
  const branchStatusModal = usePersistedModalState({
    paramName: MODALS.BRANCH.ROOT,
  })
  const branchDeleteModal = usePersistedModalState({
    paramName: MODALS.BRANCH.ROOT,
  })

  // Get vendor_id from URL params or user profile
  const vendorIdFromParams = searchParams.get('vendor_id')
  const branchIdFromParams = searchParams.get('branch_id')
  const branchIdFromPath = params.id // Branch ID from URL path
  const vendorIdFromProfile = userProfileData?.vendor_id
  const vendorId = vendorIdFromParams
    ? Number(vendorIdFromParams)
    : vendorIdFromProfile
      ? Number(vendorIdFromProfile)
      : null

  // Extract branch_id from URL path or query params first
  const branchId = React.useMemo(() => {
    // Priority: 1. Query param, 2. URL path param
    if (branchIdFromParams) return Number(branchIdFromParams)
    if (branchIdFromPath) return Number(branchIdFromPath)
    return null
  }, [branchIdFromParams, branchIdFromPath])

  // Fetch branch data - use corporate endpoint if user is corporate super admin
  const {
    data: corporateBranchData,
    isLoading: isLoadingCorporateBranch,
    isError: isErrorCorporateBranch,
  } = useGetCorporateBranchByIdService(isCorporateSuperAdmin ? branchId : null)

  useGetCorporateBranchManagersService(isCorporateSuperAdmin ? branchId : null)

  // Fetch branch redemptions - use corporate endpoint if user is corporate super admin
  const { data: corporateBranchRedemptions, isLoading: isLoadingCorporateBranchRedemptions } =
    useGetCorporateBranchRedemptionsService(isCorporateSuperAdmin ? branchId : null)

  // Fetch branch cards - use corporate endpoint if user is corporate super admin
  const { data: corporateBranchCards } = useGetCorporateBranchCardsService(
    isCorporateSuperAdmin ? branchId : null,
  )

  // Fetch branch summary - use corporate endpoint if user is corporate super admin
  const { data: corporateBranchSummary, isLoading: isLoadingCorporateBranchSummary } =
    useGetCorporateBranchSummaryService(isCorporateSuperAdmin ? branchId : null)

  // Fetch branches for the vendor (for non-corporate users)
  const {
    data: branchData,
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
  } = useGetBranchesByVendorIdService(isCorporateSuperAdmin ? null : vendorId, false)

  // Determine which data source to use
  const isLoadingBranchData = isCorporateSuperAdmin ? isLoadingCorporateBranch : isLoadingBranches
  const isErrorBranchData = isCorporateSuperAdmin ? isErrorCorporateBranch : isErrorBranches

  // Find the specific branch - use corporate branch data if corporate super admin, otherwise find from vendor branches array
  const branches = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      // For corporate super admin, use the direct branch data from corporate endpoint
      if (!corporateBranchData) return null
      // Handle both direct object and wrapped response
      return corporateBranchData?.data || corporateBranchData || null
    } else {
      // For regular vendors, find branch from the branches array
      if (!branchData || !Array.isArray(branchData)) return null
      if (!branchId) {
        // If no branchId specified, return first branch as fallback
        return branchData[0] || null
      }
      // Find branch that matches the branchId
      const foundBranch = branchData.find((branch: any) => {
        const bId = branch.id || branch.branch_id
        return String(bId) === String(branchId)
      })
      return foundBranch || branchData[0] || null
    }
  }, [isCorporateSuperAdmin, corporateBranchData, branchData, branchId])

  // Extract cards for the specific branch - use corporate endpoint if user is corporate super admin
  const experiences = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      // For corporate super admin, use the direct cards data from corporate endpoint
      if (!corporateBranchCards) return []
      // Handle both direct array and wrapped response
      const cards = Array.isArray(corporateBranchCards)
        ? corporateBranchCards
        : corporateBranchCards?.data || []

      if (!Array.isArray(cards)) return []

      // Transform cards to experiences format
      return cards.map((card: any) => ({
        id: String(card.card_id || card.id || ''),
        card_id: card.card_id || card.id,
        product: card.card_name || card.product || 'Gift Card',
        type: card.card_type || card.type || 'Gift Card',
        price: String(card.card_price || card.price || 0),
        currency: card.currency || 'GHS',
        description: card.card_description || card.description || '',
        status: card.card_status || card.status || 'active',
        expiry_date: card.expiry_date || '',
        issue_date: card.issue_date || '',
        images: card.images || [],
        terms_and_conditions: card.terms_and_conditions || [],
        vendor_name: branches?.branch_name || '',
        branch_name: branches?.branch_name || '',
        branch_location: branches?.branch_location || '',
        base_price: String(card.card_price || card.price || 0),
        markup_price: null,
        service_fee: '0',
        rating: 0,
        created_at: card.created_at || '',
        updated_at: card.updated_at || card.created_at || '',
        recipient_count: '0',
        vendor_id: branches?.vendor_id || 0,
      }))
    } else {
      // For regular vendors, extract from vendors details response
      if (!vendorsDetailsResponse || !vendorId || !branchId) return []

      // Handle both direct array response and wrapped response with data property
      const vendorsData = Array.isArray(vendorsDetailsResponse)
        ? vendorsDetailsResponse
        : (vendorsDetailsResponse as any)?.data || []

      if (!Array.isArray(vendorsData)) return []

      // Find the vendor that matches the current vendor_id
      const vendor = vendorsData.find((v: any) => {
        const vId = v.vendor_id || v.id
        return String(vId) === String(vendorId)
      })

      if (!vendor || !vendor.branches_with_cards || !Array.isArray(vendor.branches_with_cards)) {
        return []
      }

      // Find the specific branch
      const branch = vendor.branches_with_cards.find((b: any) => {
        const bId = b.branch_id || b.id
        return String(bId) === String(branchId)
      })

      if (!branch || !branch.cards || !Array.isArray(branch.cards)) {
        return []
      }

      // Transform cards to experiences format
      return branch.cards.map((card: any) => ({
        id: String(card.card_id || card.id || ''),
        card_id: card.card_id || card.id,
        product: card.card_name || card.product || 'Gift Card',
        type: card.card_type || card.type || 'Gift Card',
        price: String(card.card_price || card.price || 0),
        currency: card.currency || 'GHS',
        description: card.card_description || card.description || '',
        status: card.card_status || card.status || 'active',
        expiry_date: card.expiry_date || '',
        issue_date: card.issue_date || '',
        images: card.images || [],
        terms_and_conditions: card.terms_and_conditions || [],
        vendor_name: branch.branch_name || vendor.business_name || '',
        branch_name: branch.branch_name || '',
        branch_location: branch.branch_location || '',
        base_price: String(card.card_price || card.price || 0),
        markup_price: null,
        service_fee: '0',
        rating: 0,
        created_at: card.created_at || '',
        updated_at: card.updated_at || card.created_at || '',
        recipient_count: '0',
        vendor_id: vendor.vendor_id || vendor.id || 0,
      }))
    }
  }, [
    isCorporateSuperAdmin,
    corporateBranchCards,
    vendorsDetailsResponse,
    vendorId,
    branchId,
    branches,
  ])

  // Fetch branch redemptions - use corporate endpoint if user is corporate super admin, otherwise use vendor endpoint
  const redemptionQueries = useRedemptionQueries()
  const branchIdForApi = branches?.id || branches?.branch_id
  const branchNameForApi = branches?.branch_name

  // For corporate super admin, use corporate branch redemptions endpoint
  // For regular vendors, use vendor redemptions endpoint
  const { data: vendorRedemptionsResponse, isLoading: isLoadingVendorRedemptions } =
    redemptionQueries.useGetVendorRedemptionsListService(
      isCorporateSuperAdmin
        ? undefined
        : {
            limit: 100, // Fetch more to ensure we get all branch redemptions
            branch_id: branchIdForApi ? Number(branchIdForApi) : undefined,
            branch_name: branchNameForApi,
          },
    )

  // Determine which loading state to use
  const isLoadingRedemptions = isCorporateSuperAdmin
    ? isLoadingCorporateBranchRedemptions
    : isLoadingVendorRedemptions

  // Get all branch redemptions
  const branchRedemptions = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      // For corporate super admin, use the direct redemptions data from corporate endpoint
      if (!corporateBranchRedemptions) return []
      // Handle both direct array and wrapped response
      return Array.isArray(corporateBranchRedemptions)
        ? corporateBranchRedemptions
        : corporateBranchRedemptions?.data || []
    } else {
      // For regular vendors, filter from vendor redemptions response
      if (!vendorRedemptionsResponse?.data || !branches) return []
      const redemptions = vendorRedemptionsResponse.data || []

      // Additional client-side filtering to ensure we only show this branch's redemptions
      const branchName = branches.branch_name
      const branchLocation = branches.branch_location
      const branchId = branches.id || branches.branch_id

      return redemptions.filter((redemption: any) => {
        // Match by branch_name (most reliable)
        if (redemption.branch_name && branchName) {
          return redemption.branch_name === branchName
        }
        // Fallback: match by branch_location
        if (redemption.branch_location && branchLocation) {
          return redemption.branch_location === branchLocation
        }
        // Fallback: match by branch_id if available in redemption
        if (redemption.branch_id && branchId) {
          return String(redemption.branch_id) === String(branchId)
        }
        return false
      })
    }
  }, [isCorporateSuperAdmin, corporateBranchRedemptions, vendorRedemptionsResponse, branches])

  // Get recent redemptions (first 5) - sorted by most recent first
  const recentRedemptions = React.useMemo(() => {
    if (branchRedemptions.length === 0) return []

    // Sort by date (most recent first) and limit to 5
    return branchRedemptions
      .sort((a: any, b: any) => {
        const dateA = new Date(a.redemption_date || a.created_at || a.updated_at || 0).getTime()
        const dateB = new Date(b.redemption_date || b.created_at || b.updated_at || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [branchRedemptions])

  // Get branch summary data - use corporate branch summary if available, otherwise calculate from redemptions
  const branchSummary = React.useMemo(() => {
    if (isCorporateSuperAdmin && corporateBranchSummary) {
      // For corporate super admin, use summary data from API
      // Handle both direct object and wrapped response
      return corporateBranchSummary?.data || corporateBranchSummary || null
    } else {
      // For regular vendors, calculate from redemptions array
      const totalRedemptions = branchRedemptions.length
      const totalRedemptionAmount = branchRedemptions.reduce(
        (sum: number, r: any) => sum + Number(r.amount || 0),
        0,
      )
      const dashxCards = branchRedemptions.filter(
        (r: any) => r.card_type?.toLowerCase() === 'dashx',
      ).length
      const dashpassCards = branchRedemptions.filter(
        (r: any) => r.card_type?.toLowerCase() === 'dashpass',
      ).length

      // Get total cards from experiences
      const totalCards = experiences.length

      return {
        total_redemptions: totalRedemptions,
        total_redemption_amount: totalRedemptionAmount,
        dashx_cards: dashxCards,
        dashpass_cards: dashpassCards,
        total_cards: totalCards,
      }
    }
  }, [isCorporateSuperAdmin, corporateBranchSummary, branchRedemptions, experiences])

  // Show loading state
  if (isLoadingBranchData || (!isCorporateSuperAdmin && isLoadingVendorsDetails)) {
    return (
      <div className="flex justify-center items-center h-full">
        <img src={LoaderGif} alt="loading" className="w-10 h-10" />
      </div>
    )
  }

  // Show error state
  if (isErrorBranches || !branches) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <Icon icon="bi:exclamation-circle" className="text-4xl text-red-500" />
        <Text variant="h3" className="text-gray-700">
          {isErrorBranchData ? 'Error loading branch details' : 'Branch not found'}
        </Text>
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
        >
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
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
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
            {branches && (
              <>
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
                    {
                      label: 'Delete Branch',
                      onClickFn: () => {
                        branchDeleteModal.openModal(MODALS.BRANCH.DELETE, branches)
                      },
                    },
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
              </>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <BranchMetricsCards
          summary={branchSummary}
          isLoading={isLoadingRedemptions || isLoadingCorporateBranchSummary}
        />

        {/* Recent Redemptions */}
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

        {/* Experiences */}
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
                {experiences
                  .slice(0, 6)
                  .map(
                    (experience: {
                      id: string
                      card_id?: number
                      product: string
                      type: string
                      price: string
                      currency?: string
                      description?: string
                      status?: string
                      expiry_date?: string
                      issue_date?: string
                      images?: any[]
                      terms_and_conditions?: any[]
                      vendor_name?: string
                      branch_name?: string
                      branch_location?: string
                      base_price?: string
                      markup_price?: number | null
                      service_fee?: string
                      rating?: number
                      created_at?: string
                      updated_at?: string
                      recipient_count?: string
                      vendor_id?: number
                    }) => (
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
                    ),
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BranchDetailsModal branch={branches} />
      <RedemptionDetails />
      <ViewExperience />
      <UpdateBranchStatusModal />
      <UpdateBranchManagerDetailsModal />
      <DeleteBranchModal />
    </>
  )
}
