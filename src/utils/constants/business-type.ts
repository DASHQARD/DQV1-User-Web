import type { DropdownOption } from '@/types'

export const BUSINESS_TYPE_OPTIONS = [
  {
    value: 'llc' as const,
    title: 'Limited Liability Company',
    description:
      "A flexible structure that protects owners' personal assets from business liabilities.",
  },
  {
    value: 'sole_proprietor' as const,
    title: 'Sole Proprietorship',
    description: 'A business owned and run by one person with no legal distinction from the owner.',
  },
  {
    value: 'partnership' as const,
    title: 'Partnership',
    description: 'Two or more parties agree to share ownership, profits, and liability.',
  },
] as const

export const BUSINESS_INDUSTRY_OPTIONS: DropdownOption[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
]
