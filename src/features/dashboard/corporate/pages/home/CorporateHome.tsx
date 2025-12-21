import { Text } from '@/components'
import { Icon } from '@/libs'
import {
  RecentAuditLogs,
  RecentRequests,
  RecentTransactions,
  CompleteCorporateWidget,
  SummaryCards,
} from '@/features/dashboard/components'
import { useDashboardMetrics } from '../../../hooks/useDashboardMetrics'

export default function CorporateHome() {
  const { metrics, formatCurrency, isLoading } = useDashboardMetrics()

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

        {/* Metrics Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Purchased */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:cart-plus-fill" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatCurrency(metrics.totalPurchased)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Purchased</div>
              </div>
            </div>

            {/* Total Redeemed */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:credit-card-2-front" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatCurrency(metrics.totalRedeemed)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redeemed</div>
              </div>
            </div>

            {/* Redemption Balance */}
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
                <Icon icon="bi:wallet2" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                  {formatCurrency(metrics.redemptionBalance)}
                </div>
                <div className="text-sm text-[#6c757d] mb-2 font-medium">Redemption Balance</div>
              </div>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentRequests />
          <RecentAuditLogs />
        </section>

        <RecentTransactions />

        {/* Summary Cards */}
        <SummaryCards />

        <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
          <CompleteCorporateWidget />
        </div>
      </section>
    </div>
  )
}
