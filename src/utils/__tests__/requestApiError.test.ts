import { describe, it, expect } from 'vitest'
import { getRequestApiErrorMessage } from '../requestApiError'

describe('getRequestApiErrorMessage', () => {
  it('prefers API response message', () => {
    expect(
      getRequestApiErrorMessage({
        message: 'Generic',
        response: { data: { message: "You are not authorized to manage this vendor's requests" } },
      }),
    ).toBe("You are not authorized to manage this vendor's requests")
  })

  it('falls back to error message then default', () => {
    expect(getRequestApiErrorMessage({ message: 'Network error' })).toBe('Network error')
    expect(getRequestApiErrorMessage(null)).toBe('Failed to update request status. Please try again.')
  })
})
