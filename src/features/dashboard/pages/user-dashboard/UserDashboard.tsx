import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Loader } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { useGiftCardMetrics } from '@/features/dashboard/hooks/useCards'
import { usePaymentInfoService } from '@/features/dashboard/hooks'
import { userProfile } from '@/hooks'
import { formatCurrency, formatDate } from '@/utils/format'
import { BackgroundCardImage } from '@/assets/images'
import type { PaymentInfoData } from '@/types/user'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { data: metricsResponse, isLoading } = useGiftCardMetrics()
  const { useGetUserProfileService } = userProfile()
  const { data: user } = useGetUserProfileService()

  // Fetch payments/transactions using the same endpoint as Orders page
  const { useGetPaymentByIdService } = usePaymentInfoService()
  const { data: paymentResponse, isLoading: isLoadingPayments } = useGetPaymentByIdService()

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

  // Extract and transform recent transactions from payments
  const recentTransactions = useMemo(() => {
    if (!paymentResponse) return []

    // Handle both direct array and object with data property
    // getPaymentById can return either a single object or an array
    const response = paymentResponse as any
    const paymentsArray = Array.isArray(response)
      ? response
      : response?.data || (response ? [response] : [])

    if (!Array.isArray(paymentsArray) || paymentsArray.length === 0) {
      return []
    }

    // Transform payments to transaction format
    return paymentsArray
      .map((payment: PaymentInfoData | any) => {
        // Determine transaction type and description
        const paymentType = payment.type?.toLowerCase() || 'purchase'
        let description = 'Gift Card Purchase'

        // Get card type from cart_details if available
        const cartItems = payment.cart_details?.items || []
        if (cartItems.length > 0) {
          const cardTypes = cartItems.map((item: any) => {
            const type = item.type?.toLowerCase() || ''
            switch (type) {
              case 'dashx':
                return 'DashX'
              case 'dashpro':
                return 'DashPro'
              case 'dashpass':
                return 'DashPass'
              case 'dashgo':
                return 'DashGo'
              default:
                return type
            }
          })
          const uniqueTypes = [...new Set(cardTypes)]
          description = `${uniqueTypes.join(', ')} Gift Card${uniqueTypes.length > 1 ? 's' : ''} Purchase`
        }

        return {
          id: payment.id,
          type:
            paymentType === 'checkout' || paymentType === 'purchase' ? 'purchase' : 'redemption',
          description,
          amount: parseFloat(payment.amount || '0'),
          date: payment.created_at ? formatDate(payment.created_at) : 'N/A',
          status: payment.status || 'unknown',
          receipt_number: payment.receipt_number,
          created_at: payment.created_at, // Keep for sorting
          paymentData: payment, // Keep full payment data for potential future use
        }
      })
      .sort((a: any, b: any) => {
        // Sort by date (most recent first)
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 5) // Get only the 5 most recent after sorting
  }, [paymentResponse])

  if (isLoading || isLoadingPayments) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h2" weight="bold" className="text-gray-900">
            Dashboard
          </Text>
          <Text variant="p" className="text-gray-600 mt-1">
            Welcome back, {user?.fullname || 'User'}! Here's your overview.
          </Text>
        </div>
      </div>

      <div className="relative rounded-xl shadow-lg p-6 text-white overflow-hidden bg-gradient-to-br from-[#402D87] to-[#5B47D4]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{
            backgroundImage: `url(${BackgroundCardImage})`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <Text variant="h6" weight="semibold" className="text-white/90 mb-4">
            Total Cards
          </Text>
          <Text variant="h1" weight="bold" className="text-white text-4xl mb-2">
            {metrics.DashX + metrics.DashGo + metrics.DashPro + metrics.DashPass}
          </Text>
          <Text variant="span" className="text-white/70 text-sm">
            Active gift cards
          </Text>
        </div>
      </div>

      {/* Card Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cards Summary */}

        {/* DashX Card */}
        <section
          className="bg-[#F5F3FF] rounded-xl shadow-sm border border-[#E9E5FF] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
          onClick={() => navigate(`${ROUTES.IN_APP.DASHBOARD.MY_CARDS}/dashx`)}
        >
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-[#402D87] bg-opacity-20 flex items-center justify-center">
                <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
              </div>
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

        {/* DashGo Card */}
        <section
          className="bg-[#FFF5F6] rounded-xl shadow-sm border border-[#FDCED1] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
          onClick={() => navigate(`${ROUTES.IN_APP.DASHBOARD.MY_CARDS}/dashgo`)}
        >
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon icon="bi:credit-card-2-front" className="text-red-600 text-xl" />
              </div>
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

          <div className="bg-white py-1 px-2 rounded-md w-fit border border-[#BB0613]">
            <p className="text-[#BB0613] text-xs font-semibold">
              {metrics.DashGo} {metrics.DashGo === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </section>

        {/* DashPro Card */}
        <section
          className="bg-[#FFFBF0] rounded-xl shadow-sm border border-[#F3CE04] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
          onClick={() => navigate(`${ROUTES.IN_APP.DASHBOARD.MY_CARDS}/dashpro`)}
        >
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-[#F3CE04] bg-opacity-20 flex items-center justify-center">
                <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
              </div>
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
              {metrics.DashPro} {metrics.DashPro === 1 ? 'card' : 'cards'}
            </p>
          </div>
        </section>

        {/* DashPass Card */}
        <section
          className="bg-[#F5F3FF] rounded-xl shadow-sm border border-[#E9E5FF] cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-4 p-4"
          onClick={() => navigate(`${ROUTES.IN_APP.DASHBOARD.MY_CARDS}/dashpass`)}
        >
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-[#402D87] bg-opacity-20 flex items-center justify-center">
                <Icon icon="bi:credit-card-2-front" className="text-white text-xl" />
              </div>
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Recent Transactions
            </Text>
            <button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.ORDERS)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View all <Icon icon="bi:arrow-right" className="text-xs" />
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Icon icon="bi:receipt" className="text-4xl text-gray-300 mx-auto mb-2" />
                <Text variant="p" className="text-gray-500 text-sm">
                  No recent transactions
                </Text>
                <Text variant="span" className="text-gray-400 text-xs">
                  Your transaction history will appear here
                </Text>
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const statusNormalized = transaction.status?.toLowerCase() || ''
                const isSuccessful =
                  statusNormalized === 'paid' ||
                  statusNormalized === 'successful' ||
                  statusNormalized === 'completed'

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      // Could navigate to order details or open payment details modal
                      navigate(ROUTES.IN_APP.DASHBOARD.ORDERS)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'purchase'
                            ? 'bg-green-100'
                            : transaction.type === 'redemption'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          icon={
                            transaction.type === 'purchase'
                              ? 'bi:arrow-down-circle-fill'
                              : 'bi:arrow-up-circle-fill'
                          }
                          className={`text-lg ${
                            transaction.type === 'purchase' ? 'text-green-600' : 'text-blue-600'
                          }`}
                        />
                      </div>
                      <div>
                        <Text variant="span" weight="medium" className="text-gray-900 block">
                          {transaction.description}
                        </Text>
                        <Text variant="span" className="text-gray-500 text-xs">
                          {transaction.date}
                        </Text>
                        {transaction.receipt_number && (
                          <Text variant="span" className="text-gray-400 text-xs block mt-0.5">
                            {transaction.receipt_number}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Text
                        variant="span"
                        weight="semibold"
                        className={`block ${
                          transaction.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'purchase' ? '+' : '-'}{' '}
                        {formatCurrency(transaction.amount, 'GHS')}
                      </Text>
                      <Text
                        variant="span"
                        className={`text-xs ${isSuccessful ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {transaction.status}
                      </Text>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Text variant="h6" weight="semibold" className="text-gray-900 mb-6">
            Quick Actions
          </Text>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashqards')}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <Icon icon="bi:gift-fill" className="text-primary-600 text-2xl mb-2" />
              <Text variant="span" weight="medium" className="text-gray-900 text-sm">
                Buy Cards
              </Text>
            </button>
            <button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.MY_CARDS)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <Icon icon="bi:credit-card-2-front" className="text-blue-600 text-2xl mb-2" />
              <Text variant="span" weight="medium" className="text-gray-900 text-sm">
                My Cards
              </Text>
            </button>
            <button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.REDEEM)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <Icon icon="bi:arrow-repeat" className="text-green-600 text-2xl mb-2" />
              <Text variant="span" weight="medium" className="text-gray-900 text-sm">
                Redeem
              </Text>
            </button>
            <button
              onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.ORDERS)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <Icon icon="bi:receipt" className="text-purple-600 text-2xl mb-2" />
              <Text variant="span" weight="medium" className="text-gray-900 text-sm">
                Orders
              </Text>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
