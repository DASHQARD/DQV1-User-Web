import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components'
import { CardItems } from '../CardItems'
import { allQards } from '@/mocks/featuredCards'
import type { FeaturedCardProps } from '@/types'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useCards } from '../../hooks/useCards'

type CardFilter = 'all' | 'dashx' | 'dashpass'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<CardFilter>('all')
  const { usePublicCardsService } = useCards()
  const { data: publicCards } = usePublicCardsService()
  console.log('publicCards', publicCards)

  // Filter cards based on active filter
  // Note: DashPass maps to dashpro in the mocks
  const featuredCards = useMemo(() => {
    let filtered = allQards

    if (activeFilter === 'dashx') {
      filtered = allQards.filter((card) => card.type === 'dashx')
    } else if (activeFilter === 'dashpass') {
      // DashPass corresponds to DashPro in the mocks
      filtered = allQards.filter((card) => card.type === 'dashpro')
    } else {
      // Show both DashX and DashPass (DashPro) cards
      filtered = allQards.filter((card) => card.type === 'dashx' || card.type === 'dashpro')
    }

    return filtered as FeaturedCardProps[]
  }, [activeFilter])

  return (
    <section className="py-12 bg-[#faf9fc]">
      <div className="wrapper flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[clamp(22px,2.4vw,28px)] font-extrabold text-gray-900">
            Featured Cards
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`inline-flex items-center justify-center border-none rounded-full px-[18px] py-3 font-extrabold cursor-pointer transition-all duration-200 ease-in-out shadow-[0_8px_22px_rgba(0,0,0,0.18)] ${
                activeFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-primary-500 hover:-translate-y-px active:translate-y-0 hover:bg-primary-500 hover:text-white'
              }`}
              type="button"
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('dashx')}
              className={`inline-flex items-center justify-center border-none rounded-full px-[18px] py-3 font-extrabold cursor-pointer transition-all duration-200 ease-in-out shadow-[0_8px_22px_rgba(0,0,0,0.18)] ${
                activeFilter === 'dashx'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-primary-500 hover:-translate-y-px active:translate-y-0 hover:bg-primary-500 hover:text-white'
              }`}
              type="button"
            >
              DashX
            </button>
            <button
              onClick={() => setActiveFilter('dashpass')}
              className={`inline-flex items-center justify-center border-none rounded-full px-[18px] py-3 font-extrabold cursor-pointer transition-all duration-200 ease-in-out shadow-[0_8px_22px_rgba(0,0,0,0.18)] ${
                activeFilter === 'dashpass'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-primary-500 hover:-translate-y-px active:translate-y-0 hover:bg-primary-500 hover:text-white'
              }`}
              type="button"
            >
              DashPass
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredCards.map((card: FeaturedCardProps, idx: number) => (
            <CardItems
              key={idx}
              title={card.title}
              subtitle={card.subtitle}
              imageUrl={card.imageUrl}
              rating={card.rating}
              reviews={card.reviews}
              price={card.price}
              type={card.type}
              onGetQard={() => navigate(`/vendor/${card.title}`)}
            />
          ))}
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  )
}
