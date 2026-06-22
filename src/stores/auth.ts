import { jwtDecode } from 'jwt-decode'
import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { clearGuestBrowserStorage } from '@/features/website/utils/clearGuestCheckoutStorage'

type State = {
  token: string | null
  refreshToken: string | null
  user: Record<string, any> | null
  isAuthenticated: boolean
  /** True when authenticated via guest OTP; use guest-auth/token/refresh for refresh */
  isGuestAuth: boolean
  /** True after guest phone OTP — required before assign-recipient APIs. */
  guestOtpVerified: boolean
  /** Guest cart numeric id — used for guest-carts/add-card when required */
  guestCartId: number | null
  /** Guest cart UUID — required for POST /payments/guest/checkout */
  guestCartUuid: string | null
  /** False until persisted auth is rehydrated and optional boot refresh completes. */
  isSessionReady: boolean
}

type Actions = {
  reset: () => void
  authenticate: (details: {
    token: string
    refreshToken?: string | null
    isGuestAuth?: boolean
    guestOtpVerified?: boolean
  }) => void
  getToken: () => State['token']
  getRefreshToken: () => State['refreshToken']
  setToken: (newToken: string) => void
  setRefreshToken: (newToken: string | null) => void
  setGuestCartId: (cartId: number | null) => void
  getGuestCartId: () => State['guestCartId']
  setGuestCartUuid: (uuid: string | null) => void
  getGuestCartUuid: () => State['guestCartUuid']
  setSessionReady: (ready: boolean) => void
  logout: () => void
}

const decodeUser = (token: string | null) => {
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

const initialState: State = {
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  isGuestAuth: false,
  guestOtpVerified: false,
  guestCartId: null,
  guestCartUuid: null,
  isSessionReady: false,
}

const authStore: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,
  reset: () => set({ ...initialState, isSessionReady: true }),
  authenticate: ({ token, refreshToken, isGuestAuth = false, guestOtpVerified = false }) => {
    set({
      user: decodeUser(token),
      token,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
      isGuestAuth,
      guestOtpVerified: isGuestAuth ? guestOtpVerified : false,
      isSessionReady: true,
      ...(isGuestAuth
        ? {}
        : {
            guestCartId: null,
            guestCartUuid: null,
          }),
    })
  },
  logout: () => {
    clearGuestBrowserStorage()
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isGuestAuth: false,
      guestOtpVerified: false,
      guestCartId: null,
      guestCartUuid: null,
      isSessionReady: true,
    })
  },
  getToken: () => get().token,
  getRefreshToken: () => get().refreshToken,
  setGuestCartId: (cartId) => set({ guestCartId: cartId }),
  getGuestCartId: () => get().guestCartId,
  setGuestCartUuid: (uuid) => set({ guestCartUuid: uuid }),
  getGuestCartUuid: () => get().guestCartUuid,
  setSessionReady: (ready) => set({ isSessionReady: ready }),
  setToken: (newToken: string) =>
    set({
      token: newToken,
      user: decodeUser(newToken),
    }),
  setRefreshToken: (newToken: string | null) => set({ refreshToken: newToken }),
})

const useAuthStore = create(
  persist(authStore, {
    name: 'dashqard-web-auth-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      token: state.token,
      refreshToken: state.refreshToken,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isGuestAuth: state.isGuestAuth,
      guestOtpVerified: state.guestOtpVerified,
      guestCartId: state.guestCartId,
      guestCartUuid: state.guestCartUuid,
    }),
  }),
)

export { useAuthStore }
