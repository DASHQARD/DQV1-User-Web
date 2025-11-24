import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics'
import { formatRelativeTime, getFormattedLastLogin, updateLastLoginTime } from '@/utils/format'
import LoaderGif from '@/assets/gifs/loader.gif'
import { ROUTES } from '@/utils/constants'

interface LocationInfo {
  city: string
  country: string
  ip: string
  isp: string
}

interface DeviceInfo {
  type: string
  browser: string
  os: string
}

interface Activity {
  type: 'purchase' | 'redemption'
  icon: string
  title: string
  description: string
  amount: number
  date: string
}

export default function Home() {
  const { isLoading, metrics, recentPurchases, recentRedemptions, formatCurrency } =
    useDashboardMetrics()
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    city: 'Accra',
    country: 'Ghana',
    ip: 'Loading...',
    isp: 'Loading...',
  })

  // Update last login time on mount
  useEffect(() => {
    updateLastLoginTime()
  }, [])

  // Fetch location data
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        if (data.city && data.country_name) {
          setLocationInfo({
            city: data.city,
            country: data.country_name,
            ip: data.ip || 'N/A',
            isp: data.org || 'N/A',
          })
        }
      } catch {
        console.log('Could not fetch location data')
        setLocationInfo({
          city: 'Accra',
          country: 'Ghana',
          ip: 'N/A',
          isp: 'N/A',
        })
      }
    }

    fetchLocation()
  }, [])

  // Device info
  const deviceInfo = useMemo<DeviceInfo>(() => {
    const userAgent = navigator.userAgent
    let type = 'Desktop'
    let browser = 'Unknown'
    let os = 'Unknown'

    // Detect device type
    if (/mobile/i.test(userAgent)) {
      type = 'Mobile Device'
    } else if (/tablet/i.test(userAgent)) {
      type = 'Tablet'
    } else {
      type = 'Desktop Computer'
    }

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      browser = 'Google Chrome'
    } else if (userAgent.includes('Firefox')) {
      browser = 'Mozilla Firefox'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari'
    } else if (userAgent.includes('Edge')) {
      browser = 'Microsoft Edge'
    }

    // Detect operating system
    if (userAgent.includes('Windows')) {
      os = 'Windows'
    } else if (userAgent.includes('Mac')) {
      os = 'macOS'
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
    } else if (userAgent.includes('Android')) {
      os = 'Android'
    } else if (userAgent.includes('iOS')) {
      os = 'iOS'
    }

    return { type, browser, os }
  }, [])

  // Combined activity timeline
  const combinedActivity = useMemo<Activity[]>(() => {
    const activities: Activity[] = []

    // Calculate cutoff date based on selected period
    const daysAgo = parseInt(selectedPeriod)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

    // Add purchases (filter by date)
    recentPurchases.forEach((purchase) => {
      const purchaseDate = new Date(purchase.updated_at)
      if (purchaseDate >= cutoffDate) {
        activities.push({
          type: 'purchase',
          icon: 'bi:cart-plus',
          title: 'Purchase Transaction',
          description: 'DashPro card purchased',
          amount: purchase.amount,
          date: purchase.updated_at,
        })
      }
    })

    // Add redemptions (filter by date)
    recentRedemptions.forEach((redemption) => {
      const redemptionDate = new Date(redemption.updated_at)
      if (redemptionDate >= cutoffDate) {
        activities.push({
          type: 'redemption',
          icon: 'bi:credit-card-2-front',
          title: 'Redemption Transaction',
          description: 'Amount redeemed at vendor',
          amount: redemption.amount,
          date: redemption.updated_at,
        })
      }
    })

    // Sort by date (most recent first) and limit to 8 items
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [recentPurchases, recentRedemptions, selectedPeriod])

  const lastLoginInfo = getFormattedLastLogin()
  const lastRefreshTime = formatRelativeTime(new Date())

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value)
    // In a real app, you would call an API with the selected period here
    console.log('Refreshing data for period:', e.target.value, 'days')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl">
        <div className="text-center">
          <img src={LoaderGif} alt="Loading..." className="w-20 h-auto mx-auto mb-5" />
          <p className="text-[#6c757d] text-base m-0">Loading dashboard analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] rounded-xl overflow-hidden min-h-[600px]">
      <section className="py-8 flex flex-col gap-8">
        <div className="pb-8 border-b border-[#e9ecef]">
          <div className="flex justify-between items-start flex-wrap gap-5">
            <div>
              <h1 className="text-[32px] font-bold text-[#2c3e50] mb-2 flex items-center">
                <Icon icon="bi:speedometer2" className="text-[#402D87] mr-3" />
                Dashboard Overview
              </h1>
              <p className="text-base text-[#6c757d] m-0 leading-relaxed">
                Welcome back! Here's what's happening with your account
              </p>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="text-[13px] text-[#6c757d] flex items-center gap-1">
                <Icon icon="bi:clock-history" className="text-[#402D87]" />
                Last login: {lastLoginInfo}
              </div>
              <div className="text-[13px] text-[#6c757d] flex items-center gap-1">
                <Icon icon="bi:arrow-clockwise" className="text-[#402D87]" />
                Updated {lastRefreshTime}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Section */}

        <div className="flex justify-between items-center">
          <h5 className="text-xl font-semibold text-[#495057] m-0">Key Performance Metrics</h5>
          <div>
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="border border-[#e9ecef] rounded-md py-2 px-3 text-sm bg-white text-[#495057] cursor-pointer focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Available Balance */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:wallet2" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.redemptionBalance)}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Available Balance</div>
            </div>
          </div>

          {/* Total Purchased */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:cart-plus" />
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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:credit-card-2-front" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalRedeemed)}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Redeemed</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
                Recent Activity
              </h5>
              <div>
                <Link
                  to={ROUTES.IN_APP.DASHBOARD.HOME + '/transactions'}
                  className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
                >
                  View All <Icon icon="bi:arrow-right" className="ml-1" />
                </Link>
              </div>
            </div>

            <div className="px-6 pb-6">
              {combinedActivity.length === 0 ? (
                <div className="text-center py-10 text-[#6c757d]">
                  <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
                  <p className="m-0 text-sm">No recent activity to display</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {combinedActivity.map((activity, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 py-4 ${
                        index < combinedActivity.length - 1 ? 'border-b border-[#f1f3f4]' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5 ${
                          activity.type === 'purchase'
                            ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745]'
                            : 'bg-[rgba(64,45,135,0.1)] text-[#402D87]'
                        }`}
                      >
                        <Icon icon={activity.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-[#495057] text-sm">
                            {activity.title}
                          </span>
                          <span className="font-bold text-[#402D87] text-sm whitespace-nowrap ml-4">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#6c757d] text-[13px]">{activity.description}</span>
                          <span className="text-[#adb5bd] text-xs whitespace-nowrap ml-4">
                            {formatRelativeTime(activity.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Analytics */}
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:graph-up" className="text-[#402D87] mr-2" />
                Access Analytics
              </h5>
            </div>

            <div className="px-6 pb-6 space-y-0">
              <div className="py-4 border-b border-[#f1f3f4] last:border-b-0">
                <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                  Device Information
                </div>
                <div className="text-base font-semibold text-[#495057] mb-0.5">
                  {deviceInfo.type}
                </div>
                <div className="text-[13px] text-[#adb5bd]">
                  {deviceInfo.browser} - {deviceInfo.os}
                </div>
              </div>

              <div className="py-4 border-b border-[#f1f3f4] last:border-b-0">
                <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                  Location
                </div>
                <div className="text-base font-semibold text-[#495057] mb-0.5">
                  {locationInfo.country}
                </div>
                <div className="text-[13px] text-[#adb5bd]">{locationInfo.city}</div>
              </div>

              <div className="py-4 border-b border-[#f1f3f4] last:border-b-0">
                <div className="text-xs text-[#6c757d] uppercase tracking-wider mb-1 font-semibold">
                  IP Address
                </div>
                <div className="text-base font-semibold text-[#495057] mb-0.5">
                  {locationInfo.ip}
                </div>
                <div className="text-[13px] text-[#adb5bd]">{locationInfo.isp}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
