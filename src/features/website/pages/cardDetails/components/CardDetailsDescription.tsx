import { useState } from 'react'
import { Icon } from '@/libs'
import { CARD_DETAILS_PANEL, DESCRIPTION_COLLAPSE_THRESHOLD } from '../cardDetailsUtils'

type CardDetailsDescriptionProps = {
  description: string
}

export function CardDetailsDescription({ description }: CardDetailsDescriptionProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = description.length > DESCRIPTION_COLLAPSE_THRESHOLD
  const showCollapsed = isLong && !expanded

  return (
    <section className={CARD_DETAILS_PANEL}>
      <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3">About this card</h2>
      <p
        className={`text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line ${
          showCollapsed ? 'line-clamp-5' : ''
        }`}
      >
        {description}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          {expanded ? 'Show less' : 'Read more'}
          <Icon
            icon={expanded ? 'bi:chevron-up' : 'bi:chevron-down'}
            className="size-4"
          />
        </button>
      )}
    </section>
  )
}
