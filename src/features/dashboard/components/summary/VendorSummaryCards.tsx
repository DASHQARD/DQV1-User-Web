import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { Text, Loader, Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { vendorQueries } from '@/features'
import { useAuthStore } from '@/stores'
import { useUserProfile } from '@/hooks'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import { useVendorOperationalAccess } from '@/features/dashboard/hooks/useVendorOperationalAccess'
import { VENDOR_NAV_DISABLED_TOOLTIP } from '@/features/dashboard/components/sidebar/VendorSidebarNavItem'

/** Card type background colors (from brand assets: Dashx_bg, dashpro_bg, dashpass, dashgo_bg) */
const CARD_TYPE_BG: Record<string, string> = {
  dashx: '#402D87',
  dashpass: '#1e40af',
  dashpro: '#2d1a72',
  dashgo: '#ED186A',
}

export default function VendorSummaryCards() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isBranchManager = userType === 'branch'

  const { getIsNavItemDisabled } = useVendorOnboardingProgress()
  const { isOperationalAccessEnabled } = useVendorOperationalAccess()
  const isExperienceDisabled = getIsNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)

  const { useGetVendorCardCountsService } = vendorQueries()
  const { data: vendorCardCountsData, isLoading: isLoadingVendorCounts } =
    useGetVendorCardCountsService()

  const metrics = useMemo(() => {
    if (!vendorCardCountsData) {
      return { DashX: 0, DashPass: 0 }
    }
    return {
      DashX: vendorCardCountsData.DashX || 0,
      DashPass: vendorCardCountsData.DashPass || 0,
    }
  }, [vendorCardCountsData])

  const isLoading = isLoadingVendorCounts

  const CARD_INFO = useMemo(
    () => [
      {
        id: 'dashx',
        type: 'dashx',
        title: 'DashX Gift Cards',
        value: metrics.DashX,
        totalGiftCards: metrics.DashX,
      },
      {
        id: 'dashpass',
        type: 'dashpass',
        title: 'DashPass Gift Cards',
        value: metrics.DashPass,
        totalGiftCards: metrics.DashPass,
      },
    ],
    [metrics],
  )

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    const base = `${path}${separator}account=vendor`
    return vendorIdFromUrl ? `${base}&vendor_id=${vendorIdFromUrl}` : base
  }

  if (!isOperationalAccessEnabled) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Text variant="h6" weight="normal" className="text-gray-400">
          {isBranchManager ? 'Branch Gift Cards' : 'Vendor Gift Cards'}
        </Text>
        <div className="flex items-center justify-center py-8 w-full">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* <Text variant="h6" weight="normal" className="text-gray-400">
          {isBranchManager ? 'Branch Gift Cards' : 'Vendor Gift Cards'}
        </Text> */}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARD_INFO.map((card) => {
            const bgColor = CARD_TYPE_BG[card.type] ?? CARD_TYPE_BG.dashx
            return (
              <div
                id={card.title}
                key={card.id}
                className="relative flex flex-col rounded-xl p-4 w-full overflow-hidden shadow-md"
                style={{ backgroundColor: bgColor }}
              >
                <div className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10 bg-white" />
                <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full opacity-10 bg-white" />

                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-col gap-1">
                    <Text variant="span" className="text-white/90 text-xs">
                      Total {card.title}
                    </Text>
                    <p className="text-xl font-bold text-white tracking-tight">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1.5">
                    <span className="text-white/90 text-xs">View All</span>
                    {isExperienceDisabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            aria-label="View all experiences"
                            className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-500 cursor-not-allowed no-print"
                          >
                            <Icon icon="bi:arrow-right-short" className="text-base" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{VENDOR_NAV_DISABLED_TOOLTIP}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE))
                        }
                        aria-label="View all experiences"
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-white/90 transition-colors no-print"
                      >
                        <Icon icon="bi:arrow-right-short" className="text-base" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}
