import { describe, expect, it } from 'vitest'

import { AssignRecipientSchema } from '../cards'

describe('AssignRecipientSchema', () => {
  it('requires phone when assigning to someone else', () => {
    const result = AssignRecipientSchema.safeParse({
      assign_to_self: false,
      first_name: 'Abeeku',
      last_name: 'Djokoto',
      phone: '',
      email: '',
      amount: 1000,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('phone'))).toBe(true)
    }
  })

  it('accepts valid recipient details when not assigning to self', () => {
    const result = AssignRecipientSchema.safeParse({
      assign_to_self: false,
      first_name: 'Abeeku',
      last_name: 'Djokoto',
      phone: '+233559617908',
      email: '',
      amount: 1000,
    })

    expect(result.success).toBe(true)
  })

  it('does not require phone when assigning to self', () => {
    const result = AssignRecipientSchema.safeParse({
      assign_to_self: true,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      amount: 1000,
    })

    expect(result.success).toBe(true)
  })
})
