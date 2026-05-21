import { ROUTES } from '@/utils/constants'
import type { UserProfileResponse } from '@/types/user'

export type VendorOnboardingStepId =
  | 'profile'
  | 'business'
  | 'payment'
  | 'branch'

export type VendorOnboardingStep = {
  id: VendorOnboardingStepId
  label: string
  description: string
  path: string
  completed: boolean
}

export type VendorOnboardingProgressInput = {
  userProfile?: UserProfileResponse | null
  branchesCount?: number
  isBranchManager?: boolean
  isCorporateSwitchedToVendor?: boolean
}

export type VendorOnboardingProgressResult = {
  steps: VendorOnboardingStep[]
  completedCount: number
  totalCount: number
  progressPercentage: number
  isComplete: boolean
  nextStep: VendorOnboardingStep | null
}

function hasProfileAndId(profile?: UserProfileResponse | null): boolean {
  const progress = profile?.onboarding_progress
  return Boolean(progress?.personal_details_completed && progress?.upload_id_completed)
}

function hasBusinessDetailsAndDocs(profile?: UserProfileResponse | null): boolean {
  const progress = profile?.onboarding_progress
  return Boolean(progress?.business_details_completed && progress?.business_documents_completed)
}

/** True when the user already has vendor/corporate payout details on their profile. */
export function hasVendorPaymentDetails(profile?: UserProfileResponse | null): boolean {
  return Boolean(
    profile?.onboarding_progress?.payment_details_completed ||
      profile?.momo_accounts?.length ||
      profile?.bank_accounts?.length,
  )
}

/** Shared vendor onboarding steps — used by sidebar discovery score, widget, and dashboard banner. */
export function getVendorOnboardingProgress({
  userProfile,
  branchesCount = 0,
  isBranchManager = false,
}: VendorOnboardingProgressInput): VendorOnboardingProgressResult {
  const hasBranches = branchesCount > 0
  const profileDone = hasProfileAndId(userProfile)
  const businessDone = hasBusinessDetailsAndDocs(userProfile)
  const paymentDone = hasVendorPaymentDetails(userProfile)

  const steps: VendorOnboardingStep[] = []

  steps.push({
    id: 'profile',
    label: 'Profile Information & ID Upload',
    description: 'Complete your profile information and upload a government-issued photo ID',
    path: ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.PROFILE_INFORMATION,
    completed: profileDone,
  })

  if (!isBranchManager) {
    steps.push({
      id: 'business',
      label: 'Business Details & Documents',
      description: 'Complete your business information and upload business documents',
      path: ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.BUSINESS_DETAILS,
      completed: businessDone,
    })

    steps.push({
      id: 'payment',
      label: 'Payment Details',
      description: 'Add a mobile money or bank account to receive vendor payouts',
      path: ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_DETAILS,
      completed: paymentDone,
    })

    steps.push({
      id: 'branch',
      label: 'Create Your First Branch',
      description: 'Create at least one branch to get started',
      path: ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_BRANCH_MANAGER,
      completed: hasBranches,
    })
  }

  const completedCount = steps.filter((s) => s.completed).length
  const totalCount = steps.length
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const nextStep = steps.find((s) => !s.completed) ?? null

  return {
    steps,
    completedCount,
    totalCount,
    progressPercentage,
    isComplete: completedCount === totalCount && totalCount > 0,
    nextStep,
  }
}

const VENDOR_NAV_BLOCKED_UNTIL_ONBOARDING_COMPLETE: string[] = [
  ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCH_MANAGERS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE,
  ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.AUDIT_LOGS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS,
]

/** Map a dashboard pathname to the vendor route used for access checks. */
export function getVendorRouteFromPathname(pathname: string): string {
  const branchesRoot = ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES
  const experienceRoot = ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE
  const complianceRoot = ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.ROOT

  if (pathname.startsWith(`${branchesRoot}/`)) return branchesRoot
  if (pathname.startsWith(`${experienceRoot}/`) || pathname === experienceRoot) {
    return experienceRoot
  }
  if (pathname.startsWith(`${complianceRoot}/`) || pathname === complianceRoot) {
    return complianceRoot
  }

  const knownRoutes = [
    ROUTES.IN_APP.DASHBOARD.VENDOR.HOME,
    ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCH_MANAGERS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.AUDIT_LOGS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_BRANCH_MANAGER,
    ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_DETAILS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_ADMIN,
    ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_METHODS,
    ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENTS,
  ] as const

  const match = knownRoutes.find((route) => pathname === route || pathname.startsWith(`${route}/`))
  return match ?? pathname
}

const VENDOR_ONBOARDING_ALLOWED_PREFIXES = [
  ROUTES.IN_APP.DASHBOARD.VENDOR.HOME,
  ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.ROOT,
  ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_BRANCH_MANAGER,
  ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_DETAILS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.INVITE_ADMIN,
  ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_METHODS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENTS,
  ROUTES.IN_APP.DASHBOARD.VENDOR.CORPORATE_PAYMENT_DETAILS,
] as const

export function isVendorPathAllowedDuringOnboarding(pathname: string): boolean {
  if (pathname === ROUTES.IN_APP.DASHBOARD.VENDOR.HOME) return true

  return VENDOR_ONBOARDING_ALLOWED_PREFIXES.filter(
    (prefix) => prefix !== ROUTES.IN_APP.DASHBOARD.VENDOR.HOME,
  ).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function isVendorNavItemDisabled(
  path: string,
  options: { isOnboardingComplete: boolean; hasFirstBranch: boolean },
): boolean {
  const branchesRoot = ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES
  const experienceRoot = ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE

  if (path === branchesRoot || path.startsWith(`${branchesRoot}/`)) {
    return !options.hasFirstBranch
  }
  if (path === experienceRoot || path.startsWith(`${experienceRoot}/`)) {
    return !options.isOnboardingComplete
  }
  if (VENDOR_NAV_BLOCKED_UNTIL_ONBOARDING_COMPLETE.includes(path)) {
    return !options.isOnboardingComplete
  }
  return false
}

export function isVendorPathBlocked(
  pathname: string,
  options: { isOnboardingComplete: boolean; hasFirstBranch: boolean },
): boolean {
  if (isVendorPathAllowedDuringOnboarding(pathname)) return false
  const route = getVendorRouteFromPathname(pathname)
  return isVendorNavItemDisabled(route, options)
}

export function isVendorSettingsDisabled(options: { isOnboardingComplete: boolean }): boolean {
  return !options.isOnboardingComplete
}

export function appendVendorAccountParams(
  path: string,
  options?: { vendorId?: string | null },
): string {
  const params = new URLSearchParams()
  params.set('account', 'vendor')
  if (options?.vendorId) params.set('vendor_id', options.vendorId)
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${params.toString()}`
}
