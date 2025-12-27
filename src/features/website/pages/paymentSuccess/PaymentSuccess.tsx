import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { useAuthStore } from '@/stores'
import { useMemo } from 'react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const trxref = searchParams.get('trxref')
  const reference = searchParams.get('reference')

  // Determine user type and appropriate dashboard routes
  const userType = (user as any)?.user_type
  const isCorporate = useMemo(() => {
    return (
      userType === 'corporate' ||
      userType === 'corporate super admin' ||
      userType === 'corporate admin'
    )
  }, [userType])

  const dashboardRoute = useMemo(() => {
    if (isCorporate) {
      return ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME
    }
    return ROUTES.IN_APP.DASHBOARD.HOME
  }, [isCorporate])

  const transactionsRoute = useMemo(() => {
    if (isCorporate) {
      return ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS
    }
    return ROUTES.IN_APP.DASHBOARD.ORDERS
  }, [isCorporate])

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Icon icon="bi:check-circle-fill" className="text-5xl text-green-600" />
          </div>
          <Text variant="h2" weight="bold" className="text-gray-900 mb-2">
            Payment Successful!
          </Text>
          <Text variant="p" className="text-gray-600 text-center">
            Your payment has been processed successfully. You will receive a confirmation email
            shortly.
          </Text>
        </div>

        {/* Payment Details */}
        {(trxref || reference) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
            <Text variant="h6" weight="semibold" className="text-gray-900 mb-4">
              Payment Details
            </Text>
            {trxref && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <Text variant="span" className="text-gray-600">
                  Transaction Reference:
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900 font-mono text-sm">
                  {trxref}
                </Text>
              </div>
            )}
            {reference && (
              <div className="flex justify-between items-center py-2">
                <Text variant="span" className="text-gray-600">
                  Reference:
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900 font-mono text-sm">
                  {reference}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(dashboardRoute)}
            className="flex items-center justify-center gap-2"
          >
            <Icon icon="bi:house-door-fill" className="text-lg" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(transactionsRoute)}
            className="flex items-center justify-center gap-2"
          >
            <Icon icon="bi:receipt" className="text-lg" />
            View {isCorporate ? 'Transactions' : 'Orders'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <Text variant="p" className="text-sm text-gray-500">
            If you have any questions or concerns, please{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              contact our support team
            </Link>
            .
          </Text>
        </div>
      </div>
    </div>
  )
}
