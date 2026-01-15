import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import DashXIllustration from '@/assets/svgs/Dashx_bg.svg'
import DashGoIllustration from '@/assets/svgs/dashgo_bg.svg'
import DashProIllustration from '@/assets/svgs/dashpro_bg.svg'
import DashPassIllustration from '@/assets/images/dashpass_bg.png'
import { CustomIcon, Dropdown, Text, Loader } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { cn } from '@/libs/clsx'
import { MODALS, ROUTES } from '@/utils/constants'
import { useGiftCardMetrics } from '@/features/dashboard/hooks/useCards'

export default function SummaryCards() {
  const navigate = useNavigate()
  const { data: metricsResponse, isLoading } = useGiftCardMetrics()

  const modal = usePersistedModalState<{
    id: string
    name?: string
    display_name?: string
    description?: string
    savings_type_name?: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
    early_withdrawal_penalty_options?: string[] | null
    penalty_charge_type?: string | null
    penalty_fee?: string | number | null
    total_savers?: string
    total_contributed?: string
  }>({
    paramName: MODALS.SUMMARY_CARDS.ROOT,
  })

  // Get metrics data or default to 0
  const metrics = useMemo(() => {
    return (
      metricsResponse?.data || {
        DashX: 0,
        DashGo: 0,
        DashPass: 0,
        DashPro: 0,
      }
    )
  }, [metricsResponse])

  const CARD_INFO = useMemo(
    () => [
      {
        id: '1',
        title: 'DashX Gift Cards',
        value: metrics.DashX,
        totalGiftCards: metrics.DashX,
        IconName: 'hugeicons:money-bag-01',
        active: false,
        savingsType: null,
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashXIllustration,
      },
      {
        id: '2',
        title: 'DashGo Gift Cards',
        value: metrics.DashGo,
        totalGiftCards: metrics.DashGo,
        IconName: 'hugeicons:money-bag-01',
        active: false,
        savingsType: null,
        IconBg: 'bg-[#ED186A]/[60%] group-hover:bg-[#ED186A]',
        image: DashGoIllustration,
      },
      {
        id: '3',
        title: 'DashPro Gift Cards',
        value: metrics.DashPro,
        totalGiftCards: metrics.DashPro,
        IconName: 'hugeicons:money-bag-01',
        active: false,
        savingsType: null,
        IconBg: 'bg-[#FAC203]/[60%] group-hover:bg-[#FAC203]',
        image: DashProIllustration,
      },
      {
        id: '4',
        title: 'DashPass Gift Cards',
        value: metrics.DashPass,
        totalGiftCards: metrics.DashPass,
        IconName: 'hugeicons:money-bag-01',
        active: false,
        savingsType: null,
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashPassIllustration,
      },
    ],
    [metrics],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Text variant="h6" weight="normal" className="text-gray-400">
          My Gift Cards
        </Text>
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Text variant="h6" weight="normal" className="text-gray-400">
          My Gift Cards
        </Text>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARD_INFO.map((card) => (
            <div
              key={card.id}
              id={card.title}
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
                          label: 'View',
                          onClickFn: () =>
                            navigate(
                              `${ROUTES.IN_APP.DASHBOARD.GIFT_CARDS.GIFT_CARD_DETAILS}/${card.id}`,
                            ),
                        },
                        {
                          label: 'Edit',
                          onClickFn: () => {
                            if (card.savingsType) {
                              const isIndividualOrGroup =
                                card.title.toLowerCase() === 'individual savings' ||
                                card.title.toLowerCase() === 'group savings'

                              const modalType = isIndividualOrGroup
                                ? MODALS.SUMMARY_CARDS.VIEW
                                : MODALS.SUMMARY_CARDS.VIEW

                              modal.openModal(modalType, {
                                id: card.id || '',
                                name: card.title,
                              })
                            }
                          },
                        },
                        ...(card.active
                          ? [
                              {
                                label: 'Deactivate',
                                onClickFn: () => {
                                  if (card.savingsType) {
                                    modal.openModal(MODALS.SUMMARY_CARDS.VIEW, {
                                      id: card.id,
                                    })
                                  }
                                },
                              },
                            ]
                          : [
                              {
                                label: 'Activate',
                                onClickFn: () => {
                                  if (card.savingsType) {
                                    modal.openModal(MODALS.SUMMARY_CARDS.VIEW, {
                                      id: card.id,
                                    })
                                  }
                                },
                              },
                            ]),
                      ]}
                    >
                      <div
                        className="btn rounded-lg no-print cursor-pointer"
                        aria-label="View actions"
                        role="button"
                        tabIndex={0}
                      >
                        <CustomIcon name="MoreVertical" width={24} height={24} />
                      </div>
                    </Dropdown>
                  </section>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Text variant="span" weight="medium" className="text-gray-800">
                        {card.title}
                      </Text>
                      {/* <Badge variant={card.active ? 'active' : 'inactive'}>
                        {card.active ? 'Active' : 'Inactive'}
                      </Badge> */}
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
      {/* {modal.modalState === MODALS.SAVINGS.CHILDREN.DEACTIVATE && <DeactivateSavings />}
      {modal.modalState === MODALS.SAVINGS.CHILDREN.UPDATE && <UpdateAjoSavings />}
      {modal.modalState === MODALS.SAVINGS.CHILDREN.UPDATE_GROUP && <UpdateGroupSavings />}
      {modal.modalState === MODALS.SAVINGS.CHILDREN.ACTIVATE && <ActivateSavings />} */}
    </>
  )
}
