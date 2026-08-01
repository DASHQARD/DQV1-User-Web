import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

import { useAuthStore } from '@/stores'
import { ENV_VARS } from '@/utils/constants'

export const ACCESS_TOKEN_REFRESH_THRESHOLD_MS = 60_000

type JwtPayload = {
  exp?: number
}

/** In-flight refresh shared by the axios interceptor and useAutoRefreshToken. */
let refreshPromise: Promise<string> | null = null

export function extractTokensFromPayload(payload: unknown): {
  accessToken?: string
  refreshToken?: string
} {
  const root = payload as Record<string, unknown> | null | undefined
  const data = (root?.data ?? root) as Record<string, unknown> | null | undefined
  const nested = (data?.data ?? data) as Record<string, unknown> | null | undefined
  const tokens = (nested?.tokens ?? data?.tokens ?? {}) as Record<string, unknown>

  const accessToken =
    (tokens.access_token as string | undefined) ??
    (tokens.accessToken as string | undefined) ??
    (nested?.access_token as string | undefined) ??
    (nested?.accessToken as string | undefined) ??
    (data?.access_token as string | undefined) ??
    (data?.accessToken as string | undefined)

  const refreshToken =
    (tokens.refresh_token as string | undefined) ??
    (tokens.refreshToken as string | undefined) ??
    (nested?.refresh_token as string | undefined) ??
    (nested?.refreshToken as string | undefined) ??
    (data?.refresh_token as string | undefined) ??
    (data?.refreshToken as string | undefined)

  return { accessToken, refreshToken }
}

export function isAccessTokenExpired(
  token: string,
  thresholdMs = ACCESS_TOKEN_REFRESH_THRESHOLD_MS,
): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (!decoded.exp) return false
    return decoded.exp * 1000 - Date.now() <= thresholdMs
  } catch {
    return true
  }
}

export function isInvalidTokenTypeMessage(message: unknown): boolean {
  return String(message ?? '')
    .toLowerCase()
    .includes('invalid token type')
}

async function performTokenRefresh(): Promise<string> {
  const state = useAuthStore.getState()
  const refreshTokenValue = state.getRefreshToken()
  const isGuestAuth = state.isGuestAuth

  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }

  const url = isGuestAuth
    ? `${ENV_VARS.API_BASE_URL}/api/v1/guest-auth/token/refresh`
    : `${ENV_VARS.API_BASE_URL}/api/v1/auth/refresh-token`

  const response = await axios.post(url, { refresh_token: refreshTokenValue })
  const { accessToken, refreshToken: newRefreshToken } = extractTokensFromPayload(response?.data)

  if (!accessToken) {
    throw new Error('Unable to refresh access token')
  }

  useAuthStore.getState().authenticate({
    token: accessToken,
    refreshToken: newRefreshToken ?? refreshTokenValue,
    isGuestAuth,
  })

  return accessToken
}

/** Refresh access token using the stored refresh token; updates auth store via authenticate(). */
export async function refreshStoredAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/** Test helper — clears the shared refresh promise between tests. */
export function resetRefreshLockForTests(): void {
  refreshPromise = null
}

export function isGuestSessionExpiredMessage(message: unknown): boolean {
  const normalized = String(message ?? '').toLowerCase()
  return (
    normalized.includes('session expired') ||
    normalized.includes('please start a new session')
  )
}
