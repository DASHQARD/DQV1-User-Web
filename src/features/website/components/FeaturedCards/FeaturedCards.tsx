import { useRef } from 'react'
import { CardItems } from '../CardItems'
import { useNavigate } from 'react-router-dom'
import { Loader, Text, EmptyState } from '@/components'
import { useFeaturedCards, type FeaturedCardSection } from '../../hooks/website'
import { Icon } from '@/libs'
import EmptyStateImage from '@/assets/images/empty-state.png'

function getFeaturedCardKey(
  card: { card_id?: number; id?: number; branch_name?: string; branch_id?: number },
  index: number,
) {
  return `${card.card_id || card.id}-${card.branch_name || card.branch_id || index}`
}

type FeaturedCardTypeSectionProps = {
  section: FeaturedCardSection
  isLoading: boolean
}

function FeaturedCardTypeSection({ section, isLoading }: FeaturedCardTypeSectionProps) {
  const navigate = useNavigate()
  const mobileCarouselRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 max-md:px-2">
        <Text variant="h3" weight="medium" className="text-gray-900">
          {section.label}
        </Text>
        <button
          type="button"
          onClick={() => navigate('/dashqards')}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-[#014fd3] hover:text-[#0139a8] whitespace-nowrap shrink-0"
        >
          All
          <Icon icon="bi:chevron-right" className="size-4" aria-hidden />
        </button>
      </div>

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 px-4">
            <Loader />
          </div>
        ) : section.cards.length === 0 ? (
          <div className="px-4">
            <EmptyState
              image={EmptyStateImage}
              title={`No ${section.label} cards available`}
              description="Check back soon for new cards or browse our full collection."
            />
          </div>
        ) : (
          <>
            <div
              ref={mobileCarouselRef}
              className="md:hidden flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory pl-2 pr-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label={`${section.label} cards carousel`}
            >
              {section.cards.map((card: any, index: number) => (
                <div
                  key={getFeaturedCardKey(card, index)}
                  className="snap-start shrink-0 w-[min(300px,calc(100vw-1rem))]"
                >
                  <CardItems {...card} />
                </div>
              ))}
            </div>

            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.cards.map((card: any, index: number) => (
                <CardItems key={getFeaturedCardKey(card, index)} {...card} density="compact" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const FeaturedCards = () => {
  const { sections, isLoading } = useFeaturedCards()

  return (
    <section className="w-full max-md:bg-transparent max-md:shadow-none max-md:border-0 md:rounded-2xl md:bg-white md:shadow-sm md:border md:border-gray-100/80">
      <div className="flex flex-col gap-4 md:gap-8 md:p-8 lg:p-10">
        {sections.map((section) => (
          <FeaturedCardTypeSection key={section.id} section={section} isLoading={isLoading} />
        ))}
      </div>
    </section>
  )
}
