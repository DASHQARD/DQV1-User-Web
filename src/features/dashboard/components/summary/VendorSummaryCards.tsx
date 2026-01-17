import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import DashXIllustration from '@/assets/svgs/Dashx_bg.svg'
import DashPassIllustration from '@/assets/images/dashpass_bg.png'
import { CustomIcon, Dropdown, Text, Loader } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs/clsx'
import { ROUTES } from '@/utils/constants'
import { vendorQueries } from '@/features'
import { useAuthStore } from '@/stores'

export default function VendorSummaryCards() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userType = (user as any)?.user_type
  const isBranchManager = userType === 'branch'
  const { useGetVendorCardCountsService } = vendorQueries()
  const { data: cardCountsData, isLoading } = useGetVendorCardCountsService()

  // Extract card counts from API response
  const metrics = useMemo(() => {
    if (!cardCountsData) {
      return {
        DashX: 0,
        DashPass: 0,
      }
    }

    return {
      DashX: cardCountsData.DashX || 0,
      DashPass: cardCountsData.DashPass || 0,
    }
  }, [cardCountsData])

  const CARD_INFO = useMemo(
    () => [
      {
        id: 'dashx',
        title: 'DashX Gift Cards',
        value: metrics.DashX,
        totalGiftCards: metrics.DashX,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashXIllustration,
      },
      {
        id: 'dashpass',
        title: 'DashPass Gift Cards',
        value: metrics.DashPass,
        totalGiftCards: metrics.DashPass,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashPassIllustration,
      },
    ],
    [metrics],
  )

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
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
        <Text variant="h6" weight="normal" className="text-gray-400">
          {isBranchManager ? 'Branch Gift Cards' : 'Vendor Gift Cards'}
        </Text>

        <section className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          {CARD_INFO.map((card) => (
            <div
              id={card.title}
              key={card.id}
              className={cn(
                'flex relative rounded-xl pt-[18px] pb-6 pl-6 pr-4 border border-gray-100 items-center justify-between group bg-white w-full overflow-hidden',
              )}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 flex flex-col gap-3">
                  <section className="flex items-center gap-2 justify-between">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        card.IconBg,
                      )}
                    >
                      <Icon icon={card.IconName} className="w-5 h-5 text-white" />
                    </div>
                    <Dropdown
                      actions={[
                        {
                          label: 'View All',
                          onClickFn: () =>
                            navigate(addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)),
                        },
                      ]}
                    >
                      <button
                        type="button"
                        className="btn rounded-lg no-print"
                        aria-label="View actions"
                      >
                        <CustomIcon name="MoreVertical" width={24} height={24} />
                      </button>
                    </Dropdown>
                  </section>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Text variant="span" weight="medium" className="text-gray-800">
                        {card.title}
                      </Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-500">
                        Total {card.totalGiftCards}{' '}
                        {card.totalGiftCards === 1 ? 'Gift Card' : 'Gift Cards'}
                      </p>
                      <p className="text-gray-800 text-xs">{card.value}</p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-5 -right-5 h-[110px] w-[120px] overflow-hidden opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                  <img
                    src={card.image}
                    alt="wallet illustration"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
