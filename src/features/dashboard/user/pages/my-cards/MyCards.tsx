import { useMemo } from 'react'

import { Text, Loader } from '@/components'
import { useGiftCardMetrics } from '@/features/dashboard/hooks/useCards'
import { UserGiftCardMetricsGrid } from '@/features/dashboard/user/components/UserGiftCardMetricsGrid'

export default function MyCards() {
  const { data: metricsResponse, isLoading } = useGiftCardMetrics()

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

      <UserGiftCardMetricsGrid metrics={metrics} />
    </div>
  )
}
