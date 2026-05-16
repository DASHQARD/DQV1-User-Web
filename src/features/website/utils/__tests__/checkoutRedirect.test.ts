import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractCheckoutRedirectUrl, redirectToCheckoutPaymentPage } from '../checkoutRedirect'

describe('checkoutRedirect', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { replace: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('extracts redirect_url from standard checkout response', () => {
    expect(
      extractCheckoutRedirectUrl({
        status: 'success',
        data: {
          redirect_url: 'https://sandbox.expresspaygh.com/api/checkout.php?token=abc',
        },
      }),
    ).toBe('https://sandbox.expresspaygh.com/api/checkout.php?token=abc')
  })

  it('redirects in the same tab via location.replace', () => {
    const result = redirectToCheckoutPaymentPage({
      data: { redirect_url: 'https://pay.example.com/checkout' },
    })

    expect(result).toBe(true)
    expect(window.location.replace).toHaveBeenCalledWith('https://pay.example.com/checkout')
  })

  it('does not redirect for Kowri prompt responses', () => {
    const result = redirectToCheckoutPaymentPage({
      data: { payment_gateway: 'kowri', redirect_url: 'https://pay.example.com' },
    })

    expect(result).toBe(false)
    expect(window.location.replace).not.toHaveBeenCalled()
  })
})
