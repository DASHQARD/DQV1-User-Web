import { useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router'
import { Sidebar } from '../components'
import { useUserProfile } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import type { UserProfileResponse } from '@/types/user'

// Helper function to check if compliance is completed
const isComplianceComplete = (userProfile: UserProfileResponse | undefined): boolean => {
  if (!userProfile) return false

  const hasProfile =
    Boolean(userProfile.fullname) &&
    Boolean(userProfile.street_address) &&
    Boolean(userProfile.dob) &&
    Boolean(userProfile.id_number)

  const hasIdentityDocs = Boolean(userProfile.id_images?.length)
  const hasProfileAndIdentity = hasProfile && hasIdentityDocs
  const hasBusinessDetails = Boolean(userProfile.business_details?.length)
  const hasBusinessDocs = Boolean(userProfile.business_documents?.length)
  const hasBusinessDetailsAndDocs = hasBusinessDetails && hasBusinessDocs
  const hasPaymentDetails =
    Boolean(userProfile.momo_accounts?.length) || Boolean(userProfile.bank_accounts?.length)
  const branchesData = userProfile.branches
  const branchCount = Array.isArray(branchesData) ? branchesData.length : 0

  // All checklist items must be complete (profile & identity combined as 1, business details & docs combined as 1)
  return hasProfileAndIdentity && hasBusinessDetailsAndDocs && hasPaymentDetails && branchCount > 0
}

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile()

  const userType = (user as any)?.user_type
  const urlAccount = searchParams.get('account')

  // Handle corporate_vendor users - they can switch between vendor and corporate
  const isVendor =
    urlAccount === 'vendor' ||
    (!urlAccount && (userType === 'vendor' || userType === 'corporate_vendor'))
  const isCorporate = urlAccount === 'corporate' || (!urlAccount && userType === 'corporate')

  // Helper function to add account parameter to URLs
  const addAccountParam = useCallback(
    (path: string): string => {
      const canSwitchProfiles =
        userType === 'vendor' || userType === 'corporate' || userType === 'corporate_vendor'
      if (!canSwitchProfiles) return path
      const separator = path.includes('?') ? '&' : '?'
      const account = isVendor ? 'vendor' : isCorporate ? 'corporate' : ''
      return account ? `${path}${separator}account=${account}` : path
    },
    [userType, isVendor, isCorporate],
  )

  // Redirect to compliance if not completed (only on first access after login, not when navigating within dashboard)
  useEffect(() => {
    if (!isLoadingProfile && userProfile) {
      const needsCompliance = isVendor || isCorporate || userType === 'corporate_vendor'
      if (needsCompliance && !isComplianceComplete(userProfile)) {
        const hasRedirected = sessionStorage.getItem('complianceRedirectDone')
        const hasManuallyAccessedDashboard = sessionStorage.getItem('dashboardManuallyAccessed')
        const isOnCompliancePage = location.pathname.startsWith(
          ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT,
        )
        const isOnHomePage = location.pathname === ROUTES.IN_APP.DASHBOARD.HOME

        // Only redirect if:
        // 1. User is on the dashboard home page
        // 2. We haven't already redirected in this session
        // 3. User hasn't manually accessed dashboard (from sidebar)
        // 4. We're not already on a compliance page
        if (
          isOnHomePage &&
          !hasRedirected &&
          !hasManuallyAccessedDashboard &&
          !isOnCompliancePage
        ) {
          sessionStorage.setItem('complianceRedirectDone', 'true')
          const complianceUrl = addAccountParam(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
          navigate(complianceUrl, { replace: true })
        }
      } else if (needsCompliance && isComplianceComplete(userProfile)) {
        // Clear the redirect flag if compliance is complete
        sessionStorage.removeItem('complianceRedirectDone')
        sessionStorage.removeItem('dashboardManuallyAccessed')
      }
    }
  }, [
    isLoadingProfile,
    userProfile,
    isVendor,
    isCorporate,
    userType,
    navigate,
    searchParams,
    location.pathname,
    addAccountParam,
  ])

  // Track when user manually navigates to dashboard (clicking from sidebar)
  useEffect(() => {
    if (location.pathname === ROUTES.IN_APP.DASHBOARD.HOME) {
      // Check if user navigated from within dashboard (not from login)
      const previousPath = sessionStorage.getItem('previousDashboardPath')
      const isNavigatingWithinDashboard = previousPath && previousPath.startsWith('/dashboard')

      if (isNavigatingWithinDashboard) {
        // User manually navigated to dashboard - allow them to see it
        sessionStorage.setItem('dashboardManuallyAccessed', 'true')
        sessionStorage.removeItem('complianceRedirectDone')
      }

      // Update previous path
      sessionStorage.setItem('previousDashboardPath', location.pathname)
    } else if (location.pathname.startsWith('/dashboard')) {
      // Track any dashboard navigation
      sessionStorage.setItem('previousDashboardPath', location.pathname)
    }
  }, [location.pathname])

  return (
    <div className="no-print relative flex overflow-hidden h-screen">
      <Sidebar />
      <div className="bg-gray-50 flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden">
        {/* <Topbar /> */}
        <main className="flex-1 px-5 sm:px-10 py-5 min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
