import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useGuestAddToCartModalStore } from '@/stores'
import { useCart } from './useCart'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/format'
import { getCardBackground, getCardTypeName } from '@/utils/cardDisplay'

export type CardItemHookProps = {
  card_id?: number
  product: string
  branch_name?: string
  branch_location?: string
  vendor_name?: string
  buttonText?: string
  rating?: number
  price: string | number
  currency?: string
  type?: string
  onGetQard?: () => void
}

export function useCardItem(props: CardItemHookProps) {
  const {
    card_id,
    product,
    branch_name,
    branch_location,
    vendor_name,
    buttonText = 'Quick Add',
    rating = 0,
    price,
    currency = 'GHS',
    type,
    onGetQard,
  } = props

  const [isHovered, setIsHovered] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()
  const openGuestAddToCartModal = useGuestAddToCartModalStore((s) => s.open)
  const navigate = useNavigate()

  const roundedRating = useMemo(() => Math.round(rating), [rating])
  const cardBackground = useMemo(() => getCardBackground(type), [type])
  const cardTypeName = useMemo(() => getCardTypeName(type), [type])
  const displayPrice = useMemo(() => formatCurrency(price, currency) || 0, [price, currency])

  const handleQuickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (onGetQard) {
      onGetQard()
      return
    }
    if (!card_id) {
      console.error('Card ID is required to add item to cart')
      return
    }
    if (!isAuthenticated) {
      const priceNum = typeof price === 'string' ? parseFloat(price) : Number(price)
      openGuestAddToCartModal({
        card_id,
        product,
        price: Number.isFinite(priceNum) ? priceNum : 0,
        type,
        currency,
      })
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
  }
}
