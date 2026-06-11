import type { LocalGuestCartLine } from '@/features/website/utils/guestLocalCartTypes'

/** @deprecated Guest DashPro / DashGo use session auth via POST /guest-cards/*. */
export function localCartHasCustomGuestCards(lines: LocalGuestCartLine[]): boolean {
  return lines.some((line) => line.lineKind === 'dashpro' || line.lineKind === 'dashgo')
}
