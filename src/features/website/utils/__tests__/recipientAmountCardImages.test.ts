import { describe, expect, it } from 'vitest'
import {
  resolveRecipientAmountCardImageUrl,
  resolveRecipientAmountPreviewImageUrl,
} from '../recipientAmountCardImages'

describe('resolveRecipientAmountCardImageUrl', () => {
  it('prefers member card_images', () => {
    expect(
      resolveRecipientAmountCardImageUrl({
        card_images: [{ file_url: 'https://cdn.example/front.png' }],
        images: [{ file_url: 'https://cdn.example/guest.png' }],
      }),
    ).toContain('front.png')
  })

  it('falls back to guest images', () => {
    expect(
      resolveRecipientAmountCardImageUrl({
        images: [{ file_url: 'https://cdn.example/guest.png' }],
      }),
    ).toContain('guest.png')
  })

  it('returns undefined when no images', () => {
    expect(resolveRecipientAmountCardImageUrl({ card_images: [], images: [] })).toBeUndefined()
  })

  it('resolveRecipientAmountPreviewImageUrl reads first card from balance payload', () => {
    expect(
      resolveRecipientAmountPreviewImageUrl({
        data: {
          balance: 100,
          cards: [{ card_images: [{ file_url: 'https://cdn.example/card.png' }] }],
        },
      }),
    ).toContain('cdn.example/card.png')
  })
})
