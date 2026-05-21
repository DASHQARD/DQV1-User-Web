import { useMemo, useCallback, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import {
  getCardBackground as getCardBg,
  getCardFileUrl,
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
import { ensureGuestCartAndAddCard } from '@/features/website/services/cards'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import { useToast } from '@/hooks'

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
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const user = useAuthStore((s) => s.user)
  const getGuestCartId = useAuthStore((s) => s.getGuestCartId)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const setGuestCartId = useAuthStore((s) => s.setGuestCartId)
  const openGuestAddToCartModal = useGuestAddToCartModalStore((s) => s.open)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()
  const queryClient = useQueryClient()
  const toast = useToast()

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

  useEffect(() => {
    setSelectedDocument(null)
    setImageIndex(-1)
  }, [id])

  const getCardBackground = useCallback(() => getCardBg(card?.type), [card?.type])
  const getCardTypeName = useCallback(() => getCardTypeDisplayName(card?.type), [card?.type])

  const handleAddToCart = useCallback(async () => {
    if (!card) return
    const cardIdRaw = (card as { card_id?: unknown }).card_id ?? (card as { id?: unknown }).id
    const price = parseFloat(String((card as { price?: unknown }).price)) || 0
    const pending = {
      card_id: String(cardIdRaw),
      product: (card as { product?: string }).product ?? '',
      price,
      type: (card as { type?: string }).type,
      currency: (card as { currency?: string }).currency,
    }

    if (!isAuthenticated || isGuestAuth) {
      if (cardIdRaw == null || String(cardIdRaw).trim() === '') return
      if (isGuestAuth) {
        const guestName =
          getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY) ||
          (user as { guest_name?: string } | null)?.guest_name ||
          ''
        const guestEmail =
          getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY) ||
          (user as { guest_email?: string } | null)?.guest_email ||
          ''
        if (!guestName.trim() || !guestEmail.trim()) {
          openGuestAddToCartModal(pending)
          return
        }
        try {
          await ensureGuestCartAndAddCard({
            card_id: String(cardIdRaw),
            guest_name: guestName.trim(),
            guest_email: guestEmail.trim(),
            getGuestCartId,
            getGuestCartUuid,
            setGuestCartId,
            setGuestCartUuid: useAuthStore.getState().setGuestCartUuid,
          })
          queryClient.invalidateQueries({ queryKey: ['cart-items'] })
          openCart()
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to add to cart'
          toast.error(message)
        }
        return
      }
      openGuestAddToCartModal(pending)
      return
    }
    if (!id) return
    await addToCartAsync({
      card_id: cardIdRaw,
      quantity: 1,
    } as Parameters<typeof addToCartAsync>[0])
    openCart()
  }, [
    card,
    id,
    isAuthenticated,
    isGuestAuth,
    user,
    getGuestCartId,
    setGuestCartId,
    openGuestAddToCartModal,
    addToCartAsync,
    openCart,
    queryClient,
    toast,
  ])

  const lightboxImages = useMemo((): LightboxSlide[] => {
    const c = card as {
      images?: { file_url?: string }[]
      product?: string
    } | null
    if (!c?.images) return []
    return c.images.map((img, index) => ({
      src: getCardFileUrl(img.file_url) || '',
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
