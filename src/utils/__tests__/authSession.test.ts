import { describe, expect, it } from 'vitest'

import {
  extractTokensFromPayload,
  isAccessTokenExpired,
  isInvalidTokenTypeMessage,
} from '@/utils/authSession'

describe('authSession', () => {
  it('extractTokensFromPayload reads nested access_token', () => {
    expect(
      extractTokensFromPayload({
        status: 'success',
        data: {
          access_token: 'access-abc',
          expires_in: 1800,
        },
      }),
    ).toEqual({ accessToken: 'access-abc', refreshToken: undefined })
  })

  it('isInvalidTokenTypeMessage matches backend copy', () => {
    expect(isInvalidTokenTypeMessage('Invalid token type')).toBe(true)
    expect(isInvalidTokenTypeMessage('Token expired')).toBe(false)
  })

  it('isAccessTokenExpired treats malformed tokens as expired', () => {
    expect(isAccessTokenExpired('not-a-jwt')).toBe(true)
  })
})
