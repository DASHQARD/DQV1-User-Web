import { jwtDecode } from 'jwt-decode'
import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  token: string | null
  refreshToken: string | null
  user: Record<string, any> | null
  isAuthenticated: boolean
}

type Actions = {
  reset: () => void
  authenticate: (details: { token: string; refreshToken?: string | null }) => void
  getToken: () => State['token']
  getRefreshToken: () => State['refreshToken']
  setToken: (newToken: string) => void
  setRefreshToken: (newToken: string | null) => void
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
}

const authStore: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  authenticate: ({ token, refreshToken }) => {
    set({
      user: decodeUser(token),
      token,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
    })
  },
  logout: () => {
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  },
  getToken: () => get().token,
  getRefreshToken: () => get().refreshToken,
  setToken: (newToken: string) =>
    set({
      token: newToken,
      user: decodeUser(newToken),
    }),
  setRefreshToken: (newToken: string | null) => set({ refreshToken: newToken }),
})

const useAuthStore = create(
  persist(authStore, {
    name: 'dashqard-auth-store',
  }),
)

export { useAuthStore }
