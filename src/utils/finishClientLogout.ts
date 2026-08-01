import type { NavigateFunction } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'

export const DEFAULT_POST_LOGOUT_PATH = ROUTES.IN_APP.HOME

/**
 * Soft logout for components inside the router.
 * Navigate first so RouteGuard can unmount before auth is cleared.
 */
export function finishClientLogout(
  navigate: NavigateFunction,
  clearAuthState: () => void,
  redirectTo: string = DEFAULT_POST_LOGOUT_PATH,
): void {
  navigate(redirectTo, { replace: true })
  clearAuthState()
}

/**
 * Hard logout for code outside the router (axios interceptor, token auto-refresh).
 * Clears auth then forces a full navigation so a stuck dashboard tree cannot re-render.
 */
export function forceClientLogout(
  clearAuthState: () => void,
  redirectTo: string = DEFAULT_POST_LOGOUT_PATH,
): void {
  clearAuthState()

  const path = window.location.pathname
  // Stay on auth and redemption flows; avoid a useless reload when already home.
  if (path.includes('auth') || path.includes('/redeem') || path === redirectTo) {
    return
  }

  window.location.replace(redirectTo)
}
