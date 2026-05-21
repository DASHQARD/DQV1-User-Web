import { describe, expect, it } from 'vitest'
import { ContactPageFormSchema, ContactUsSchema } from '../contact'
import { EXAMPLE_PHONE_E164 } from '@/utils/constants'

describe('ContactPageFormSchema', () => {
  it('accepts valid contact page payload without phone', () => {
    const result = ContactPageFormSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      inquiryType: 'bug-report',
      subject: 'Login issue',
      message: 'Details here',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional valid phone', () => {
    const result = ContactPageFormSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: EXAMPLE_PHONE_E164,
      inquiryType: 'feature-request',
      subject: 'New feature',
      message: 'Details',
    })
    expect(result.success).toBe(true)
  })

  it('allows dial-code-only phone (optional field left at country default)', () => {
    const result = ContactPageFormSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+233',
      inquiryType: 'bug-report',
      subject: 'Login',
      message: 'Hi',
    })
    expect(result.success).toBe(true)
  })

  it('rejects partial phone numbers', () => {
    const result = ContactPageFormSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+2335596178',
      inquiryType: 'bug-report',
      subject: 'Login',
      message: 'Hi',
    })
    expect(result.success).toBe(false)
  })

  it('ContactUsSchema remains the minimal ticket shape', () => {
    expect(
      ContactUsSchema.safeParse({
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Help',
        message: 'Hi',
      }).success,
    ).toBe(true)
  })
})
