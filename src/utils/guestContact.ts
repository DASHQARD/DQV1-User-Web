/** Fields sent to guest cart / card APIs when provided (backend treats both as optional). */
export function pickGuestCartIdentityFields(
  guestName?: string | null,
  guestEmail?: string | null,
): { guest_name?: string; guest_email?: string } {
  const payload: { guest_name?: string; guest_email?: string } = {}
  const name = guestName?.trim()
  const email = guestEmail?.trim()
  if (name) payload.guest_name = name
  if (email) payload.guest_email = email
  return payload
}
