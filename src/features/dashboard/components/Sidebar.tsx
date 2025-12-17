import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import CorporateSidebar from './sidebar/CorporateSidebar'
import VendorSidebar from './sidebar/VendorSidebar'
import UserSidebar from './sidebar/UserSidebar'

export default function Sidebar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Check if user can switch profiles (show switcher for vendor/corporate/corporate_vendor users)
  const userType = (user as any)?.user_type
  const canSwitchProfiles =
    userType === 'vendor' || userType === 'corporate' || userType === 'corporate_vendor'

  // Determine profile from URL, localStorage, or user type
  const currentProfile = React.useMemo((): 'vendor' | 'corporate' | null => {
    // Check URL first - prioritize URL parameter regardless of canSwitchProfiles
    const urlAccount = searchParams.get('account')
    if (urlAccount === 'vendor' || urlAccount === 'corporate') {
      return urlAccount
    }

    // Regular users don't have profiles (only if no URL param)
    if (!canSwitchProfiles) {
      return null
    }

    // Fallback to localStorage
    const savedProfile = localStorage.getItem('selectedProfile') as 'vendor' | 'corporate' | null
    if (savedProfile === 'vendor' || savedProfile === 'corporate') {
      return savedProfile
    }
    // Fallback to user type
    // For corporate_vendor, default to vendor profile
    if (userType === 'corporate_vendor') {
      return 'vendor'
    }
    if (userType === 'corporate') {
      return 'corporate'
    }
    if (userType === 'vendor') {
      return 'vendor'
    }
    return null
  }, [searchParams, userType, canSwitchProfiles])

  // Update URL if account param is missing but we have a profile
  React.useEffect(() => {
    const urlAccount = searchParams.get('account')
    if (!urlAccount && canSwitchProfiles && currentProfile) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.set('account', currentProfile)
      navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true })
    }
  }, [searchParams, currentProfile, canSwitchProfiles, navigate])

  // Render appropriate sidebar based on profile
  if (currentProfile === 'corporate') {
    return <CorporateSidebar />
  }

  if (currentProfile === 'vendor') {
    return <VendorSidebar />
  }

  return <UserSidebar />
}
