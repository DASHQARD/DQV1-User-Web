import { useState, useEffect } from 'react'

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
}

export function useDashboardMetrics() {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    redemptionBalance: 0,
    totalPurchased: 0,
    totalRedeemed: 0,
  })
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([])
  const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([])

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        // const response = await api.get('/dashboard/metrics')

        // Mock data for now
        setTimeout(() => {
          setMetrics({
            redemptionBalance: 1250.75,
            totalPurchased: 5430.5,
            totalRedeemed: 4179.75,
          })
          setRecentPurchases([
            { id: '1', amount: 100, updated_at: new Date(Date.now() - 3600000).toISOString() },
            { id: '2', amount: 250, updated_at: new Date(Date.now() - 7200000).toISOString() },
            { id: '3', amount: 50, updated_at: new Date(Date.now() - 86400000).toISOString() },
          ])
          setRecentRedemptions([
            { id: '1', amount: 75, updated_at: new Date(Date.now() - 1800000).toISOString() },
            { id: '2', amount: 150, updated_at: new Date(Date.now() - 10800000).toISOString() },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
    recentPurchases,
    recentRedemptions,
    formatCurrency,
  }
}
