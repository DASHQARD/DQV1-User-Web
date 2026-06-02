import { describe, expect, it } from 'vitest'
import { interpretMomoResolveResponse } from '../momoResolve'

describe('interpretMomoResolveResponse', () => {
  it('treats empty account_name with is_resolved false as failure, not API success message', () => {
    const state = interpretMomoResolveResponse({
      status: 'success',
      statusCode: 200,
      message: 'Mobile money account name resolved successfully',
      data: {
        account_name: '',
        provider: 'mtn',
        is_resolved: false,
        is_platform_vendor: false,
      },
    })

    expect(state.vendorPhoneName).toBeNull()
    expect(state.vendorPhoneError).toContain('could not confirm')
    expect(state.vendorPhoneError).not.toContain('resolved successfully')
    expect(state.momoResolveWarning).toBeNull()
  })

  it('accepts resolved response with account name', () => {
    const state = interpretMomoResolveResponse({
      status: 'success',
      statusCode: 200,
      message: 'ok',
      data: {
        account_name: 'Jane Doe',
        is_resolved: true,
        is_platform_vendor: false,
      },
    })

    expect(state.vendorPhoneName).toBe('Jane Doe')
    expect(state.vendorPhoneError).toBeNull()
  })

  it('shows warning when name present but is_resolved is false', () => {
    const state = interpretMomoResolveResponse({
      status: 'success',
      statusCode: 200,
      message: 'ok',
      data: {
        account_name: 'Jane Doe',
        is_resolved: false,
        is_platform_vendor: false,
      },
    })

    expect(state.vendorPhoneName).toBe('Jane Doe')
    expect(state.momoResolveWarning).toBeTruthy()
    expect(state.vendorPhoneError).toBeNull()
  })
})
