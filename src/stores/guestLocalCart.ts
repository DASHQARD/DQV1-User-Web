import { create } from 'zustand'

export type GuestContactDraft = {
  phone?: string
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
}

/** @deprecated Guest bag lines are server-backed; local line ids are no longer created. */
export function isLocalGuestCartLineId(id: string | number | null | undefined): boolean {
  if (id == null || id === '') return false
  return String(id).startsWith('local-')
}

type State = {
  contact: GuestContactDraft
}

type Actions = {
  setContact: (contact: Partial<GuestContactDraft>) => void
  clearContact: () => void
  clear: () => void
}

const useGuestLocalCartStore = create<State & Actions>()((set, get) => ({
  contact: {},
  setContact: (contact) => {
    set({ contact: { ...get().contact, ...contact } })
  },
  clearContact: () => set({ contact: {} }),
  clear: () => set({ contact: {} }),
}))

export { useGuestLocalCartStore }
