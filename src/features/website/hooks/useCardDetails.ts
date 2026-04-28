import { useMemo, useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  getCardBackground as getCardBg,
  getCardTypeName as getCardTypeDisplayName,
} from '@/utils/cardDisplay'
import {
  type CardDetailsCard,
  type CardDetailsDocument,
  type LightboxSlide,
  type RedemptionBranch,
  type UseCardDetailsReturn,
} from '../types/cardDetails'
import { useAuthStore, useGuestAddToCartModalStore } from '@/stores'
import { useCart } from './useCart'
import { useCartStore } from '@/stores/cart'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'

export type {
  CardDetailsCard,
  CardDetailsDocument,
  LightboxSlide,
  RedemptionBranch,
  UseCardDetailsReturn,
}

export function useCardDetails(): UseCardDetailsReturn {
  const { id } = useParams<{ id: string }>()
  const { usePublicCardsService } = usePublicCatalogQueries()
  const { data: cardsResponse, isLoading } = usePublicCardsService()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openGuestAddToCartModal = useGuestAddToCartModalStore((s) => s.open)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()

  /** Normalize API id/file_name to a valid record key (string | number). */
  const toRecordKey = (x: unknown, fallback: number): string | number =>
    typeof x === 'string' || typeof x === 'number' ? x : fallback

  const card = useMemo(() => {
    if (!cardsResponse || !id) return null
    const cards = Array.isArray(cardsResponse)
      ? cardsResponse
      : ((cardsResponse as { data?: unknown[] })?.data ?? [])
    const list = Array.isArray(cards) ? cards : []
    const found = list.find((c: unknown) => {
      const item = c as { card_id?: unknown; id?: unknown }
      return String(item.card_id ?? item.id) === id
    })
    return (found ?? null) as CardDetailsCard | null
  }, [cardsResponse, id])

  /** Redemption locations from the card (cards-info includes branch_name + branch_location per card). */
  const redemptionBranches = useMemo((): RedemptionBranch[] => {
    if (!card) return []
    const c = card as { branch_name?: string; branch_location?: string }
    if (!c.branch_name) return []
    return [{ branch_name: c.branch_name, branch_location: c.branch_location ?? '' }]
  }, [card])

  const [selectedDocument, setSelectedDocument] = useState<CardDetailsDocument | null>(null)
  const [imageIndex, setImageIndex] = useState(-1)

  const termsUrls = useMemo((): Record<string | number, string> => {
    const cardAny = card as {
      terms_and_conditions?: { id?: unknown; file_name?: string; file_url?: string }[]
    } | null
    if (!cardAny?.terms_and_conditions?.length) return {}
    const urlMap: Record<string | number, string> = {}
    cardAny.terms_and_conditions.forEach((term, index) => {
      if (term.file_url) urlMap[toRecordKey(term.id ?? term.file_name, index)] = term.file_url
    })
    return urlMap
  }, [card])

  const getCardBackground = useCallback(() => getCardBg(card?.type), [card?.type])
  const getCardTypeName = useCallback(() => getCardTypeDisplayName(card?.type), [card?.type])

  const handleAddToCart = useCallback(async () => {
    if (!card) return
    const cardId = (card as { card_id?: unknown }).card_id ?? (card as { id?: unknown }).id
    const cardIdNum = typeof cardId === 'number' ? cardId : Number(cardId)
    const price = parseFloat(String((card as { price?: unknown }).price)) || 0
    if (!isAuthenticated) {
      openGuestAddToCartModal({
        card_id: Number.isFinite(cardIdNum) ? cardIdNum : 0,
        product: (card as { product?: string }).product ?? '',
        price,
        type: (card as { type?: string }).type,
        currency: (card as { currency?: string }).currency,
      })
      return
    }
    if (!id) return
    await addToCartAsync({
      card_id: cardId,
      quantity: 1,
    } as Parameters<typeof addToCartAsync>[0])
    openCart()
  }, [card, id, isAuthenticated, openGuestAddToCartModal, addToCartAsync, openCart])

  const lightboxImages = useMemo((): LightboxSlide[] => {
    const c = card as {
      images?: { file_url?: string }[]
      product?: string
    } | null
    if (!c?.images) return []
    return c.images.map((img, index) => ({
      src: img.file_url ?? '',
      alt: `${c.product} image ${index + 1}`,
    }))
  }, [card])

  const displayPrice = card ? parseFloat(String((card as { price?: unknown }).price)) || 0 : 0
  const cardBackground = getCardBg(card?.type)

  return {
    id,
    card,
    isLoading,
    redemptionBranches,
    termsUrls,
    selectedDocument,
    setSelectedDocument,
    imageIndex,
    setImageIndex,
    getCardBackground,
    getCardTypeName,
    handleAddToCart,
    isAdding,
    lightboxImages,
    displayPrice,
    cardBackground,
  }
}
