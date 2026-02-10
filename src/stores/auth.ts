import { jwtDecode } from 'jwt-decode'
import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  token: string | null
  refreshToken: string | null
  user: Record<string, any> | null
  isAuthenticated: boolean
  /** True when authenticated via guest OTP; use guest-auth/token/refresh for refresh */
  isGuestAuth: boolean
  /** Guest cart id after first add; used for subsequent guest-carts/add-card calls */
  guestCartId: number | null
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
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isGuestAuth: false,
      guestCartId: null,
    })
  },
  getToken: () => get().token,
  getRefreshToken: () => get().refreshToken,
  setGuestCartId: (cartId) => set({ guestCartId: cartId }),
  getGuestCartId: () => get().guestCartId,
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
  }),
)

export { useAuthStore }
