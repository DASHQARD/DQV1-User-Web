import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import DashXIllustration from '@/assets/svgs/Dashx_bg.svg'
import DashGoIllustration from '@/assets/svgs/dashgo_bg.svg'
import DashProIllustration from '@/assets/svgs/dashpro_bg.svg'
import DashPassIllustration from '@/assets/svgs/dashpass_bg.svg'
import { Text, Loader } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs/clsx'
import { useGiftCardMetrics } from '@/features/dashboard/hooks/useCards'

export default function MyCards() {
  const navigate = useNavigate()
  const { data: metricsResponse, isLoading } = useGiftCardMetrics()
  console.log('metricsResponse', metricsResponse)

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
        cardType: 'dashx',
        title: 'DashX Gift Cards',
        value: metrics.DashX,
        totalGiftCards: metrics.DashX,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashXIllustration,
        description: 'Vendor-created gift cards',
      },
      {
        id: '2',
        cardType: 'dashgo',
        title: 'DashGo Gift Cards',
        value: metrics.DashGo,
        totalGiftCards: metrics.DashGo,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#ED186A]/[60%] group-hover:bg-[#ED186A]',
        image: DashGoIllustration,
        description: 'Flexible gift cards',
      },
      {
        id: '3',
        cardType: 'dashpro',
        title: 'DashPro Gift Cards',
        value: metrics.DashPro,
        totalGiftCards: metrics.DashPro,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#FAC203]/[60%] group-hover:bg-[#FAC203]',
        image: DashProIllustration,
        description: 'Prepaid gift cards',
      },
      {
        id: '4',
        cardType: 'dashpass',
        title: 'DashPass Gift Cards',
        value: metrics.DashPass,
        totalGiftCards: metrics.DashPass,
        IconName: 'hugeicons:money-bag-01',
        IconBg: 'bg-[#402D87]/[60%] group-hover:bg-[#402D87]',
        image: DashPassIllustration,
        description: 'Vendor-created gift cards',
      },
    ],
    [metrics],
  )

  const totalCards = useMemo(() => {
    return metrics.DashX + metrics.DashGo + metrics.DashPass + metrics.DashPro
  }, [metrics])

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-2">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            My Cards
          </Text>
          <Text variant="p" className="text-gray-600 mt-2">
            View your purchased gift cards
          </Text>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Text variant="h2" weight="semibold" className="text-primary-900">
          My Cards
        </Text>
        <Text variant="p" className="text-gray-600 mt-2">
          View your purchased gift cards
        </Text>
      </div>

      {totalCards === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon icon="bi:credit-card-2-front" className="text-6xl text-gray-300 mb-4 mx-auto" />
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            No cards purchased yet
          </Text>
          <Text variant="p" className="text-gray-600">
            You haven't purchased any gift cards yet. Browse our marketplace to get started.
          </Text>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARD_INFO.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(`/dashboard/my-cards/${card.cardType}`)}
              className={cn(
                'flex relative rounded-xl pt-[18px] pb-6 pl-6 pr-4 border border-gray-100 items-center justify-between group bg-white w-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
              )}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 flex flex-col gap-3">
                  <section className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        card.IconBg,
                      )}
                    >
                      <Icon icon={card.IconName} className="w-5 h-5 text-white" />
                    </div>
                  </section>

                  <div className="flex flex-col gap-1">
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      {card.title}
                    </Text>
                    <Text variant="span" className="text-gray-500 text-xs">
                      {card.description}
                    </Text>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-xs text-gray-500">
                        Total {card.totalGiftCards}{' '}
                        {card.totalGiftCards === 1 ? 'Gift Card' : 'Gift Cards'}
                      </p>
                      <p className="text-gray-900 text-lg font-semibold">{card.value}</p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-5 -right-5 h-[110px] w-[120px] overflow-hidden opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                  <img
                    src={card.image}
                    alt="card illustration"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
