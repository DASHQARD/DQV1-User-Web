import React, { useState, useEffect, useMemo } from 'react'
import { Icon } from '@/libs'
import { formatRelativeTime, getFormattedLastLogin, updateLastLoginTime } from '@/utils/format'
import LoaderGif from '@/assets/gifs/loader.gif'

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

export default function AdminHome() {
  const [isLoading, setIsLoading] = useState(false)
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

  const lastLoginInfo = getFormattedLastLogin()
  const lastRefreshTime = formatRelativeTime(new Date())

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value)
    // In a real app, you would call an API with the selected period here
    console.log('Refreshing data for period:', e.target.value, 'days')
  }

  // Mock data - replace with actual API calls
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const metrics = {
    totalUsers: 1250,
    totalTransactions: 5432,
    totalRevenue: 1250000,
    pendingApprovals: 23,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl">
        <div className="text-center">
          <img src={LoaderGif} alt="Loading..." className="w-20 h-auto mx-auto mb-5" />
          <p className="text-[#6c757d] text-base m-0">Loading admin dashboard...</p>
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
                Admin Dashboard
              </h1>
              <p className="text-base text-[#6c757d] m-0 leading-relaxed">
                Welcome back! Here's an overview of the system
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:people-fill" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {metrics.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Users</div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:receipt" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {metrics.totalTransactions.toLocaleString()}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Transactions</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:currency-dollar" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Total Revenue</div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-3xl shrink-0">
              <Icon icon="bi:clock-history" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold mb-1 leading-none text-[#402D87]">
                {metrics.pendingApprovals}
              </div>
              <div className="text-sm text-[#6c757d] mb-2 font-medium">Pending Approvals</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
            <div className="p-6 pb-0 mb-5">
              <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
                <Icon icon="bi:activity" className="text-[#402D87] mr-2" />
                System Overview
              </h5>
            </div>

            <div className="px-6 pb-6">
              <div className="text-center py-10 text-[#6c757d]">
                <Icon icon="bi:graph-up" className="text-5xl text-[#e9ecef] mb-4" />
                <p className="m-0 text-sm">System analytics will be displayed here</p>
                <p className="m-0 text-xs mt-2 text-[#adb5bd]">
                  Connect to your analytics API to view detailed metrics
                </p>
              </div>
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

