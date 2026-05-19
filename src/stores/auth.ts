import { jwtDecode } from 'jwt-decode'
import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
} from '@/utils/constants'

type State = {
  token: string | null
  refreshToken: string | null
  user: Record<string, any> | null
  isAuthenticated: boolean
  /** True when authenticated via guest OTP; use guest-auth/token/refresh for refresh */
  isGuestAuth: boolean
  /** Guest cart numeric id — used for guest-carts/add-card when required */
  guestCartId: number | null
  /** Guest cart UUID — required for POST /payments/guest/checkout */
  guestCartUuid: string | null
}

type Actions = {
  reset: () => void
  authenticate: (details: {
    token: string
    refreshToken?: string | null
    isGuestAuth?: boolean
  }) => void
  getToken: () => State['token']
  getRefreshToken: () => State['refreshToken']
  setToken: (newToken: string) => void
  setRefreshToken: (newToken: string | null) => void
  setGuestCartId: (cartId: number | null) => void
  getGuestCartId: () => State['guestCartId']
  setGuestCartUuid: (uuid: string | null) => void
  getGuestCartUuid: () => State['guestCartUuid']
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
  guestCartId: null,
  guestCartUuid: null,
}

const authStore: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,
  reset: () => set({ ...initialState }),
  authenticate: ({ token, refreshToken, isGuestAuth = false }) => {
    set({
      user: decodeUser(token),
      token,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
      isGuestAuth,
    })
  },
  logout: () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(GUEST_EMAIL_STORAGE_KEY)
      sessionStorage.removeItem(GUEST_NAME_STORAGE_KEY)
      sessionStorage.removeItem(GUEST_PHONE_STORAGE_KEY)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(GUEST_EMAIL_STORAGE_KEY)
      localStorage.removeItem(GUEST_NAME_STORAGE_KEY)
      localStorage.removeItem(GUEST_PHONE_STORAGE_KEY)
    }
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isGuestAuth: false,
      guestCartId: null,
      guestCartUuid: null,
    })
  },
  getToken: () => get().token,
  getRefreshToken: () => get().refreshToken,
  setGuestCartId: (cartId) => set({ guestCartId: cartId }),
  getGuestCartId: () => get().guestCartId,
  setGuestCartUuid: (uuid) => set({ guestCartUuid: uuid }),
  getGuestCartUuid: () => get().guestCartUuid,
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
    storage: createJSONStorage(() => sessionStorage),
  }),
)

export { useAuthStore }
