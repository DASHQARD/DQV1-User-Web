import { CardItems } from '../CardItems'
import { useNavigate } from 'react-router-dom'
import { useCards } from '../../hooks/useCards'
import type { PublicCardResponse } from '@/types/cards'
import { Loader, Text } from '@/components'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  const { usePublicCardsService } = useCards()
  const { data: cards, isLoading } = usePublicCardsService()

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="px-6 pt-6 flex items-center justify-between">
            <Text variant="h3" weight="medium" className="text-gray-900">
              Featured Cards
            </Text>
            <button className="text-sm font-medium text-[#014fd3]">See more</button>
          </div>
        </div>

        <div className="px-6 pb-6 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cards?.data?.map((card: PublicCardResponse) => (
                <CardItems
                  key={card.card_id}
                  id={card.card_id}
                  product={card.product}
                  vendor_name={card.vendor_name || ''}
                  rating={card.rating || 0}
                  price={card.price}
                  currency={card.currency}
                  type={card.type as 'DashX' | 'dashpro' | 'dashpass' | 'dashgo'}
                  description={card.description}
                  expiry_date={card.expiry_date}
                  terms_and_conditions={card.terms_and_conditions || []}
                  created_at={card.created_at || new Date().toISOString()}
                  created_by={null}
                  fraud_flag={false}
                  fraud_notes={null}
                  images={(card.images || []).map((img) => ({
                    id: img.id,
                    file_url: img.file_url,
                    file_name: img.file_name,
                    created_at: img.created_at || new Date().toISOString(),
                    updated_at: img.updated_at || new Date().toISOString(),
                  }))}
                  is_activated={false}
                  issue_date={card.created_at || new Date().toISOString()}
                  last_modified_by={null}
                  status={card.status || 'active'}
                  updated_at={card.updated_at || new Date().toISOString()}
                  vendor_id={card.vendor_id}
                  onGetQard={() => navigate(`/card/${card.card_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
