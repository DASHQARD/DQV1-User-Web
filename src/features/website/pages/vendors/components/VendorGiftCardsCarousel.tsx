import { useCallback, useEffect, useRef, useState } from 'react'

import { EmptyState } from '@/components'
import { Icon } from '@/libs'
import { EmptyStateImage } from '@/assets/images'
import type { FeaturedCardProps } from '@/types'
import { CardItems } from '@/features/website/components/CardItems'

const CARD_WIDTH = 300
const CARD_GAP = 16

type VendorGiftCardsCarouselProps = {
  title?: string
  cards: FeaturedCardProps[]
  emptyTitle?: string
  emptyDescription?: string
}

function getCardKey(card: FeaturedCardProps, index: number) {
  return `${card.card_id ?? index}-${card.branch_name ?? card.vendor_name ?? index}`
}

export function VendorGiftCardsCarousel({
  title = 'Best Sellers',
  cards,
  emptyTitle = 'No gift cards yet',
  emptyDescription = 'This vendor has not published preset cards yet. Check back soon.',
}: VendorGiftCardsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [cards.length, updateScrollState])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const step = CARD_WIDTH + CARD_GAP
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  if (cards.length === 0) {
    return (
      <section className="py-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h2>
        <div className="mt-6">
          <EmptyState image={EmptyStateImage} title={emptyTitle} description={emptyDescription} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h2>
        {cards.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={atStart}
              aria-label="Previous cards"
              className="flex size-10 items-center justify-center rounded-full bg-[#402D87]/10 text-[#402D87] transition-colors hover:bg-[#402D87]/20 disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon icon="bi:chevron-left" className="text-xl" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={atEnd}
              aria-label="Next cards"
              className="flex size-10 items-center justify-center rounded-full bg-[#402D87] text-white transition-colors hover:bg-[#2d1a72] disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon icon="bi:chevron-right" className="text-xl" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="-mx-4 flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth px-4 pb-2 md:-mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${title} carousel`}
      >
        {cards.map((card, index) => (
          <div
            key={getCardKey(card, index)}
            className="w-[min(300px,calc(100vw-48px))] shrink-0 snap-start"
          >
            <CardItems {...card} density="compact" />
          </div>
        ))}
      </div>
    </section>
  )
}
