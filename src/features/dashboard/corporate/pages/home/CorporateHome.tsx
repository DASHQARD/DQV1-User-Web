import { Text } from '@/components'
import {
  RecentAuditLogs,
  RecentRequests,
  RecentTransactions,
  CompleteCorporateWidget,
} from '@/features/dashboard/components'
import { useCorporate } from '../../hooks'

export default function CorporateHome() {
  const { data: corporate } = useCorporate()
  console.log('corporate', corporate)
  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-8">
        <div className="pb-6 border-b border-[#e9ecef]">
          <div className="flex flex-col gap-2">
            <Text variant="span" weight="semibold" className="text-[#95aac9]">
              Dashboard
            </Text>
            <Text variant="h2" weight="semibold">
              Dashboard Overview
            </Text>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentRequests />
          <RecentAuditLogs />
        </section>

        <RecentTransactions />

        <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
          <CompleteCorporateWidget />
        </div>
      </section>
    </div>
  )
}
