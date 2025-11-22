import { jwtDecode } from 'jwt-decode'
import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  token: string | null
  user: Record<string, any> | null
  isAuthenticated: boolean
}

type Actions = {
  reset: () => void
  authenticate: (details: { token: string; loginUrl?: string }) => void
  getToken: () => State['token']
  setToken: (newToken: string) => void
  logout: () => void
}

const initialState: State = {
  token: null,
  isAuthenticated: false,
  user: null,
}

const authStore: StateCreator<State & Actions> = (set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  authenticate: ({ token }) => {
    const user = jwtDecode(token)
    set({
      user,
      token,
      isAuthenticated: true,
    })
  },
  logout: () => set({ isAuthenticated: false }),
  getToken: () => get().token,
  setToken: (newToken: string) => set({ token: newToken }),
})

const useAuthStore = create(
  persist(authStore, {
    name: 'afri-transfer-auth-store',
  }),
)

export { useAuthStore }
