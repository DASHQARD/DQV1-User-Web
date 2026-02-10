import { useMemo, useCallback, useState, useEffect } from 'react'
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
import { usePresignedURL } from '@/hooks'
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
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

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

  const [imageUrls, setImageUrls] = useState<Record<number | string, string>>({})
  const [termsUrls, setTermsUrls] = useState<Record<number | string, string>>({})
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isLoadingTerms, setIsLoadingTerms] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<CardDetailsDocument | null>(null)
  const [imageIndex, setImageIndex] = useState(-1)

  useEffect(() => {
    if (!card) {
      setImageUrls({})
      setTermsUrls({})
      setIsLoadingImages(false)
      setIsLoadingTerms(false)
      return
    }
    let cancelled = false
    const cardAny = card as {
      images?: { id?: unknown; file_name?: string; file_url?: string }[]
      terms_and_conditions?: { id?: unknown; file_name?: string; file_url?: string }[]
    }

    if (cardAny.images?.length) {
      setIsLoadingImages(true)
      const fetchImageUrls = async () => {
        try {
          const results = await Promise.all(
            cardAny.images!.map(async (image, index) => {
              try {
                const response = await fetchPresignedURL(image.file_url!)
                const url =
                  typeof response === 'string'
                    ? response
                    : ((response as { url?: string })?.url ?? (response as string))
                return { key: toRecordKey(image.id ?? image.file_name, index), url: url ?? null }
              } catch {
                return { key: toRecordKey(image.id ?? image.file_name, index), url: null }
              }
            }),
          )
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((r) => {
              if (r.url) urlMap[r.key] = r.url
            })
            setImageUrls(urlMap)
            setIsLoadingImages(false)
          }
        } catch {
          if (!cancelled) setIsLoadingImages(false)
        }
      }
      fetchImageUrls()
    } else {
      setImageUrls({})
      setIsLoadingImages(false)
    }

    if (cardAny.terms_and_conditions?.length) {
      setIsLoadingTerms(true)
      const fetchTermsUrls = async () => {
        try {
          const results = await Promise.all(
            cardAny.terms_and_conditions!.map(async (term, index) => {
              try {
                const response = await fetchPresignedURL(term.file_url!)
                const url =
                  typeof response === 'string'
                    ? response
                    : ((response as { url?: string })?.url ?? (response as string))
                return { key: toRecordKey(term.id ?? term.file_name, index), url: url ?? null }
              } catch {
                return { key: toRecordKey(term.id ?? term.file_name, index), url: null }
              }
            }),
          )
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((r) => {
              if (r.url) urlMap[r.key] = r.url
            })
            setTermsUrls(urlMap)
            setIsLoadingTerms(false)
          }
        } catch {
          if (!cancelled) setIsLoadingTerms(false)
        }
      }
      fetchTermsUrls()
    } else {
      setTermsUrls({})
      setIsLoadingTerms(false)
    }
    return () => {
      cancelled = true
    }
  }, [card, fetchPresignedURL])

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
      images?: { id?: unknown; file_name?: string; file_url?: string }[]
      product?: string
    } | null
    if (!c?.images) return []
    return c.images.map((img, index) => {
      const key = toRecordKey(img.id ?? img.file_name, index)
      const src =
        imageUrls[key] ||
        (img.file_url?.startsWith('http://') || img.file_url?.startsWith('https://')
          ? img.file_url
          : '') ||
        (img.file_url?.startsWith('data:') ? img.file_url : '') ||
        ''
      return { src, alt: `${c.product} image ${index + 1}` }
    })
  }, [card, imageUrls])

  const displayPrice = card ? parseFloat(String((card as { price?: unknown }).price)) || 0 : 0
  const cardBackground = getCardBg(card?.type)

  return {
    id,
    card,
    isLoading,
    redemptionBranches,
    termsUrls,
    isLoadingImages,
    isLoadingTerms,
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
