import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import { isVendorPathBlocked } from '@/features/dashboard/utils/vendorOnboardingProgress'
import { ROUTES } from '@/utils/constants'

/** Redirects vendor dashboard routes that are blocked until onboarding is complete. */
export function VendorOnboardingGuard() {
  const location = useLocation()
  const { isComplete, hasFirstBranch, nextStep, addAccountParam, isBranchManager } =
    useVendorOnboardingProgress()

  if (isBranchManager || isComplete) {
    return <Outlet />
  }

  if (
    isVendorPathBlocked(location.pathname, {
      isOnboardingComplete: isComplete,
      hasFirstBranch,
    })
  ) {
    const redirectTo = nextStep
      ? addAccountParam(nextStep.path)
      : addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.HOME)
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
