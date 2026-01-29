import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'

type BranchSummary = {
  branch_id?: string | number
  branch_name?: string
  branch_location?: string
  status?: string
  total_cards?: number
  total_redemptions?: number
  total_redemption_amount?: number
  dashx_cards?: number
  dashpass_cards?: number
}

type Props = {
  summary: BranchSummary | null
  isLoading: boolean
}

export function BranchMetricsCards({ summary, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Redemptions */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
          <Icon icon="bi:credit-card-2-front" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="text-sm text-[#6c757d] mb-2 font-medium">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {summary?.total_redemptions ?? 0}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemptions</div>
            </>
          )}
        </div>
      </div>

      {/* Total Cards */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
          <Icon icon="bi:briefcase-fill" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="text-sm text-[#6c757d] mb-2 font-medium">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {summary?.total_cards ?? 0}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Cards</div>
            </>
          )}
        </div>
      </div>

      {/* Total Redemption Amount */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
          <Icon icon="bi:currency-exchange" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="text-sm text-[#6c757d] mb-2 font-medium">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(summary?.total_redemption_amount ?? 0, 'GHS')}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemption Amount</div>
            </>
          )}
        </div>
      </div>

      {/* DashX Cards */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
          <Icon icon="bi:wallet2" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="text-sm text-[#6c757d] mb-2 font-medium">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {summary?.dashx_cards ?? 0}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">DashX Cards</div>
            </>
          )}
        </div>
      </div>

      {/* DashPass Cards */}
      <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
          <Icon icon="bi:wallet2" />
        </div>
        <div className="flex-1">
          {isLoading ? (
            <div className="text-sm text-[#6c757d] mb-2 font-medium">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {summary?.dashpass_cards ?? 0}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">DashPass Cards</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
