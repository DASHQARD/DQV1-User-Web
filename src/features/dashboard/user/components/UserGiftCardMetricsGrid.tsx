import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Text } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'

export type UserGiftCardMetrics = {
  DashX: number
  DashGo: number
  DashPass: number
  DashPro: number
  DashGo_balance?: number
  DashPro_balance?: number
}

type UserGiftCardMetricsGridProps = {
  metrics: UserGiftCardMetrics
}

export function UserGiftCardMetricsGrid({ metrics }: UserGiftCardMetricsGridProps) {
  const navigate = useNavigate()

  const dashProBalance = useMemo(
    () => Number(metrics.DashPro_balance ?? metrics.DashPro ?? 0),
    [metrics],
  )

  const dashGoBalance = useMemo(
    () => Number(metrics.DashGo_balance ?? 0),
    [metrics],
  )

  const myCardsBase = ROUTES.IN_APP.DASHBOARD.MY_CARDS

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* DashX */}
      <section
        className="bg-[#F5F3FF] rounded-xl shadow-sm border border-[#E9E5FF] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
        onClick={() => navigate(`${myCardsBase}/dashx`)}
      >
        <section className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-full bg-[#402D87] bg-opacity-20 flex items-center justify-center">
            <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="h6" weight="semibold" className="text-[#212027]">
              DashX
            </Text>
            <p className="text-[#67667A] text-xs">
              Vendor-created gift card for specific experiences
            </p>
          </div>
        </section>
        <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#402D87]">
          <p className="text-[#402D87] text-xs font-semibold">
            {metrics.DashX} {metrics.DashX === 1 ? 'card' : 'cards'}
          </p>
        </div>
      </section>

      {/* DashGo */}
      <section
        className="bg-[#FFF5F6] rounded-xl shadow-sm border border-[#FDCED1] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
        onClick={() => navigate(`${myCardsBase}/dashgo`)}
      >
        <section className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="bi:credit-card-2-front" className="text-red-600 text-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="h6" weight="semibold" className="text-[#212027]">
              DashGo
            </Text>
            <p className="text-[#67667A] text-xs">
              Monetary gift card redeemable at a specific vendor
            </p>
          </div>
        </section>
        <div className="flex flex-col gap-2">
          <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#BB0613]">
            <p className="text-[#BB0613] text-xs font-semibold">
              {metrics.DashGo} {metrics.DashGo === 1 ? 'card' : 'cards'}
            </p>
          </div>
          <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#BB0613]">
            <p className="text-[#BB0613] text-xs font-semibold">
              Balance: {formatCurrency(dashGoBalance, 'GHS')}
            </p>
          </div>
        </div>
      </section>

      {/* DashPro — prepaid balance, not card count */}
      <section
        className="bg-[#FFFBF0] rounded-xl shadow-sm border border-[#F3CE04] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
        onClick={() => navigate(`${myCardsBase}/dashpro`)}
      >
        <section className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-full bg-[#F3CE04] bg-opacity-20 flex items-center justify-center">
            <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="h6" weight="semibold" className="text-[#212027]">
              DashPro
            </Text>
            <p className="text-[#67667A] text-xs">
              Multi-vendor gift card redeemable across multiple merchants
            </p>
          </div>
        </section>
        <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#F3CE04]">
          <p className="text-[#F3CE04] text-xs font-semibold">
            {formatCurrency(dashProBalance, 'GHS')}
          </p>
        </div>
      </section>

      {/* DashPass */}
      <section
        className="bg-[#F5F3FF] rounded-xl shadow-sm border border-[#E9E5FF] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
        onClick={() => navigate(`${myCardsBase}/dashpass`)}
      >
        <section className="flex flex-col gap-2">
          <div className="w-12 h-12 rounded-full bg-[#402D87] bg-opacity-20 flex items-center justify-center">
            <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="h6" weight="semibold" className="text-[#212027]">
              DashPass
            </Text>
            <p className="text-[#67667A] text-xs">Subscription-based pass for recurring access</p>
          </div>
        </section>
        <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#402D87]">
          <p className="text-[#402D87] text-xs font-semibold">
            {metrics.DashPass} {metrics.DashPass === 1 ? 'card' : 'cards'}
          </p>
        </div>
      </section>
    </div>
  )
}
