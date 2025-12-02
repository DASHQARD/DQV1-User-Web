import { useState, useEffect } from 'react'

export interface GiftCardPerformance {
  type: string
  totalRedeemed: number
  redemptionCount: number
  averageAmount: number
  percentage: number
}

export interface VendorRedemption {
  id: string
  amount: number
  giftCardType: string
  updated_at: string
}

export interface VendorMetrics {
  totalRedemptions: number
  totalDashxRedeemed: number
  totalDashpassRedeemed: number
  giftCardRedemptions: number
  giftCardPerformance: GiftCardPerformance[]
  payoutAmount: number
  payoutPeriod: string
  pendingPayout: number
}

export function useVendorDashboardMetrics(timeRange: string = '30', giftCardType?: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<VendorMetrics>({
    totalRedemptions: 0,
    totalDashxRedeemed: 0,
    totalDashpassRedeemed: 0,
    giftCardRedemptions: 0,
    giftCardPerformance: [],
    payoutAmount: 0,
    payoutPeriod: '',
    pendingPayout: 0,
  })
  const [recentRedemptions, setRecentRedemptions] = useState<VendorRedemption[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        // const response = await api.get(`/vendor/dashboard/metrics?timeRange=${timeRange}&type=${giftCardType || 'all'}`)

        // Mock data for now
        setTimeout(() => {
          const mockRedemptions: VendorRedemption[] = [
            {
              id: '1',
              amount: 150,
              giftCardType: 'DashPro',
              updated_at: new Date(Date.now() - 1800000).toISOString(),
            },
            {
              id: '2',
              amount: 250,
              giftCardType: 'DashX',
              updated_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '3',
              amount: 75,
              giftCardType: 'DashPro',
              updated_at: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: '4',
              amount: 300,
              giftCardType: 'DashX',
              updated_at: new Date(Date.now() - 10800000).toISOString(),
            },
            {
              id: '5',
              amount: 100,
              giftCardType: 'DashPass',
              updated_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: '6',
              amount: 200,
              giftCardType: 'DashPass',
              updated_at: new Date(Date.now() - 172800000).toISOString(),
            },
            {
              id: '7',
              amount: 175,
              giftCardType: 'DashX',
              updated_at: new Date(Date.now() - 259200000).toISOString(),
            },
            {
              id: '8',
              amount: 125,
              giftCardType: 'DashPass',
              updated_at: new Date(Date.now() - 345600000).toISOString(),
            },
          ]

          // Filter by gift card type if specified
          const filteredRedemptions =
            giftCardType && giftCardType !== 'all'
              ? mockRedemptions.filter((r) => r.giftCardType === giftCardType)
              : mockRedemptions

          // Calculate metrics
          const totalRedemptions = filteredRedemptions.length
          const totalDashxRedeemed = filteredRedemptions
            .filter((r) => r.giftCardType === 'DashX')
            .reduce((sum, r) => sum + r.amount, 0)
          const totalDashpassRedeemed = filteredRedemptions
            .filter((r) => r.giftCardType === 'DashPass')
            .reduce((sum, r) => sum + r.amount, 0)
          const giftCardRedemptions = filteredRedemptions.reduce((sum, r) => sum + r.amount, 0)

          // Calculate gift card performance
          const performanceMap = new Map<string, { total: number; count: number }>()
          filteredRedemptions.forEach((redemption) => {
            const existing = performanceMap.get(redemption.giftCardType) || { total: 0, count: 0 }
            performanceMap.set(redemption.giftCardType, {
              total: existing.total + redemption.amount,
              count: existing.count + 1,
            })
          })

          const giftCardPerformance: GiftCardPerformance[] = Array.from(performanceMap.entries())
            .map(([type, data]) => ({
              type,
              totalRedeemed: data.total,
              redemptionCount: data.count,
              averageAmount: data.total / data.count,
              percentage: (data.total / giftCardRedemptions) * 100,
            }))
            .sort((a, b) => b.totalRedeemed - a.totalRedeemed)

          setMetrics({
            totalRedemptions,
            totalDashxRedeemed,
            totalDashpassRedeemed,
            giftCardRedemptions,
            giftCardPerformance,
            payoutAmount: 2875.5,
            payoutPeriod: 'Monthly (End of month)',
            pendingPayout: 875.25,
          })
          setRecentRedemptions(filteredRedemptions.slice(0, 10))
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching vendor dashboard metrics:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange, giftCardType])

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
    isLoading,
    metrics,
    recentRedemptions,
    formatCurrency,
  }
}
