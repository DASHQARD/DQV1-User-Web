import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePresignedMediaUrl, useUserProfile } from '@/hooks'
import { useAuth } from '@/features/auth'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { getBranchUserAvatarUrl } from '@/utils/branchUserAvatar'
import type { BranchInfoResponse } from '../services'
import {
  getBranchOnboardingDiscoveryScore,
  getBranchOnboardingProgress,
  isBranchOnboardingComplete,
} from '../utils/branchOnboardingProgress'
import { branchQueries } from './useBranchQueries'

export function useBranchSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout: clearAuthState } = useAuthStore()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation } = useLogoutService()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const { useGetBranchInfoService } = branchQueries()
  const { data: branchInfoResponse } = useGetBranchInfoService()

  const data =
    (branchInfoResponse as BranchInfoResponse | undefined)?.data ??
    (branchInfoResponse as BranchInfoResponse['data'] | undefined)
  const branch = data?.branch
  const branchManager = data?.branch_manager

  const avatarSource = useMemo(
    () => getBranchUserAvatarUrl(userProfileData),
    [userProfileData],
  )
  const { url: logoUrl } = usePresignedMediaUrl(avatarSource)

  const branchName = branch?.branch_name ?? null
  const branchManagerName = branch?.branch_manager_name ?? branchManager?.fullname ?? null
  const branchLocation = branch?.branch_location ?? null

  const branchOnboardingProgress = useMemo(
    () => getBranchOnboardingProgress(userProfileData as Record<string, unknown> | undefined),
    [userProfileData],
  )

  const isOnboardingComplete = useMemo(
    () => isBranchOnboardingComplete(branchOnboardingProgress),
    [branchOnboardingProgress],
  )

  const canAccessExperienceAndRedemptions = isOnboardingComplete

  const discoveryScore = useMemo(
    () => getBranchOnboardingDiscoveryScore(branchOnboardingProgress),
    [branchOnboardingProgress],
  )

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path
    if (location.pathname === path) return true
    if (path === ROUTES.IN_APP.DASHBOARD.BRANCH.HOME) {
      return location.pathname === path || location.pathname === ROUTES.IN_APP.DASHBOARD.BRANCH.HOME
    }
    if (location.pathname.startsWith(path + '/')) return true
    return false
  }

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=branch`
  }

  const logout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        clearAuthState()
        navigate(ROUTES.IN_APP.HOME, { replace: true })
      },
    })
  }

  return {
    location,
    navigate,
    logout,
    isCollapsed,
    setIsCollapsed,
    logoUrl,
    branchName,
    branchManagerName,
    branchLocation,
    discoveryScore,
    isOnboardingComplete,
    canAccessExperienceAndRedemptions,
    isActive,
    addAccountParam,
  }
}
