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
import { FEATURED_CARDS_MOCKS } from '@/mocks'
import type { FeaturedCardProps } from '@/types'
import { useNavigate } from 'react-router-dom'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  return (
    <section className="py-12 bg-[#faf9fc]">
      <div className="wrapper flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[clamp(22px,2.4vw,28px)] font-extrabold text-gray-900">
            Featured Cards
          </h2>
          <button
            className="inline-flex items-center justify-center border-none rounded-full px-[18px] py-3 font-extrabold cursor-pointer transition-all duration-200 ease-in-out shadow-[0_8px_22px_rgba(0,0,0,0.18)] bg-white text-primary-500 hover:-translate-y-px active:translate-y-0 hover:bg-primary-500 hover:text-white"
            type="button"
          >
            DashX
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURED_CARDS_MOCKS.map((card: FeaturedCardProps, idx: number) => (
            <CardItems key={idx} {...card} onGetQard={() => navigate(`/vendor/${card.title}`)} />
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
