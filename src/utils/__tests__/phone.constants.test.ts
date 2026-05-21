import { describe, expect, it } from 'vitest'
import {
  PURCHASE_WHATSAPP_DISPLAY,
  PURCHASE_WHATSAPP_E164,
  PURCHASE_WHATSAPP_HI_PROMPT,
  PURCHASE_WHATSAPP_WA_ME,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_E164,
  SUPPORT_PHONE_TEL_HREF,
} from '../constants/phone'

describe('contact phone constants', () => {
  it('support line tel href matches E.164', () => {
    expect(SUPPORT_PHONE_TEL_HREF).toBe(`tel:${SUPPORT_PHONE_E164}`)
  })

  it('uses one canonical support display format', () => {
    expect(SUPPORT_PHONE_DISPLAY).toBe('+233 54 202 2245')
  })

  it('WhatsApp hi prompt uses the purchase line display number', () => {
    expect(PURCHASE_WHATSAPP_HI_PROMPT).toContain(PURCHASE_WHATSAPP_DISPLAY)
    expect(PURCHASE_WHATSAPP_HI_PROMPT).not.toContain('25 608')
  })

  it('purchase WhatsApp wa.me id matches E.164 without plus', () => {
    expect(PURCHASE_WHATSAPP_WA_ME).toBe(PURCHASE_WHATSAPP_E164.replace('+', ''))
  })
})
