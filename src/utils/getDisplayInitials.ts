/** First letter of first name + first letter of last name (e.g. "Jane Doe" → "JD"). */
export function getDisplayInitials(fullName?: string | null): string {
  if (!fullName?.trim()) return ''

  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}
