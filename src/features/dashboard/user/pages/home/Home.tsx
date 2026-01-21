import { Link } from 'react-router-dom'
import { Icon } from '@/libs'

import { useAuthStore } from '@/stores'

import { ROUTES } from '@/utils/constants'
import { Text } from '@/components'
import { AuditLogs, SummaryCards } from '../../../components'

export default function Home() {
  const { user } = useAuthStore()

  const userType = (user as any)?.user_type

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

        {/* Continue Your Onboarding - Only for Corporate Users */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
                Recent Activity
              </h5>
              <div>
                <Link
                  to={ROUTES.IN_APP.DASHBOARD.TRANSACTIONS}
                  className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                >
                  View All <Icon icon="bi:arrow-right" className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Show SummaryCards only if corporate has vendor account or user is vendor */}
        {(userType === 'corporate_vendor' || userType === 'vendor') && (
          <>
            <SummaryCards />
          </>
        )}
        <AuditLogs />
      </section>
    </div>
  )
}
