import { useMemo } from 'react'
import { corporateQueries } from '../corporate/hooks/useCorporateQueries'

interface DashboardMetrics {
  redemptionBalance: number
  totalPurchased: number
  totalRedeemed: number
}

interface Purchase {
  id: string
  amount: number
  updated_at: string
}

interface Redemption {
  id: string
  amount: number
  updated_at: string
  giftCardType?: string
}

export function useDashboardMetrics() {
  const { useGetAllCorporatePaymentsService } = corporateQueries()
  const { data, isLoading: isLoadingPayments } = useGetAllCorporatePaymentsService()

  // Handle both direct array response and wrapped response with data property
  const paymentsData = useMemo(() => {
    if (!data) return []

    // Handle both direct array response and wrapped response with data property
    const rawData = Array.isArray(data) ? data : data?.data || []

    if (!Array.isArray(rawData)) return []

    // Filter for paid status payments
    return rawData.filter((payment: any) => {
      return payment.status?.toLowerCase() === 'paid'
    })
  }, [data])

  // Calculate metrics from payments data
  const metrics = useMemo((): DashboardMetrics => {
    if (!Array.isArray(paymentsData) || paymentsData.length === 0) {
      return {
        redemptionBalance: 0,
        totalPurchased: 0,
        totalRedeemed: 0,
      }
    }

    // Filter for purchase-type payments (only paid purchases count)
    const purchasePayments = paymentsData.filter((payment: any) => {
      const paymentType = payment.type?.toLowerCase()
      return (
        paymentType === 'purchase' ||
        paymentType === 'bulk_purchase' ||
        paymentType === 'checkout' ||
        paymentType === 'individual_purchase'
      )
    })

    // Filter for redemption-type payments (only paid redemptions count)
    const redemptionPayments = paymentsData.filter((payment: any) => {
      const paymentType = payment.type?.toLowerCase()
      return paymentType === 'redemption'
    })

    // Calculate total purchased (sum of purchase payment amounts)
    const totalPurchased = purchasePayments.reduce((sum: number, payment: any) => {
      const amount =
        typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0
      return sum + amount
    }, 0)

    // Calculate total redeemed (sum of redemption payment amounts)
    const totalRedeemed = redemptionPayments.reduce((sum: number, payment: any) => {
      const amount =
        typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0
      return sum + amount
    }, 0)

    // Calculate redemption balance (total purchased - total redeemed)
    const redemptionBalance = totalPurchased - totalRedeemed

    return {
      redemptionBalance: Math.max(0, redemptionBalance),
      totalPurchased,
      totalRedeemed,
    }
  }, [paymentsData])

  // Get recent purchases
  const recentPurchases = useMemo((): Purchase[] => {
    if (!Array.isArray(paymentsData) || paymentsData.length === 0) return []

    return paymentsData
      .filter((payment: any) => {
        const paymentType = payment.type?.toLowerCase()
        return (
          paymentType === 'purchase' ||
          paymentType === 'bulk_purchase' ||
          paymentType === 'checkout' ||
          paymentType === 'individual_purchase'
        )
      })
      .map((payment: any) => ({
        id: payment.id?.toString() || '',
        amount:
          typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0,
        updated_at: payment.updated_at || payment.created_at || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
  }, [paymentsData])

  // Get recent redemptions
  const recentRedemptions = useMemo((): Redemption[] => {
    if (!Array.isArray(paymentsData) || paymentsData.length === 0) return []

    return paymentsData
      .filter((payment: any) => {
        const paymentType = payment.type?.toLowerCase()
        return paymentType === 'redemption'
      })
      .map((payment: any) => ({
        id: payment.id?.toString() || '',
        amount:
          typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0,
        updated_at: payment.updated_at || payment.created_at || new Date().toISOString(),
        giftCardType: payment.card_type || undefined,
      }))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
  }, [paymentsData])

  const formatCurrency = (amount: number | string, currency: string = 'GHS'): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return `${currency} 0.00`

    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)
  }

  return {
    isLoading: isLoadingPayments,
    metrics,
    recentPurchases,
    recentRedemptions,
    formatCurrency,
  }
}
