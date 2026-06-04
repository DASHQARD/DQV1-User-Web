import { useMemo, useCallback, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '@/utils/apiError'
import {
  getCardBackground as getCardBg,
  getCardFileUrl,
  getCardTypeName as getCardTypeDisplayName,
  getCardDisplayName,
  formatCardDisplayTitle,
} from '@/utils/cardDisplay'
import {
  PUBLIC_CATALOG_CARDS_QUERY,
  PUBLIC_VENDORS_QUERY,
  PUBLIC_CATALOG_STALE_MS,
} from '../constants/publicCatalog'
import {
  getCardPriceBreakdown,
  getVendorNameById,
} from '../pages/cardDetails/cardDetailsUtils'
import {
  type CardDetailsCard,
  type CardDetailsDocument,
  type LightboxSlide,
  type RedemptionBranch,
  type UseCardDetailsReturn,
} from '../types/cardDetails'
import { useAuthStore, useGuestLocalCartStore } from '@/stores'
import { useCart } from './useCart'
import { useCartStore } from '@/stores/cart'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'
import { ensureGuestCartAndAddCard } from '@/features/website/services/cards'
import { assertGuestCartAmountWithinLimit } from '@/features/website/utils/validateGuestLocalCart'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import { pickGuestCartIdentityFields } from '@/utils/guestContact'
import { useToast } from '@/hooks'
import {
  CARD_EXPIRED_MESSAGE,
  isCatalogCardPurchasable,
  resolveCardDisplayStatus,
} from '@/utils/cardExpiry'

export type {
  CardDetailsCard,
  CardDetailsDocument,
  LightboxSlide,
  RedemptionBranch,
  UseCardDetailsReturn,
}

export function useCardDetails(): UseCardDetailsReturn {
  const { id } = useParams<{ id: string }>()
  const { usePublicCardsService, usePublicVendors } = usePublicCatalogQueries()
  const { data: cardsResponse, isLoading: isLoadingCards } = usePublicCardsService(
    PUBLIC_CATALOG_CARDS_QUERY,
    { staleTime: PUBLIC_CATALOG_STALE_MS },
  )
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendors(
    PUBLIC_VENDORS_QUERY,
    { staleTime: PUBLIC_CATALOG_STALE_MS },
  )
  const isLoading = isLoadingCards || isLoadingVendors
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const user = useAuthStore((s) => s.user)
  const getGuestCartId = useAuthStore((s) => s.getGuestCartId)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const setGuestCartId = useAuthStore((s) => s.setGuestCartId)
  const addLocalGuestCard = useGuestLocalCartStore((s) => s.addCatalogCard)
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
    return [
      {
        branch_name: formatCardDisplayTitle(c.branch_name),
        branch_location: c.branch_location?.trim() ?? '',
      },
    ]
  }, [card])

  const [selectedDocument, setSelectedDocument] = useState<CardDetailsDocument | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  useEffect(() => {
    setSelectedDocument(null)
    setSelectedImageIndex(0)
    setLightboxIndex(-1)
  }, [id])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(-1)
  }, [])

  const getCardBackground = useCallback(() => getCardBg(card?.type), [card?.type])
  const getCardTypeName = useCallback(() => getCardTypeDisplayName(card?.type), [card?.type])

  const isPurchasable = useMemo(
    () =>
      card
        ? isCatalogCardPurchasable({
            status: card.status,
            expiry_date: card.expiry_date,
          })
        : false,
    [card],
  )

  const displayStatus = useMemo(
    () => (card ? resolveCardDisplayStatus(card.status, card.expiry_date) : 'active'),
    [card],
  )

  const handleAddToCart = useCallback(async () => {
    if (!card) return
    if (!isPurchasable) {
      toast.error(CARD_EXPIRED_MESSAGE)
      return
    }
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
        try {
          assertGuestCartAmountWithinLimit(price)
          await ensureGuestCartAndAddCard({
            card_id: String(cardIdRaw),
            amount: price,
            ...pickGuestCartIdentityFields(guestName, guestEmail),
            getGuestCartId,
            getGuestCartUuid,
            setGuestCartId,
            setGuestCartUuid: useAuthStore.getState().setGuestCartUuid,
          })
          queryClient.invalidateQueries({ queryKey: ['cart-items'] })
          openCart()
        } catch (err: unknown) {
          toast.error(getApiErrorMessage(err, 'Failed to add to cart'))
        }
        return
      }
      try {
        addLocalGuestCard({
          card_id: String(cardIdRaw),
          product: pending.product,
          price: pending.price,
          currency: typeof pending.currency === 'string' ? pending.currency : 'GHS',
          type: pending.type,
        })
        openCart()
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, 'Failed to add to cart'))
      }
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
    addLocalGuestCard,
    addToCartAsync,
    openCart,
    queryClient,
    toast,
    isPurchasable,
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

  const displayProduct = useMemo(() => {
    if (!card) return ''
    return getCardDisplayName(card.product, card.card_name, {
      description: card.description,
      type: card.type,
    })
  }, [card])

  const vendorDisplayName = useMemo(() => {
    if (!card) return null
    const c = card as { vendor_name?: string; vendor_id?: string | number }
    if (c.vendor_name?.trim()) return formatCardDisplayTitle(c.vendor_name)
    const fromCatalog = getVendorNameById(vendorsResponse, c.vendor_id)
    return fromCatalog ? formatCardDisplayTitle(fromCatalog) : null
  }, [card, vendorsResponse])

  const priceBreakdown = useMemo(
    () => (card ? getCardPriceBreakdown(card) : null),
    [card],
  )

  const formattedExpiry = useMemo(() => {
    const c = card as { expiry_date?: string } | null
    if (!c?.expiry_date) return null
    return new Date(c.expiry_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [card])

  return {
    id,
    card,
    isLoading,
    redemptionBranches,
    selectedDocument,
    setSelectedDocument,
    selectedImageIndex,
    setSelectedImageIndex,
    lightboxIndex,
    openLightbox,
    closeLightbox,
    getCardBackground,
    getCardTypeName,
    handleAddToCart,
    isAdding,
    lightboxImages,
    displayPrice,
    displayProduct,
    vendorDisplayName,
    cardBackground,
    priceBreakdown,
    formattedExpiry,
    isPurchasable,
    displayStatus,
  }
}
