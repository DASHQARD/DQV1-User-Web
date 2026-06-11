import type { NavigateFunction } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'

export const DEFAULT_POST_LOGOUT_PATH = ROUTES.IN_APP.HOME

/** Leave protected routes before clearing auth so RouteGuard does not send users to login. */
export function finishClientLogout(
  navigate: NavigateFunction,
  clearAuthState: () => void,
  redirectTo: string = DEFAULT_POST_LOGOUT_PATH,
): void {
  navigate(redirectTo, { replace: true })
  clearAuthState()
}
