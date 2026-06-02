import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore, useGuestLocalCartStore } from '@/stores'
import { useCart } from './useCart'
import { useCartStore } from '@/stores/cart'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatCurrency } from '@/utils/format'
import { getCardBackground, getCardTypeName, getCardDisplayName } from '@/utils/cardDisplay'
import { ensureGuestCartAndAddCard } from '@/features/website/services/cards'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import { pickGuestCartIdentityFields } from '@/utils/guestContact'
import { assertGuestCartAmountWithinLimit } from '@/features/website/utils/validateGuestLocalCart'
import { CARD_EXPIRED_MESSAGE, isCatalogCardPurchasable } from '@/utils/cardExpiry'
import { useToast } from '@/hooks'

export type CardItemHookProps = {
  card_id?: string | number
  product: string
  card_name?: string
  branch_name?: string
  branch_location?: string
  vendor_name?: string
  buttonText?: string
  rating?: number
  price: string | number
  currency?: string
  type?: string
  status?: string
  expiry_date?: string
  onGetQard?: () => void
}

export function useCardItem(props: CardItemHookProps) {
  const {
    card_id,
    product,
    card_name,
    branch_name,
    branch_location,
    vendor_name,
    buttonText = 'Quick Add',
    rating = 0,
    price,
    currency = 'GHS',
    type,
    status,
    expiry_date,
    onGetQard,
  } = props

  const [isHovered, setIsHovered] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const user = useAuthStore((state) => state.user)
  const getGuestCartId = useAuthStore((state) => state.getGuestCartId)
  const getGuestCartUuid = useAuthStore((state) => state.getGuestCartUuid)
  const setGuestCartId = useAuthStore((state) => state.setGuestCartId)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()
  const addLocalGuestCard = useGuestLocalCartStore((s) => s.addCatalogCard)
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()

  const roundedRating = useMemo(() => Math.round(rating), [rating])
  const cardBackground = useMemo(() => getCardBackground(type), [type])
  const cardTypeName = useMemo(() => getCardTypeName(type), [type])
  const displayPrice = useMemo(() => formatCurrency(price, currency) || 0, [price, currency])
  const displayProduct = useMemo(
    () => getCardDisplayName(product, card_name, { type }),
    [product, card_name, type],
  )

  const isPurchasable = useMemo(
    () => isCatalogCardPurchasable({ status, expiry_date }),
    [status, expiry_date],
  )

  const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!isPurchasable) {
      toast.error(CARD_EXPIRED_MESSAGE)
      return
    }
    if (!card_id) {
      console.error('Card ID is required to add item to cart')
      return
    }
    const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price)
    const pending = {
      card_id: String(card_id),
      product,
      price: Number.isFinite(priceNum) ? priceNum : 0,
      type,
      currency,
    }

    if (!isAuthenticated || isGuestAuth) {
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
          assertGuestCartAmountWithinLimit(priceNum)
          await ensureGuestCartAndAddCard({
            card_id: String(card_id),
            amount: priceNum,
            ...pickGuestCartIdentityFields(guestName, guestEmail),
            getGuestCartId,
            getGuestCartUuid,
            setGuestCartId,
            setGuestCartUuid: useAuthStore.getState().setGuestCartUuid,
          })
          queryClient.invalidateQueries({ queryKey: ['cart-items'] })
          openCart()
        } catch (err: unknown) {
          toast.error(getApiErrorMessage(err, 'Failed to add item to cart'))
        }
        return
      }
      try {
        addLocalGuestCard({
          card_id: String(card_id),
          product,
          price: pending.price,
          currency,
          type,
        })
        openCart()
        toast.success('Added to cart')
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, 'Failed to add item to cart'))
      }
      return
    }
    if (onGetQard) {
      onGetQard()
      return
    }
    try {
      await addToCartAsync({ card_id, quantity: 1 })
      openCart()
    } catch (error) {
      console.error('Failed to add item to cart', error)
    }
  }

  const handleCardClick = () => {
    if (onGetQard) {
      onGetQard()
    } else if (card_id) {
      navigate(`/card/${card_id}`)
    }
  }

  return {
    // state
    isHovered,
    setIsHovered,
    // derived
    roundedRating,
    cardBackground,
    cardTypeName,
    displayPrice,
    displayProduct,
    // handlers
    handleQuickAdd,
    handleCardClick,
    // passthrough for UI
    product,
    branch_name,
    branch_location,
    vendor_name,
    buttonText,
    rating,
    isAdding,
    isPurchasable,
  }
}
