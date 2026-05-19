import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  extractCheckoutRedirectUrl,
  redirectToCheckoutPaymentPage,
  extractMomoCheckoutPromptData,
  processCheckoutResponse,
} from '../checkoutRedirect'

describe('checkoutRedirect', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { replace: vi.fn() })
    vi.stubGlobal('open', vi.fn())
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

  it('extracts Paystack authorization_url', () => {
    expect(
      extractCheckoutRedirectUrl({
        data: { authorization_url: 'https://checkout.paystack.com/abc' },
      }),
    ).toBe('https://checkout.paystack.com/abc')
  })

  it('redirects in the same tab via location.replace', () => {
    const result = redirectToCheckoutPaymentPage({
      data: { redirect_url: 'https://pay.example.com/checkout' },
    })

    expect(result).toBe(true)
    expect(window.location.replace).toHaveBeenCalledWith('https://pay.example.com/checkout')
  })

  it('does not redirect for Kowri momo prompt responses', () => {
    const result = redirectToCheckoutPaymentPage({
      data: { payment_gateway: 'kowri', receipt_number: 'R-1' },
    })

    expect(result).toBe(false)
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('extracts Kowri momo prompt data', () => {
    const data = extractMomoCheckoutPromptData({
      data: { payment_gateway: 'kowri', receipt_number: 'R-1', message: 'Approve on phone' },
    })
    expect(data?.receipt_number).toBe('R-1')
  })

  it('processCheckoutResponse returns momo_prompt for Eganow momo', () => {
    const followUp = processCheckoutResponse({
      data: {
        transactionStatus: 'PENDING',
        eganowReferenceNo: 'EG-1',
        receipt_number: 'R-2',
        payment_gateway: 'egnanow',
      },
    })
    expect(followUp.type).toBe('momo_prompt')
  })
})
