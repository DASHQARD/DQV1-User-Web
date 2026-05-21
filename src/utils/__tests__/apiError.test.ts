import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isGuestAmountThresholdMessage } from '../apiError'

describe('getApiErrorMessage', () => {
  it('reads message from axios interceptor thrown object', () => {
    expect(
      getApiErrorMessage({
        status: 400,
        message: 'Amount exceeds guest transaction threshold. Maximum allowed: 1000.00',
      }),
    ).toBe('Amount exceeds guest transaction threshold. Maximum allowed: 1000.00')
  })

  it('reads message from axios response envelope', () => {
    expect(
      getApiErrorMessage({
        response: {
          data: {
            status: 'error',
            statusCode: 400,
            message: 'Amount exceeds guest transaction threshold. Maximum allowed: 1000.00',
          },
        },
      }),
    ).toBe('Amount exceeds guest transaction threshold. Maximum allowed: 1000.00')
  })

  it('reads message from Error instances', () => {
    expect(getApiErrorMessage(new Error('Network failed'))).toBe('Network failed')
  })

  it('returns fallback for unknown shapes', () => {
    expect(getApiErrorMessage({}, 'Failed')).toBe('Failed')
  })
})

describe('isGuestAmountThresholdMessage', () => {
  it('detects guest threshold API copy', () => {
    expect(
      isGuestAmountThresholdMessage(
        'Amount exceeds guest transaction threshold. Maximum allowed: 1000.00',
      ),
    ).toBe(true)
  })
})
