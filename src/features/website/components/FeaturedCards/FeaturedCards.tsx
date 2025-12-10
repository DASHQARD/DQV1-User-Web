import { CardItems } from '../CardItems'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useCards } from '../../hooks/useCards'
import type { PublicCardResponse } from '@/types/cards'
import { Loader, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@/components'

type CardFilter = 'dashx' | 'dashpass'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<CardFilter>('dashx')
  const { usePublicCardsService } = useCards()
  const { data: publicCardsResponse, isLoading } = usePublicCardsService()

  // Get all dashx and dashpass cards
  const allCards = useMemo(() => {
    if (!publicCardsResponse?.data) {
      return []
    }

    const cards = publicCardsResponse.data as unknown as PublicCardResponse[]

    // Filter to only include dashx and dashpass cards (case-insensitive)
    return cards.filter((card) => {
      const cardType = card.type?.toLowerCase()
      return cardType === 'dashx' || cardType === 'dashpass' || cardType === 'dashpro'
    })
  }, [publicCardsResponse])

  // Helper function to render card items
  const renderCardItems = (cards: PublicCardResponse[]) => {
    if (cards.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-grey-500">
            No {activeTab === 'dashx' ? 'DashX' : 'DashPass'} cards available
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card: PublicCardResponse) => (
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
    )
  }

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CardFilter)}>
          <div className="flex flex-col gap-4">
            <div className="px-6 pt-6 flex items-center justify-between">
              <Text variant="h3" weight="medium" className="text-gray-900">
                Featured Cards
              </Text>
              <button className="text-sm font-medium text-[#014fd3]">See more</button>
            </div>

            <TabsList className="px-6">
              <TabsTrigger value="dashx">DashX</TabsTrigger>
              <TabsTrigger value="dashpass">DashPass</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : (
              <>
                <TabsContent value="dashx" className="mt-0">
                  {renderCardItems(allCards.filter((card) => card.type?.toLowerCase() === 'dashx'))}
                </TabsContent>
                <TabsContent value="dashpass" className="mt-0">
                  {renderCardItems(
                    allCards.filter(
                      (card) =>
                        card.type?.toLowerCase() === 'dashpass' ||
                        card.type?.toLowerCase() === 'dashpro',
                    ),
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </section>
  )
}
