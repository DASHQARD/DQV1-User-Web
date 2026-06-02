import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { formatPersonName } from '@/utils/personName'
import { setGuestBrowsingAck } from '@/features/website/utils/guestBrowsingSession'
import { assertGuestCartAmountWithinLimit } from '@/features/website/utils/validateGuestLocalCart'

export type LocalRecipientDraft = {
  draftId: string
  quantity_index: number
  assign_to_self: boolean
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  message: string
  amount: number
}

export type LocalCartLineKind = 'catalog' | 'dashpro' | 'dashgo'

export type LocalGuestCartLine = {
  lineId: string
  /** Defaults to `catalog` for legacy persisted rows. */
  lineKind?: LocalCartLineKind
  card_id: string
  product: string
  price: number
  currency: string
  type?: string
  quantity: number
  recipientDrafts: LocalRecipientDraft[]
  /** DashGo: vendor + branches (set when lineKind is dashgo). */
  vendor_id?: string
  redemption_branches?: Array<{ branch_id: string }>
  description?: string
  country_code?: string
}

export function isCatalogLocalLine(line: LocalGuestCartLine): boolean {
  return !line.lineKind || line.lineKind === 'catalog'
}

export type GuestContactDraft = {
  phone?: string
  first_name?: string
  last_name?: string
  email?: string
}

function newLineId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** True for client-only bag line ids — must not be sent to guest-carts APIs. */
export function isLocalGuestCartLineId(id: string | number | null | undefined): boolean {
  if (id == null || id === '') return false
  return String(id).startsWith('local-')
}

function newDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function pruneRecipientDrafts(line: LocalGuestCartLine): LocalRecipientDraft[] {
  return line.recipientDrafts.filter((d) => d.quantity_index < line.quantity)
}

type State = {
  lines: LocalGuestCartLine[]
  contact: GuestContactDraft
  /** Set when checkout bag sync fails after OTP; cleared on success or cart clear. */
  lastSyncError: string | null
}

type Actions = {
  addCatalogCard: (item: {
    card_id: string
    product: string
    price: number
    currency?: string
    type?: string
  }) => void
  addCustomDashProLine: (item: {
    amount: number
    currency?: string
    assign_to_self: boolean
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
    message: string
    country_code?: string
  }) => void
  addCustomDashGoLine: (item: {
    vendor_id: string
    product: string
    description: string
    amount: number
    currency?: string
    redemption_branches: Array<{ branch_id: string }>
    assign_to_self: boolean
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
    message: string
  }) => void
  removeLine: (lineId: string) => void
  updateLineQuantity: (lineId: string, quantity: number) => void
  upsertRecipientDraft: (lineId: string, draft: Omit<LocalRecipientDraft, 'draftId'> & { draftId?: string }) => void
  removeRecipientDraft: (lineId: string, draftId: string) => void
  setContact: (contact: Partial<GuestContactDraft>) => void
  setLastSyncError: (error: string | null) => void
  clear: () => void
  hasItems: () => boolean
  getTotalItems: () => number
  getSubtotal: () => number
  lineHasAllRecipients: (lineId: string) => boolean
  allLinesHaveRecipients: () => boolean
}

const useGuestLocalCartStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      lines: [],
      contact: {},
      lastSyncError: null,
      addCatalogCard: ({ card_id, product, price, currency = 'GHS', type }) => {
        assertGuestCartAmountWithinLimit(price)
        setGuestBrowsingAck()
        const existing = get().lines.find(
          (l) => isCatalogLocalLine(l) && l.card_id === card_id && l.type === type,
        )
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.lineId === existing.lineId
                ? {
                    ...l,
                    quantity: l.quantity + 1,
                    recipientDrafts: pruneRecipientDrafts({ ...l, quantity: l.quantity + 1 }),
                  }
                : l,
            ),
          })
          return
        }
        set({
          lines: [
            ...get().lines,
            {
              lineId: newLineId(),
              lineKind: 'catalog',
              card_id,
              product,
              price,
              currency,
              type,
              quantity: 1,
              recipientDrafts: [],
            },
          ],
        })
      },
      addCustomDashProLine: ({
        amount,
        currency = 'GHS',
        assign_to_self,
        first_name,
        last_name,
        phone,
        email,
        message,
        country_code = 'GH',
      }) => {
        assertGuestCartAmountWithinLimit(amount)
        setGuestBrowsingAck()
        const lineId = newLineId()
        const draft: LocalRecipientDraft = {
          draftId: newDraftId(),
          quantity_index: 0,
          assign_to_self,
          first_name,
          last_name,
          phone,
          email,
          message,
          amount,
        }
        set({
          lines: [
            ...get().lines,
            {
              lineId,
              lineKind: 'dashpro',
              card_id: `pending-${lineId}`,
              product: 'DashPro',
              price: amount,
              currency,
              type: 'dashpro',
              quantity: 1,
              recipientDrafts: [draft],
              country_code,
            },
          ],
        })
      },
      addCustomDashGoLine: ({
        vendor_id,
        product,
        description,
        amount,
        currency = 'GHS',
        redemption_branches,
        assign_to_self,
        first_name,
        last_name,
        phone,
        email,
        message,
      }) => {
        assertGuestCartAmountWithinLimit(amount)
        setGuestBrowsingAck()
        const lineId = newLineId()
        const draft: LocalRecipientDraft = {
          draftId: newDraftId(),
          quantity_index: 0,
          assign_to_self,
          first_name,
          last_name,
          phone,
          email,
          message,
          amount,
        }
        set({
          lines: [
            ...get().lines,
            {
              lineId,
              lineKind: 'dashgo',
              card_id: `pending-${lineId}`,
              product,
              description,
              price: amount,
              currency,
              type: 'dashgo',
              quantity: 1,
              vendor_id,
              redemption_branches,
              recipientDrafts: [draft],
            },
          ],
        })
      },
      removeLine: (lineId) => {
        set({ lines: get().lines.filter((l) => l.lineId !== lineId) })
      },
      updateLineQuantity: (lineId, quantity) => {
        if (quantity < 1) {
          get().removeLine(lineId)
          return
        }
        set({
          lines: get().lines.map((l) => {
            if (l.lineId !== lineId) return l
            const next = { ...l, quantity }
            return { ...next, recipientDrafts: pruneRecipientDrafts(next) }
          }),
        })
      },
      upsertRecipientDraft: (lineId, draft) => {
        const draftId = draft.draftId ?? newDraftId()
        set({
          lines: get().lines.map((l) => {
            if (l.lineId !== lineId) return l
            const without = l.recipientDrafts.filter(
              (d) => d.draftId !== draftId && d.quantity_index !== draft.quantity_index,
            )
            return {
              ...l,
              recipientDrafts: [...without, { ...draft, draftId }],
            }
          }),
        })
      },
      removeRecipientDraft: (lineId, draftId) => {
        set({
          lines: get().lines.map((l) =>
            l.lineId === lineId
              ? { ...l, recipientDrafts: l.recipientDrafts.filter((d) => d.draftId !== draftId) }
              : l,
          ),
        })
      },
      setContact: (contact) => {
        set({ contact: { ...get().contact, ...contact } })
      },
      setLastSyncError: (error) => set({ lastSyncError: error }),
      clear: () => set({ lines: [], contact: {}, lastSyncError: null }),
      hasItems: () => get().lines.length > 0,
      getTotalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      getSubtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      lineHasAllRecipients: (lineId) => {
        const line = get().lines.find((l) => l.lineId === lineId)
        if (!line) return false
        for (let i = 0; i < line.quantity; i++) {
          const draft = line.recipientDrafts.find((d) => d.quantity_index === i)
          if (!draft?.message?.trim()) return false
          if (!draft.assign_to_self) {
            const name = formatPersonName(draft.first_name ?? '', draft.last_name ?? '')
            if (!name) return false
          }
        }
        return true
      },
      allLinesHaveRecipients: () => {
        const { lines } = get()
        if (lines.length === 0) return false
        return lines.every((l) => get().lineHasAllRecipients(l.lineId))
      },
    }),
    {
      name: 'dashqard-guest-local-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export { useGuestLocalCartStore }
