import { Text } from '@/components'
import { Icon } from '@/libs'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import {
  SummaryCards,
  QardsPerformance,
  CompleteVendorWidget,
} from '@/features/dashboard/components'

export default function VendorHome() {
  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-8">
        <div className="pb-6 border-b border-[#e9ecef]">
          <div className="flex flex-col gap-2">
            <Text variant="span" weight="semibold" className="text-[#95aac9]">
              Dashboard
            </Text>
            <Text variant="h2" weight="semibold">
              Vendor Dashboard
            </Text>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Redemptions */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:credit-card-2-front" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">0</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redemptions</div>
            </div>
          </div>

          {/* Total DashX Redeemed */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:wallet2" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total DashX Redeemed</div>
            </div>
          </div>

          {/* Total DashPass Redeemed */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:ticket-perforated" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total DashPass Redeemed</div>
            </div>
          </div>

          {/* Pending Payout */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:currency-exchange" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">GHS 0.00</div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Pending Payout</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Redemptions */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:arrow-left-right" className="text-[#402D87] mr-2" /> Recent
                Redemptions
              </h5>
              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS)}
                className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
              >
                View all <Icon icon="bi:arrow-right" className="ml-1" />
              </Link>
            </div>
            <div className="px-6 pb-6">
              <div className="text-center py-8 text-gray-500">
                <Icon icon="bi:inbox" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm m-0">No redemptions to display</p>
              </div>
            </div>
          </div>

          {/* Recent Experiences */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" /> My Experiences
              </h5>
              <Link
                to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
                className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
              >
                View all <Icon icon="bi:arrow-right" className="ml-1" />
              </Link>
            </div>
            <div className="px-6 pb-6">
              <div className="text-center py-8 text-gray-500">
                <Icon icon="bi:briefcase" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm m-0">No experiences created yet</p>
              </div>
            </div>
          </div>
        </section>

        {/* Branches Overview */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6 pb-0 flex justify-between items-center mb-5">
            <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
              <Icon icon="bi:building" className="text-[#402D87] mr-2" /> Branches
            </h5>
            <Link
              to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES)}
              className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
            >
              Manage branches <Icon icon="bi:arrow-right" className="ml-1" />
            </Link>
          </div>
          <div className="px-6 pb-6">
            <div className="text-center py-8 text-gray-500">
              <Icon icon="bi:building" className="text-4xl mb-2 opacity-50" />
              <p className="text-sm m-0">No branches added yet</p>
            </div>
          </div>
        </div>

        {/* Vendor Widgets */}
        <SummaryCards />
        <QardsPerformance />

        {/* Complete Vendor Onboarding Widget */}
        <div className="fixed bottom-6 right-6 z-50 w-[598px] max-w-[calc(100vw-3rem)]">
          <CompleteVendorWidget />
        </div>
      </section>
    </div>
  )
}
