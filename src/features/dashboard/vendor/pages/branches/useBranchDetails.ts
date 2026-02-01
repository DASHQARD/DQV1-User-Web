import React from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS, ROUTES } from '@/utils/constants'
import { vendorQueries } from '@/features'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { useAuthStore } from '@/stores'
import { useRedemptionQueries } from '@/features/dashboard/hooks'

export function useBranchDetails() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const branchModal = usePersistedModalState({ paramName: MODALS.BRANCH.VIEW })
  const experienceModal = usePersistedModalState({ paramName: MODALS.EXPERIENCE.ROOT })
  const branchStatusModal = usePersistedModalState({ paramName: MODALS.BRANCH.ROOT })

  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const vendorIdFromParams = searchParams.get('vendor_id')
  const branchIdFromParams = searchParams.get('branch_id')
  const branchIdFromPath = params.id
  const vendorIdFromProfile = userProfileData?.vendor_id
  const vendorId = vendorIdFromParams
    ? Number(vendorIdFromParams)
    : vendorIdFromProfile
      ? Number(vendorIdFromProfile)
      : null

  const branchId = React.useMemo(() => {
    if (branchIdFromParams) return Number(branchIdFromParams)
    if (branchIdFromPath) return Number(branchIdFromPath)
    return null
  }, [branchIdFromParams, branchIdFromPath])

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

  const {
    data: corporateBranchData,
    isLoading: isLoadingCorporateBranch,
    isError: isErrorCorporateBranch,
  } = useGetCorporateBranchByIdService(isCorporateSuperAdmin ? branchId : null)

  useGetCorporateBranchManagersService(isCorporateSuperAdmin ? branchId : null)

  const { data: corporateBranchRedemptions, isLoading: isLoadingCorporateBranchRedemptions } =
    useGetCorporateBranchRedemptionsService(isCorporateSuperAdmin ? branchId : null)

  const { data: corporateBranchCards } = useGetCorporateBranchCardsService(
    isCorporateSuperAdmin ? branchId : null,
  )

  const { data: corporateBranchSummary, isLoading: isLoadingCorporateBranchSummary } =
    useGetCorporateBranchSummaryService(isCorporateSuperAdmin ? branchId : null)

  const {
    data: branchData,
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
  } = useGetBranchesByVendorIdService(isCorporateSuperAdmin ? null : vendorId, false)

  const isLoadingBranchData = isCorporateSuperAdmin ? isLoadingCorporateBranch : isLoadingBranches
  const isErrorBranchData = isCorporateSuperAdmin ? isErrorCorporateBranch : isErrorBranches

  const branches = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      if (!corporateBranchData) return null
      return corporateBranchData?.data || corporateBranchData || null
    }
    if (!branchData || !Array.isArray(branchData)) return null
    if (!branchId) return branchData[0] || null
    const foundBranch = branchData.find((branch: any) => {
      const bId = branch.id || branch.branch_id
      return String(bId) === String(branchId)
    })
    return foundBranch || branchData[0] || null
  }, [isCorporateSuperAdmin, corporateBranchData, branchData, branchId])

  const experiences = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      if (!corporateBranchCards) return []
      const cards = Array.isArray(corporateBranchCards)
        ? corporateBranchCards
        : corporateBranchCards?.data || []
      if (!Array.isArray(cards)) return []
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
    }
    if (!vendorsDetailsResponse || !vendorId || !branchId) return []
    const vendorsData = Array.isArray(vendorsDetailsResponse)
      ? vendorsDetailsResponse
      : (vendorsDetailsResponse as any)?.data || []
    if (!Array.isArray(vendorsData)) return []
    const vendor = vendorsData.find((v: any) => {
      const vId = v.vendor_id || v.id
      return String(vId) === String(vendorId)
    })
    if (!vendor || !vendor.branches_with_cards || !Array.isArray(vendor.branches_with_cards)) {
      return []
    }
    const branch = vendor.branches_with_cards.find((b: any) => {
      const bId = b.branch_id || b.id
      return String(bId) === String(branchId)
    })
    if (!branch || !branch.cards || !Array.isArray(branch.cards)) return []
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
  }, [
    isCorporateSuperAdmin,
    corporateBranchCards,
    vendorsDetailsResponse,
    vendorId,
    branchId,
    branches,
  ])

  const redemptionQueries = useRedemptionQueries()
  const branchIdForApi = branches?.id || branches?.branch_id
  const branchNameForApi = branches?.branch_name

  const { data: vendorRedemptionsResponse, isLoading: isLoadingVendorRedemptions } =
    redemptionQueries.useGetVendorRedemptionsListService(
      isCorporateSuperAdmin
        ? undefined
        : {
            limit: 100,
            branch_id: branchIdForApi ? Number(branchIdForApi) : undefined,
            branch_name: branchNameForApi,
          },
    )

  const isLoadingRedemptions = isCorporateSuperAdmin
    ? isLoadingCorporateBranchRedemptions
    : isLoadingVendorRedemptions

  const branchRedemptions = React.useMemo(() => {
    if (isCorporateSuperAdmin) {
      if (!corporateBranchRedemptions) return []
      return Array.isArray(corporateBranchRedemptions)
        ? corporateBranchRedemptions
        : corporateBranchRedemptions?.data || []
    }
    if (!vendorRedemptionsResponse?.data || !branches) return []
    const redemptions = vendorRedemptionsResponse.data || []
    const branchName = branches.branch_name
    const branchLocation = branches.branch_location
    const bid = branches.id || branches.branch_id
    return redemptions.filter((redemption: any) => {
      if (redemption.branch_name && branchName) return redemption.branch_name === branchName
      if (redemption.branch_location && branchLocation) {
        return redemption.branch_location === branchLocation
      }
      if (redemption.branch_id && bid) return String(redemption.branch_id) === String(bid)
      return false
    })
  }, [isCorporateSuperAdmin, corporateBranchRedemptions, vendorRedemptionsResponse, branches])

  const recentRedemptions = React.useMemo(() => {
    if (branchRedemptions.length === 0) return []
    return branchRedemptions
      .sort((a: any, b: any) => {
        const dateA = new Date(a.redemption_date || a.created_at || a.updated_at || 0).getTime()
        const dateB = new Date(b.redemption_date || b.created_at || b.updated_at || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [branchRedemptions])

  const branchSummary = React.useMemo(() => {
    if (isCorporateSuperAdmin && corporateBranchSummary) {
      return corporateBranchSummary?.data || corporateBranchSummary || null
    }
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
    const totalCards = experiences.length
    return {
      total_redemptions: totalRedemptions,
      total_redemption_amount: totalRedemptionAmount,
      dashx_cards: dashxCards,
      dashpass_cards: dashpassCards,
      total_cards: totalCards,
    }
  }, [isCorporateSuperAdmin, corporateBranchSummary, branchRedemptions, experiences])

  const isLoading = isLoadingBranchData || (!isCorporateSuperAdmin && isLoadingVendorsDetails)
  const isError = isErrorBranches || !branches
  const errorMessage = isErrorBranchData ? 'Error loading branch details' : 'Branch not found'

  const goToBranches = React.useCallback(() => {
    navigate(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)
  }, [navigate])

  return {
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
  }
}
