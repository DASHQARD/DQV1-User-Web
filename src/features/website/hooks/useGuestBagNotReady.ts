/** Guest custom cards (DashPro / DashGo) are added to the server cart immediately — no local bag sync. */
export function useGuestBagNotReady(): boolean {
  return false
}
