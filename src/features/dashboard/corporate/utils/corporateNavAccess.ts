import { ROUTES } from '@/utils/constants'
import { CORPORATE_NAV_ITEMS } from '@/utils/constants/nav'

export type CorporateNavUserType =
  | 'corporate'
  | 'corporate admin'
  | 'corporate super admin'
  | string
  | undefined

/** Routes only available after onboarding + account approval. */
export const CORPORATE_APPROVAL_GATED_PATHS = new Set<string>([
  ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.RECIPIENTS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS,
])

/** Management routes reserved for corporate super admin. */
export const CORPORATE_SUPER_ADMIN_ONLY_PATHS = new Set<string>([
  ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS,
  ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS,
])

/** Requests visible to invited corporate admins and super admins. */
export const CORPORATE_ADMIN_REQUESTS_PATH = ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS

export function isCorporateSuperAdmin(userType?: string): boolean {
  return userType === 'corporate super admin'
}

export function isCorporateAdmin(userType?: string): boolean {
  return userType === 'corporate admin'
}

export function isCorporateAccountOwner(userType?: string): boolean {
  return userType === 'corporate'
}

export function isAnyCorporateUser(userType?: string): boolean {
  return (
    isCorporateAccountOwner(userType) ||
    isCorporateAdmin(userType) ||
    isCorporateSuperAdmin(userType)
  )
}

type CorporateProfileForAccess = {
  user_type?: string
  status?: string
  onboarding_progress?: {
    personal_details_completed?: boolean
    upload_id_completed?: boolean
    business_details_completed?: boolean
    business_documents_completed?: boolean
  }
}

export function getCorporateAccessState(profile?: CorporateProfileForAccess | null) {
  const userType = profile?.user_type
  const isCorporateAdminUser = isCorporateAdmin(userType)
  const hasProfileAndId = Boolean(
    profile?.onboarding_progress?.personal_details_completed &&
      profile?.onboarding_progress?.upload_id_completed,
  )
  const hasBusinessDetailsAndDocs = Boolean(
    profile?.onboarding_progress?.business_details_completed &&
      profile?.onboarding_progress?.business_documents_completed,
  )
  const isOnboardingComplete = isCorporateAdminUser
    ? hasProfileAndId
    : hasProfileAndId && hasBusinessDetailsAndDocs
  const isApprovedOrVerified = profile?.status === 'approved' || profile?.status === 'verified'
  const canAccessRestrictedFeatures = isOnboardingComplete && isApprovedOrVerified

  return {
    userType,
    isOnboardingComplete,
    isApprovedOrVerified,
    canAccessRestrictedFeatures,
    isStatusPending: profile?.status === 'pending',
  }
}

type CorporateNavAccessOptions = {
  canAccessRestrictedFeatures?: boolean
}

/** Whether a corporate sidebar route should render for this user type and access state. */
export function isCorporateNavItemVisible(
  path: string,
  userType?: string,
  access?: CorporateNavAccessOptions,
): boolean {
  if (CORPORATE_SUPER_ADMIN_ONLY_PATHS.has(path)) {
    return isCorporateSuperAdmin(userType)
  }

  if (path === CORPORATE_ADMIN_REQUESTS_PATH) {
    return isCorporateSuperAdmin(userType) || isCorporateAdmin(userType)
  }

  if (CORPORATE_APPROVAL_GATED_PATHS.has(path)) {
    return Boolean(access?.canAccessRestrictedFeatures)
  }

  return true
}

export type CorporateAccountMenuItem = {
  label: string
  icon: string
  path: string
}

type BuildCorporateAccountMenuOptions = {
  userType?: string
  canAccessRestrictedFeatures: boolean
}

function withAccountParam(path: string): string {
  return `${path}?account=corporate`
}

/** Account dropdown entries — same routes/labels as `CORPORATE_NAV_ITEMS` sidebar. */
export function buildCorporateAccountMenuItems(
  options: BuildCorporateAccountMenuOptions,
): CorporateAccountMenuItem[] {
  const { userType, canAccessRestrictedFeatures } = options
  const access = { canAccessRestrictedFeatures }
  const items: CorporateAccountMenuItem[] = []

  for (const section of CORPORATE_NAV_ITEMS) {
    for (const navItem of section.items) {
      if (!isCorporateNavItemVisible(navItem.path, userType, access)) continue
      items.push({
        label: navItem.label,
        icon: navItem.icon,
        path: withAccountParam(navItem.path),
      })
    }
  }

  return items
}

export function isCorporateNavItemDisabled(
  path: string,
  options: {
    userType?: string
    canAccessRestrictedFeatures: boolean
    isOnboardingComplete: boolean
    isStatusPending: boolean
  },
): boolean {
  const { userType, canAccessRestrictedFeatures, isOnboardingComplete, isStatusPending } = options

  if (!isCorporateNavItemVisible(path, userType, { canAccessRestrictedFeatures })) return true

  if (CORPORATE_APPROVAL_GATED_PATHS.has(path) && !canAccessRestrictedFeatures) {
    return true
  }

  if (
    (path === ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS) &&
    !isOnboardingComplete
  ) {
    return true
  }

  if (
    (path === ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS ||
      path === ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS) &&
    !canAccessRestrictedFeatures
  ) {
    return true
  }

  if (path === ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS && isStatusPending) {
    return true
  }

  return false
}
