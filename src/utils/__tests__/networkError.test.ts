import { describe, expect, it } from 'vitest'
import {
  isNetworkError,
  NETWORK_ISSUE_MESSAGE,
  resolveRequestErrorMessage,
} from '../networkError'

describe('networkError', () => {
  it('detects axios-style network errors', () => {
    expect(isNetworkError({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe(true)
    expect(isNetworkError({ message: 'Failed to fetch' })).toBe(true)
  })

  it('does not treat API validation errors as network issues', () => {
    expect(isNetworkError({ status: 422, message: 'Invalid amount' })).toBe(false)
  })

  it('returns a friendly network message', () => {
    expect(
      resolveRequestErrorMessage({ code: 'ERR_NETWORK' }, 'Something went wrong'),
    ).toBe(NETWORK_ISSUE_MESSAGE)
    expect(resolveRequestErrorMessage({ status: 400, message: 'Bad request' }, 'Fallback')).toBe(
      'Bad request',
    )
    expect(resolveRequestErrorMessage(null, 'Fallback')).toBe('Fallback')
  })
})
