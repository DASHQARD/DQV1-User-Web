import type { DropdownOption } from '@/types'

export const CONTACT_SUBJECT_OPTIONS: DropdownOption[] = [
  { label: 'Website inquiry', value: 'website-inquiry' },
  { label: 'General support', value: 'general-support' },
  { label: 'Bulk / corporate gifting', value: 'bulk-corporate-gifting' },
  { label: 'Gift card purchase help', value: 'gift-card-purchase' },
  { label: 'Redemption support', value: 'redemption-support' },
  { label: 'Vendor partnership', value: 'vendor-partnership' },
  { label: 'Account & billing', value: 'account-billing' },
  { label: 'Other', value: 'other' },
]

export const DEFAULT_CONTACT_SUBJECT = 'website-inquiry'

export const CONTACT_SUBJECT_VALUES = CONTACT_SUBJECT_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
]

export function getContactSubjectLabel(value: string): string {
  return CONTACT_SUBJECT_OPTIONS.find((option) => option.value === value)?.label ?? value
}
