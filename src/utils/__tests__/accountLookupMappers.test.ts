import { describe, expect, it } from 'vitest'
import {
  fromLookupApiProvider,
  interpretBankAccountLookupResponse,
  interpretMobileMoneyLookupResponse,
  isValidBankAccountNumberForLookup,
  normalizeMobileMoneyProviderOptions,
  toLookupApiProvider,
} from '../accountLookupMappers'

describe('accountLookupMappers', () => {
  it('maps UI airteltigo to API airtel-tigo', () => {
    expect(toLookupApiProvider('airteltigo')).toBe('airtel-tigo')
    expect(fromLookupApiProvider('airtel-tigo')).toBe('airteltigo')
  })

  it('interprets successful mobile money lookup envelope from staging API', () => {
    const result = interpretMobileMoneyLookupResponse({
      status: 'success',
      statusCode: 200,
      message: 'Phone number resolved successfully',
      data: {
        phone_number: '0559617908',
        account_name: 'ABEEKU DJOKOTO',
        provider: 'mtn',
        bank_code: 'MTN',
      },
    })
    expect(result.accountName).toBe('ABEEKU DJOKOTO')
    expect(result.phoneNumber).toBe('0559617908')
    expect(result.provider).toBe('mtn')
    expect(result.bankCode).toBe('MTN')
    expect(result.error).toBeNull()
  })

  it('interprets flat inner data payload when envelope was already unwrapped', () => {
    const result = interpretMobileMoneyLookupResponse({
      phone_number: '0559617908',
      account_name: 'ABEEKU DJOKOTO',
      provider: 'mtn',
      bank_code: 'MTN',
    })
    expect(result.accountName).toBe('ABEEKU DJOKOTO')
  })

  it('interprets failed bank lookup', () => {
    const result = interpretBankAccountLookupResponse({
      status: 'error',
      statusCode: 400,
      message: 'Bank account could not be verified. Please check the details and try again.',
    })
    expect(result.accountName).toBeNull()
    expect(result.error).toContain('could not be verified')
  })

  it('validates bank account digits length', () => {
    expect(isValidBankAccountNumberForLookup('1234567')).toBe(false)
    expect(isValidBankAccountNumberForLookup('12345678')).toBe(true)
  })

  it('falls back to static providers when API payload empty', () => {
    expect(normalizeMobileMoneyProviderOptions(undefined).length).toBeGreaterThan(0)
  })
})
