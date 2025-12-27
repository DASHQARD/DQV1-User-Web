import { CardItems } from '../CardItems'
import { useNavigate } from 'react-router-dom'
import { Loader, Text } from '@/components'
import { usePublicCatalog } from '../../hooks/website'

export const FeaturedCards = () => {
  const navigate = useNavigate()
  const { publicCards, isLoading } = usePublicCatalog()

  return (
    <section className="py-12">
      <div className="wrapper flex flex-col gap-4 bg-white rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="px-6 pt-6 flex items-center justify-between">
            <Text variant="h3" weight="medium" className="text-gray-900">
              Featured Cards
            </Text>
            <button
              onClick={() => navigate('/dashqards')}
              className="text-sm font-medium text-[#014fd3] hover:underline"
            >
              See more
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicCards
                ?.filter(
                  (card: any) =>
                    card.type.toLowerCase() === 'dashx' || card.type.toLowerCase() === 'dashpass',
                )
                .map((card: any) => (
                  <CardItems {...card} onGetQard={() => navigate(`/card/${card.card_id}`)} />
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
