/** Split a full name into first and last (remaining words go to last name). */
export function splitPersonName(fullName: string): { first_name: string; last_name: string } {
  const trimmed = fullName.trim()
  if (!trimmed) return { first_name: '', last_name: '' }
  const [firstName, ...rest] = trimmed.split(/\s+/)
  return { first_name: firstName ?? '', last_name: rest.join(' ') }
}

/** Combine first and last name for APIs that expect a single full name. */
export function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}
