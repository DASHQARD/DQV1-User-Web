import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Loader, Text, Button, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants/shared'
import { formatCurrency, formatDate } from '@/utils/format'
import { getPaymentInfo } from '@/services'
import { useQuery } from '@tanstack/react-query'
import { EmptyStateImage } from '@/assets/images'
import type { PaymentInfoData } from '@/types'

export default function OrdersPage() {
  const { data: paymentResponse, isLoading } = useQuery({
    queryKey: ['user-payments'],
    queryFn: getPaymentInfo,
  })

  // Extract payments from response
  const payments = useMemo(() => {
    if (!paymentResponse) return []
    const response = paymentResponse as any
    // Handle both direct array and object with data property
    if (Array.isArray(response)) {
      return response
    }
    return response?.data || []
  }, [paymentResponse])

  // Sort payments by date (most recent first)
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a: PaymentInfoData, b: PaymentInfoData) => {
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime()
      const dateB = new Date(b.created_at || b.updated_at || 0).getTime()
      return dateB - dateA
    })
  }, [payments])

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
      case 'paid':
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    const normalizedType = type?.toLowerCase()
    switch (normalizedType) {
      case 'checkout':
        return 'Purchase'
      case 'purchase':
        return 'Purchase'
      case 'bulk_purchase':
        return 'Bulk Purchase'
      case 'redemption':
        return 'Redemption'
      default:
        return type || 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-linear-to-br from-primary-500 to-primary-700 text-white py-12">
        <div className="wrapper">
          <div className="text-center">
            <h1 className="text-[clamp(32px,5vw,48px)] font-bold mb-2">My Orders</h1>
            <p className="text-lg opacity-90">View and track your order history</p>
          </div>
        </div>
      </div>

      <div className="wrapper py-12">
        {sortedPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <EmptyState
              image={EmptyStateImage}
              title="No orders found"
              description="You haven't placed any orders yet. Start shopping to see your orders here."
            />
            <Link to={ROUTES.IN_APP.DASHQARDS} className="mt-6">
              <Button variant="primary" className="rounded-full">
                <Icon icon="bi:cart-plus" className="size-5 mr-2" />
                Browse Cards
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-primary-500">{sortedPayments.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                    <Icon icon="bi:receipt" className="size-6 text-primary-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {formatCurrency(
                        sortedPayments.reduce(
                          (sum, payment) => sum + (parseFloat(String(payment.amount)) || 0),
                          0,
                        ),
                        sortedPayments[0]?.currency || 'GHS',
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Icon icon="bi:currency-exchange" className="size-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                    <p className="text-2xl font-bold text-primary-500">
                      {
                        sortedPayments.filter(
                          (p) =>
                            p.status?.toLowerCase() === 'paid' ||
                            p.status?.toLowerCase() === 'completed',
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Icon icon="bi:check-circle" className="size-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <Text variant="h2" weight="semibold" className="text-gray-900">
                  Order History
                </Text>
              </div>

              {sortedPayments.map((payment: PaymentInfoData) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                          <Icon icon="bi:receipt-cutoff" className="size-6 text-primary-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Text variant="h3" weight="semibold" className="text-gray-900">
                              {payment.receipt_number || `Order #${payment.id}`}
                            </Text>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                payment.status || '',
                              )}`}
                            >
                              {payment.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Transaction ID</p>
                              <p className="font-medium text-gray-900 text-xs break-all">
                                {payment.trans_id || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Type</p>
                              <p className="font-medium text-gray-900">
                                {getTypeLabel(payment.type || '')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Date</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(payment.created_at || payment.updated_at || '')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Card Type</p>
                              <p className="font-medium text-gray-900">
                                {payment.card_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-primary-500">
                          {formatCurrency(
                            parseFloat(String(payment.amount)) || 0,
                            payment.currency || 'GHS',
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => {
                            // TODO: Implement view details functionality
                            console.log('View details for payment:', payment.id)
                          }}
                        >
                          <Icon icon="bi:eye" className="size-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
